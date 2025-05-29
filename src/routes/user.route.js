import { Router } from "express";
import {donate} from "../controllers/user.controller.js";

const router = Router();

router.route("/donate").post(donate)

export default router;
