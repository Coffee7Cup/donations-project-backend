import jwt from "jsonwebtoken";
import axios from "axios";
import Payment from "../models/payment.model.js";
import Donor from "../models/donors.models.js";

// PAYMENT VERIFICATION CONTROLLER
const verifyPayment = async (req, res) => {
  const BASE_URL = process.env.INSTAMOJO_BASE_URL || "https://api.instamojo.com/v2/";
  const { payment_request_id, payment_id } = req.query;

  if (!payment_request_id || !payment_id) {
    return res.status(400).json({ success: false, message: "Missing parameters" });
  }

  try {
    const response = await axios.get(
      `${BASE_URL}payment-requests/${payment_request_id}/${payment_id}/`,
      {
        headers: {
          "X-Api-Key": process.env.INSTAMOJO_API_KEY,
          "X-Auth-Token": process.env.INSTAMOJO_AUTH_TOKEN,
        },
      }
    );

    const payment = response.data.payment_request.payment;
    const status = payment.status === "Credit" ? "Credit" : (payment.status || "Failed");

    const donorJwt = status === "Credit"
      ? jwt.sign({ email: payment.email }, process.env.JWT_SECRET, { expiresIn: "7d" })
      : null;

    await Payment.findOneAndUpdate(
      { paymentId: payment.payment_id },
      {
        paymentId: payment.payment_id,
        paymentRequestId: payment.payment_request_id,
        status,
        amount: parseFloat(payment.amount),
        buyerName: payment.buyer_name,
        email: payment.email,
        phone: payment.phone,
        purpose: payment.purpose,
        donorJwt,
        detailsUploaded: false,
      },
      { upsert: true, new: true }
    );

    if (status === "Credit") {
      return res.json({
        success: true,
        email: payment.email,
        donorType: "mega",
        jwt: donorJwt,
      });
    } else {
      return res.status(400).json({ success: false, message: "Payment not credited" });
    }
  } catch (err) {
    console.error("Verification error:", err?.response?.data || err.message);
    return res.status(500).json({ success: false, message: "Verification failed" });
  }
};

// DONOR DETAILS UPLOAD CONTROLLER
const uploadDetailsMegaDonor = async (req, res) => {
  try {
    const { name, donation, date, type } = req.body;
    const email = req.email;

    const imageUrl = `data:image/jpeg;base64,${req.file.buffer.toString("base64")}`;

    await Donor.create({
      name,
      donation,
      date,
      type,
      image: imageUrl,
    });

    await Payment.findOneAndUpdate({ email }, { detailsUploaded: true });

    res.json({ success: true, message: "Donor details uploaded" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

export { verifyPayment, uploadDetailsMegaDonor };

