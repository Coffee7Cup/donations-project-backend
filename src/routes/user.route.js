import { Router } from "express";
import {donateCashFree, confirmDonationCashFree, createOrderInstaMojo} from "../controllers/user.controller.js";
import { verifyPayment } from "../controllers/donor.controller.js";

const router = Router();

router.route("/donate").post(createOrderInstaMojo)
router.route("verify-payment").get(verifyPayment);



export default router;
