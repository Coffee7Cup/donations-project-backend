import { Router } from "express";
import multer from "multer";
import {
  verifyPayment,
  uploadDetailsMegaDonor,
  uploadDetailsPremiumDonor,
  getAllDonors,
  uploadDonorDetails
} from "../controllers/donor.controller.js";
import verifyJWT from "../middleware/verifyjwt.middleware.js";
import { Payment } from "../models/payment.model.js";
import donorRedirectMiddleware from "../middleware/donorRedirect.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/verify-payment", verifyPayment);
router.get("/route-donor", donorRedirectMiddleware)

router.post("/upload", verifyJWT, upload.single("image"), uploadDonorDetails);
router.get("/get-donors", getAllDonors)

export default router;


