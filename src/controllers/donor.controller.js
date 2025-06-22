import sharp from "sharp";
import { Payment } from "../models/payment.model.js";
import { Donor } from "../models/donors.models.js";
import cloudinary from "../utils/cloudinary.js";

// Mega donor upload
const uploadDetailsMegaDonor = async (req, res) => {
  try {
    const { name, donation, date } = req.body;
    const paymentId = req.jwt.paymentId;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.uploadCount >= 2) {
      return res.status(403).json({ success: false, message: "Upload limit reached for this donor" });
    }

    if (!name || !donation || !date || !req.file?.buffer) {
      return res.status(400).json({ success: false, message: "Missing required fields for mega donor" });
    }

    const compressedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1024 })
      .jpeg({ quality: 70 })
      .toBuffer();

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "donors" },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(compressedBuffer);
    });

    await Donor.findOneAndUpdate(
      { paymentId }, 
      {
        name,
        donation,
        date,
        type: "mega",
        image: result.secure_url,
      },
      { upsert: true, new: true } // create if not exists
    );
    await Payment.findByIdAndUpdate(paymentId, {
      detailsUploaded: true,
      $inc: { uploadCount: 1 }
    });

    res.json({ success: true, message: "Mega donor details uploaded" });
  } catch (err) {
    console.error("Mega upload error:", err);
    res.status(500).json({ success: false, message: "Mega donor upload failed" });
  }
};

// Premium donor upload
const uploadDetailsPremiumDonor = async (req, res) => {
  try {
    const { name, donation, date } = req.body;
    const paymentId = req.jwt.paymentId;

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ success: false, message: "Payment not found" });
    }

    if (payment.uploadCount >= 2) {
      return res.status(403).json({ success: false, message: "Upload limit reached for this donor" });
    }

    if (!name || !donation || !date) {
      return res.status(400).json({ success: false, message: "Missing required fields for premium donor" });
    }

    await Donor.findOneAndUpdate(
      { paymentId },
      {
        name,
        donation,
        date,
        type: "premium",
      },
      { upsert: true, new: true }
    );

    await Payment.findByIdAndUpdate(paymentId, {
      detailsUploaded: true,
      $inc: { uploadCount: 1 }
    });

    res.json({ success: true, message: "Premium donor details uploaded" });
  } catch (err) {
    console.error("Premium upload error:", err);
    res.status(500).json({ success: false, message: "Premium donor upload failed" });
  }
};


// Smart redirect based on donorType
const uploadDonorDetails = async (req, res, next) => {

  try {

    if(!req.file?.buffer){
      return uploadDetailsPremiumDonor(req, res)
    }else{
      return uploadDetailsMegaDonor(req, res)
    }

  } catch (err) {
    console.error("Donor details upload error:", err);
    next(err);
  }
};

// Get all donors
const getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().sort({ createdAt: -1 });
    res.json({ success: true, donors });
  } catch (err) {
    console.error("Error fetching donors:", err);
    res.status(500).json({ success: false, message: "Failed to fetch donors" });
  }
};

// Get donations by email or phone
const getDonationsByIdentifier = async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    return res.status(400).json({ success: false, message: "Identifier required" });
  }

  try {
    const donations = await Payment.find({
      status: "paid",
      $or: [{ email: identifier }, { phone: identifier }],
    }).sort({ createdAt: -1 });

    if (donations.length === 0) {
      return res.json({ success: false, message: "No donations found" });
    }

    res.json({ success: true, donations });
  } catch (err) {
    console.error("Error fetching donations:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const getDonorType = async (req, res) => {
  try{
    
    const paymentId = req.jwt.paymentId

    const payment = await Payment.findOne({_id : paymentId})
    if (!payment || !payment.donorType) {
      return res.status(404).json({ success: false, message: "Donor type not found" });
    }
    
    return res
      .json({
        success : true,
        type : payment.donorType
      })

  }catch(err){
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
 }
}

export {
  uploadDonorDetails,
  getAllDonors,
  getDonationsByIdentifier,
  getDonorType,
};

