import { Router } from "express";
import {donateCashFree, confirmDonationCashFree, createOrderInstaMojo} from "../controllers/user.controller.js";

const router = Router();

router.route("/donate").post( createOrderInstaMojo)

export default router;
