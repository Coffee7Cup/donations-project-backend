import mongoose from "mongoose";
import bcrypt from "bcrypt";

const paymentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    razorpayOrderId: {
      type: String,
      required: true,
    },
    razorpayPaymentId: {
      type: String,
    },
    razorpaySignature: {
      type: String,
    },
    status: {
      type: String,
      enum: ["created", "paid", "failed"],
      default: "created",
    },
     uploadCount: {
      type: Number,
      default: 0,
    },
    detailsUploaded: {
      type: Boolean,
      default: false,
    },

    donorType : {
      type : String,
      enum : ['mega', 'premium']
    },
    donorJwt: {
      type: String,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();

  // Hash the password before savings
  try{
    const salt = bcrypt.genSalt(10);
    this.password = bcrypt.hash(this.password, salt);
    next();
  }catch(err){
    next(err);
  }
})

paymentSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Payment = mongoose.model("Payment", paymentSchema);

