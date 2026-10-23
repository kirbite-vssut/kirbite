import Vendor from '../models/Vendor.js';
import MenuItem from '../models/MenuItem.js';
import Order from '../models/Order.js';
import { getIsConnected } from '../config/db.js';
import { initialStalls, initialMenuItems } from '../data/seedData.js';

// In-memory fallbacks when MongoDB is not running locally
let memoryStalls = JSON.parse(JSON.stringify(initialStalls));
let memoryMenuItems = JSON.parse(JSON.stringify(initialMenuItems));
let memoryOrders = [];

// Seed MongoDB if connected and empty
export const seedMongoIfEmpty = async () => {
  if (!getIsConnected()) return;
  try {
    const stallCount = await Vendor.countDocuments();
    if (stallCount === 0) {
      console.log('[Seed] Seeding initial Kirba Chowk stalls to MongoDB...');
      await Vendor.insertMany(initialStalls);
      await MenuItem.insertMany(initialMenuItems);
      console.log('[Seed] Initial stalls and menus seeded successfully.');
    }
  } catch (err) {
    console.error('[Seed Error] Could not auto-seed MongoDB:', err.message);
  }
};

export const dataStore = {
  // Stalls
  getAllStalls: async () => {
    if (getIsConnected()) {
      return await Vendor.find().sort({ isOpen: -1, rating: -1 });
    }
    return [...memoryStalls].sort((a, b) => (b.isOpen === a.isOpen ? 0 : b.isOpen ? 1 : -1));
  },

  getStallById: async (stallId) => {
    if (getIsConnected()) {
      return await Vendor.findById(stallId);
    }
    return memoryStalls.find((s) => s._id.toString() === stallId.toString()) || null;
  },

  updateStallStatus: async (stallId, isOpen) => {
    if (getIsConnected()) {
      return await Vendor.findByIdAndUpdate(
        stallId,
        { isOpen },
        { new: true, runValidators: true }
      );
    }
    const stall = memoryStalls.find((s) => s._id.toString() === stallId.toString());
    if (stall) {
      stall.isOpen = Boolean(isOpen);
      return { ...stall };
    }
    return null;
  },

  // Menu items
  getMenuItemsByStall: async (stallId) => {
    if (getIsConnected()) {
      return await MenuItem.find({ stallId });
    }
    return memoryMenuItems.filter((m) => m.stallId.toString() === stallId.toString());
  },

  // Orders
  createOrder: async (orderPayload) => {
    if (getIsConnected()) {
      const newOrder = new Order(orderPayload);
      return await newOrder.save();
    }
    const newOrder = {
      _id: 'ord_' + Date.now() + Math.random().toString(36).substring(2, 6),
      ...orderPayload,
      orderStatus: orderPayload.orderStatus || 'Received',
      paymentStatus:
        orderPayload.paymentStatus ||
        (orderPayload.paymentMode === 'CASH' ? 'Cash_On_Delivery' : 'Pending'),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memoryOrders.unshift(newOrder);
    return newOrder;
  },

  getOrdersByVendor: async (stallId) => {
    if (getIsConnected()) {
      return await Order.find({ stallId }).sort({ createdAt: -1 });
    }
    return memoryOrders
      .filter((o) => o.stallId.toString() === stallId.toString())
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  getOrderById: async (orderId) => {
    if (getIsConnected()) {
      return await Order.findById(orderId);
    }
    return memoryOrders.find((o) => o._id.toString() === orderId.toString()) || null;
  },

  updateOrderStatus: async (orderId, { orderStatus, paymentStatus }) => {
    if (getIsConnected()) {
      const updateData = {};
      if (orderStatus) updateData.orderStatus = orderStatus;
      if (paymentStatus) updateData.paymentStatus = paymentStatus;
      return await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    }
    const order = memoryOrders.find((o) => o._id.toString() === orderId.toString());
    if (order) {
      if (orderStatus) order.orderStatus = orderStatus;
      if (paymentStatus) order.paymentStatus = paymentStatus;
      order.updatedAt = new Date().toISOString();
      return { ...order };
    }
    return null;
  },
};
