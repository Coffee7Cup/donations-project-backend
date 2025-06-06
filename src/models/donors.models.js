import mongoose, { Schema } from 'mongoose';

const donorSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  donation: {
    type: String,
    required: function () {
      return this.type === 'mega' || this.type === 'premium';
    },
  },
  date: {
    type: Date,
    required: function () {
      return this.type === 'mega';
    },
  },
  image: {
    type: String,
    required: function () {
      return this.type === 'mega';
    },
  },
  type: {
    type: String,
    enum: ['mega', 'premium', 'contributor'],
    required: true,
  },
}, { timestamps: true });

export const Donor = mongoose.model('Donor', donorSchema);
