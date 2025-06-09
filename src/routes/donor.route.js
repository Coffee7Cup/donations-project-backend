import { Router } from "express";
import multer from "multer";
import {
  verifyPayment,
  uploadDetailsMegaDonor,
  uploadDetailsPremiumDonor,
  getAllDonors
} from "../controllers/donor.controller.js";
import verifyJWT from "../middleware/verifyjwt.middleware.js";
import { Payment } from "../models/payment.model.js";
import donorRedirectMiddleware from "../middleware/donorRedirect.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/verify", verifyPayment);
router.get("/route-donor", donorRedirectMiddleware)

router.post("/upload", verifyJWT, upload.single("image"), async (req, res, next) => {
  try {
    const email = req.email;

    // Fetch donorType from Payment DB using email
    const payment = await Payment.findOne({ email });
    if (!payment) return res.status(404).json({ success: false, message: "Payment info not found" });

    // Route to proper handler based on donorType
    if (payment.donorType === "mega") {
      return uploadDetailsMegaDonor(req, res, next);
    } else if (payment.donorType === "premium") {
      return uploadDetailsPremiumDonor(req, res, next);
    } else {
      return res.status(400).json({ success: false, message: "Unknown donor type" });
    }
  } catch (err) {
    next(err);
  }
});
router.get("/get-donors", getAllDonors)

export default router;


