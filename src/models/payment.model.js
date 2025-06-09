import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true,
  },
  paymentRequestId: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Credit", "Failed", "Pending"],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  buyerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
  },
  donorJwt: {
    type: String,
  },
  detailsUploaded: {
    type: Boolean,
    default: false,
  },
  donorType : {
    type: String,
    enum: ['mega', 'premium'],
 
  }
}, {
  timestamps: true, // createdAt and updatedAt
});

paymentSchema.pre('save', function(next) {
  if (this.amount > 5000) {
    this.donorType = 'mega';
  } else {
    this.donorType = 'premium';
  }
  next();
});


export const Payment = mongoose.model("Payment", paymentSchema);

