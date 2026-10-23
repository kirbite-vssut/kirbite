import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema(
  {
    stallName: {
      type: String,
      required: [true, 'Stall name is required'],
      trim: true,
    },
    ownerName: {
      type: String,
      required: [true, 'Owner name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    location: {
      type: String,
      default: 'Kirba Chowk',
      trim: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    upiId: {
      type: String,
      required: [true, 'UPI ID is required'],
      trim: true,
    },
    upiName: {
      type: String,
      required: [true, 'UPI Payee Name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 1,
      max: 5,
    },
    cuisine: {
      type: [String],
      default: ['Campus Snacks', 'Fast Food'],
    },
    deliveryTime: {
      type: String,
      default: '15-20 min',
    },
    bannerImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&auto=format&fit=crop&q=80',
    },
    description: {
      type: String,
      default: 'Popular student snack stall at Kirba Chowk',
    },
  },
  {
    timestamps: true,
  }
);

const Vendor = mongoose.model('Vendor', vendorSchema);
export default Vendor;
