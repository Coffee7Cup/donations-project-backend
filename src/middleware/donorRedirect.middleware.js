import jwt from "jsonwebtoken";
import Payment from "../models/payment.model.js";

const donorRedirectMiddleware = async (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const email = decoded.email;

    const payment = await Payment.findOne({ email });
    if (!payment || !payment.donorType) {
      return res.status(404).json({ success: false, message: "Donor type not found" });
    }

    const type = payment.donorType;

    // Respond with which page to redirect to
    return res.json({
      success: true,
      type,
    });

  } catch (err) {
    console.error("Donor redirect error:", err);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default donorRedirectMiddleware;

