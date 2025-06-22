import Razorpay from "razorpay";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { Payment } from "../models/payment.model.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// CREATE ORDER
export const createRazorpayOrder = async (req, res) => {
  try {
    const { name, email, phone, amount, password } = req.body;

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
      name,
      email,
      phone,
      amount,
      password,
      razorpayOrderId: order.id,
    });

    res.status(200).json({
      success: true,
      order,
      razorpayKey: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    console.error("Create order error:", err);
    res.status(500).json({ success: false, message: "Order creation failed" });
  }
};

// VERIFY PAYMENT
export const verifyRazorpayPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      name,
      email,
      phone,
      amount,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Missing payment info" });
    }

    const hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid signature" });
    }

    const donorType = amount >= 5000 ? "mega" : "premium";

    const token = jwt.sign(
      { phone, paymentId: razorpay_payment_id },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    const updated = await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        name,
        email,
        phone,
        amount,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: "paid",
        donorType,
        donorJwt: token,
      },
      { new: true }
    );

    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    res.status(200).json({
      success: true,
      message: "Payment verified",
      donorJwt: token,
      donorType,
    });
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ success: false, message: "Verification failed" });
  }
};

export const getDonorJWT = async (req, res) => {
  const { identifier, paymentId, password } = req.body;

  if (!identifier || !paymentId) {
    return res
      .status(400)
      .json({ success: false, message: "Identifier and paymentId required" });
  }

  const payment = await Payment.findOne({
    _id: paymentId,
  });

  if (!payment) {
    return res
      .status(404)
      .json({ success: false, message: "Payment not found" });
  }

  try {
    const isMatch = await payment.comparePassword(password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ success: false, message: "Incorrect password" });
    }
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Error checking password" });
  }

  const token = jwt.sign(
    { phone: payment.phone, paymentId: payment._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.json({ success: true, token });
};

export const cancelPayment = async (req, res) => {
  try {
    const orderId = req.body.order_id;

    await Payment.findOneAndDelete({ razorpayOrderId: orderId });

    return res
      .status(500)
      .json({ success: true, message: "payment deleted successfully" });
  } catch (err) {
    return res
      .status(400)
      .json({ success: false, message: "payment unable to delete" });
  }
};
