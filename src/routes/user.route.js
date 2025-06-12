import { Router } from "express";
import { createRazorpayOrder , verifyRazorpayPayment, getDonorJWT, cancelPayment} from "../controllers/user.controller.js";
import { Payment } from "../models/payment.model.js";


const router = Router();

router.route('/razorpay-create-order').post(createRazorpayOrder)
router.route('/razorpay-verify-payment').post(verifyRazorpayPayment)
router.route('/get-token').post(getDonorJWT)
router.route('/delete').post(cancelPayment)


router.route('/check').get(async (req, res) => {
  try {
    const payment = await Payment.findOne({ phone: '8099091323' });

    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment not found' });
    }

    return res.json({ success: true, payment });
  } catch (err) {
    console.error('Error fetching payment:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;
