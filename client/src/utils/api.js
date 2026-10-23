const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || '';
const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

export const api = {
  // Stalls
  getStalls: async () => {
    const res = await fetch(`${API_BASE}/stalls`);
    if (!res.ok) throw new Error('Failed to load stalls');
    return res.json();
  },

  getStallMenu: async (stallId) => {
    const res = await fetch(`${API_BASE}/stalls/${stallId}/menu`);
    if (!res.ok) throw new Error('Failed to load stall menu');
    return res.json();
  },

  updateStallStatus: async (stallId, isOpen) => {
    const res = await fetch(`${API_BASE}/stalls/${stallId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOpen }),
    });
    if (!res.ok) throw new Error('Failed to update stall status');
    return res.json();
  },

  // Orders
  createOrder: async (orderData) => {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to place order');
    return data;
  },

  getOrdersByVendor: async (stallId) => {
    const res = await fetch(`${API_BASE}/orders/vendor/${stallId}`);
    if (!res.ok) throw new Error('Failed to load vendor orders');
    return res.json();
  },

  getOrderById: async (orderId) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}`);
    if (!res.ok) throw new Error('Failed to load order');
    return res.json();
  },

  updateOrderStatus: async (orderId, { orderStatus, paymentStatus }) => {
    const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderStatus, paymentStatus }),
    });
    if (!res.ok) throw new Error('Failed to update order status');
    return res.json();
  },
};
