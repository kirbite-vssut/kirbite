import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    menuItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MenuItem',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, 'Customer phone number is required'],
      trim: true,
    },
    hostelDetails: {
      block: {
        type: String,
        required: [true, 'Hostel block is required'],
        trim: true,
      },
      room: {
        type: String,
        required: [true, 'Room number is required'],
        trim: true,
      },
    },
    stallId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'Stall ID is required'],
      index: true,
    },
    items: {
      type: [orderItemSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ['UPI', 'CASH'],
      required: true,
      default: 'UPI',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Cash_On_Delivery'],
      default: 'Pending',
    },
    orderStatus: {
      type: String,
      enum: ['Received', 'Preparing', 'Ready', 'Delivered', 'Cancelled'],
      default: 'Received',
    },
    orderNotes: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
