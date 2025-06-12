import { Router } from "express";
import multer from "multer";
import {
  uploadDonorDetails,
  getAllDonors,
  getDonationsByIdentifier,
  getDonorType
} from "../controllers/donor.controller.js";
import { verifyJWT } from "../middleware/verifyjwt.middleware.js";

const router = Router();

const upload = multer({ storage: multer.memoryStorage() });

router.route("/route-donor").get(verifyJWT, getDonorType);
router.route("/upload").post(verifyJWT, upload.single("image"), uploadDonorDetails);
router.route("/get-donors").get(getAllDonors);
router.route('/get-donations').post(getDonationsByIdentifier)

export default router;

