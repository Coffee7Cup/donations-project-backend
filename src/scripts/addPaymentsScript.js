import mongoose from "mongoose";
import { Payment } from "../models/payment.model.js" // adjust the path as needed
import bcrypt from "bcrypt";

// Connect to MongoDB
await mongoose.connect("mongodb+srv://nobodyknows010203:7dx8BFa9vukmpJvX@cluster0.dvy7xnb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"); 

const generatePayments = async () => {
  const payments = [];

  for (let i = 1; i <= 20; i++) {
    const rawPassword = `password${i}`;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    payments.push({
      name: `User ${i}`,
      email: `user${i}@example.com`,
      phone: `99999999${i.toString().padStart(2, "0")}`,
      amount: 1000 + i * 10,
      razorpayOrderId: `order_${i}`,
      razorpayPaymentId: `payment_${i}`,
      razorpaySignature: `signature_${i}`,
      status: i % 3 === 0 ? "failed" : i % 2 === 0 ? "paid" : "created",
      uploadCount: Math.floor(Math.random() * 3),
      detailsUploaded: i % 2 === 0,
      donorType: i % 2 === 0 ? "mega" : "premium",
      donorJwt: `jwt_token_${i}`,
      password: hashedPassword,
    });
  }

  try {
    await Payment.insertMany(payments);
    console.log("✅ Inserted 20 payment documents successfully.");
  } catch (err) {
    console.error("❌ Error inserting payments:", err);
  } finally {
    await mongoose.disconnect();
  }
};

generatePayments();

