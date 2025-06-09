import {Router} from "express";
import multer from "multer";
import { verifyPayment, uploadDetailsMegaDonor } from "../controllers/donor.controller.js";
import verifyJWT from "../middleware/verifyjwt.middleware.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get("/verify", verifyPayment);
router.post("/upload", verifyJWT, upload.single("image"), uploadDetailsMegaDonor);

export default router;

