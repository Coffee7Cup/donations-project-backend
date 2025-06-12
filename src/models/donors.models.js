import mongoose, { Schema } from 'mongoose';

const donorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  donation: {
    type: String,
    required: true, 
  },
  date: {
    type: Date,
    required: true,
  },
  paymentId : {
    type : String,
    required: true,
  },
  image: {
    type: String,
    required: function () {
      return this.type === 'mega';
    },
  },
  type: {
    type: String,
    enum: ['mega', 'premium'],
    required: true,
  },
}, { timestamps: true });

export const Donor = mongoose.model('Donor', donorSchema);
