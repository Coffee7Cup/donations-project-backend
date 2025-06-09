import jwt from "jsonwebtoken";
import axios from "axios";
import Payment from "../models/payment.model.js";
import Donor from "../models/donors.models.js";
import cloudinary from "../utils/cloudinary.js";
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

const uploadDetailsMegaDonor = async (req, res) => {
  try {
    const { name, donation, date } = req.body;
    const email = req.email;

    if (!name || !donation || !date || !req.file?.buffer) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Compress the image buffer using sharp
    const compressedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024 }) // optional: resize to max width 1024px, keep aspect ratio
      .jpeg({ quality: 70 }) // compress jpeg to 70% quality
      .toBuffer();

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "donors" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      // upload compressed image buffer instead of original
      stream.end(compressedBuffer);
    });

    // Save donor details
    await Donor.create({
      name,
      donation,
      date,
      type: 'mega',
      image: result.secure_url, // Cloudinary URL
    });

    // Mark payment as completed
    await Payment.findOneAndUpdate({ email }, { detailsUploaded: true });

    res.json({ success: true, message: "Donor details uploaded" });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

const uploadDetailsPremiumDonor = async (req, res) => {
  try {
    const { name, donation, date } = req.body;
    const email = req.email;

    if (!name || !donation || !date || !type) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    if (type !== "premium") {
      return res.status(400).json({ success: false, message: "Invalid donor type" });
    }

    await Donor.create({
      name,
      donation,
      date,
      type : 'premium',
    });

    await Payment.findOneAndUpdate({ email }, { detailsUploaded: true });

    res.json({ success: true, message: "Premium donor details uploaded" });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

const getAllDonors = async (req, res) => {

try {
    // Fetch all donors from DB, optionally you can paginate or filter later
    const donors = await Donor.find().sort({ createdAt: -1 }); // newest first

    res.json({ success: true, donors });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).json({ success: false, message: "Failed to fetch donors" });
  }
}

export { verifyPayment, uploadDetailsMegaDonor, uploadDetailsPremiumDonor, getAllDonors};

