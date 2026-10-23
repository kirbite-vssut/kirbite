import { create } from 'zustand';

export const useKirbiteStore = create((set, get) => ({
  // 1. AUTH STATE (02-AUTH-FLOW)
  user: (() => {
    try {
      const saved = localStorage.getItem('kirbite_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),

  // Profile setup step needed?
  needsProfileSetup: false,

  setUser: (user) => {
    if (user) {
      localStorage.setItem('kirbite_user', JSON.stringify(user));
      if (user.role === 'student') {
        localStorage.setItem('kfc_student_name', user.name || '');
        localStorage.setItem('kfc_student_phone', user.phone || '');
        localStorage.setItem('kfc_hostel_block', user.hostelBlock || '');
        localStorage.setItem('kfc_room_number', user.room || '');
      }
    } else {
      localStorage.removeItem('kirbite_user');
    }
    set({ user });
  },

  loginStudent: ({ name, phone, hostelBlock, room }) => {
    const studentUser = {
      role: 'student',
      name: (name || '').trim(),
      phone: (phone || '').trim(),
      hostelBlock: hostelBlock || 'CV Raman Hall',
      room: (room || '').trim(),
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name || 'student')}`,
      loggedAt: new Date().toISOString(),
    };
    get().setUser(studentUser);
    set({ needsProfileSetup: false });
    return studentUser;
  },

  updateStudentProfile: ({ name, phone, hostelBlock, room }) => {
    const current = get().user || {};
    const updated = {
      ...current,
      name: name !== undefined ? name.trim() : current.name,
      phone: phone !== undefined ? phone.trim() : current.phone,
      hostelBlock: hostelBlock || current.hostelBlock,
      room: room !== undefined ? room.trim() : current.room,
    };
    get().setUser(updated);
  },

  loginVendor: ({ stallId, stallName, ownerPin }) => {
    const vendorUser = {
      role: 'vendor',
      stallId,
      stallName,
      ownerPin,
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(stallName || 'stall')}`,
      loggedAt: new Date().toISOString(),
    };
    get().setUser(vendorUser);
    return vendorUser;
  },

  logout: () => {
    get().setUser(null);
    set({ activeShop: null, isEnteringShop: false });
  },

  // 2. SCENE & STORY STATE (03-SCENE-AND-STORY)
  scrollProgress: 0,
  setScrollProgress: (progress) => set({ scrollProgress: Math.max(0, Math.min(1, progress)) }),

  currentStopIndex: -1, // -1 prologue, 0..4 stalls, 5 epilogue
  setCurrentStopIndex: (index) => set({ currentStopIndex: index }),

  activeShop: null, // stall object when inside shop
  setActiveShop: (shop) => set({ activeShop: shop }),

  isEnteringShop: false, // true during push-in dolly zoom
  setIsEnteringShop: (val) => set({ isEnteringShop: val }),

  isListView: false, // Accessibility "skip to list" fast view
  setIsListView: (val) => set({ isListView: val }),

  renderMode: 'modeA', // 'modeA' (frame canvas scrub) or 'modeB' (live 3D r3f)
  setRenderMode: (mode) => set({ renderMode: mode }),

  // Preloading
  isPreloaded: false,
  preloadProgress: 0,
  setPreloadProgress: (progress) =>
    set({
      preloadProgress: progress,
      isPreloaded: progress >= 100,
    }),

  // 3. CART STATE
  cartItems: (() => {
    try {
      const saved = localStorage.getItem('kirbite_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })(),

  cartStall: (() => {
    try {
      const saved = localStorage.getItem('kirbite_cart_stall');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),

  isCheckoutOpen: false,
  setIsCheckoutOpen: (open) => set({ isCheckoutOpen: open }),

  addToCart: (item, stall) => {
    const { cartStall, cartItems } = get();
    if (cartStall && cartStall._id !== stall._id && cartItems.length > 0) {
      const confirmReset = window.confirm(
        `Your cart contains dishes from ${cartStall.stallName}. Clear cart to start ordering from ${stall.stallName}?`
      );
      if (!confirmReset) return false;
      const newItems = [{ ...item, quantity: 1 }];
      localStorage.setItem('kirbite_cart', JSON.stringify(newItems));
      localStorage.setItem('kirbite_cart_stall', JSON.stringify(stall));
      set({ cartItems: newItems, cartStall: stall });
      return true;
    }

    const existing = cartItems.find((i) => i._id === item._id);
    let updated;
    if (existing) {
      updated = cartItems.map((i) =>
        i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
      );
    } else {
      updated = [...cartItems, { ...item, quantity: 1 }];
    }

    localStorage.setItem('kirbite_cart', JSON.stringify(updated));
    localStorage.setItem('kirbite_cart_stall', JSON.stringify(stall));
    set({ cartItems: updated, cartStall: stall });
    return true;
  },

  removeFromCart: (itemId) => {
    const { cartItems } = get();
    const existing = cartItems.find((i) => i._id === itemId);
    if (!existing) return;

    let updated;
    let newStall = get().cartStall;
    if (existing.quantity <= 1) {
      updated = cartItems.filter((i) => i._id !== itemId);
      if (updated.length === 0) newStall = null;
    } else {
      updated = cartItems.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    }

    localStorage.setItem('kirbite_cart', JSON.stringify(updated));
    localStorage.setItem('kirbite_cart_stall', JSON.stringify(newStall));
    set({ cartItems: updated, cartStall: newStall });
  },

  clearCart: () => {
    localStorage.removeItem('kirbite_cart');
    localStorage.removeItem('kirbite_cart_stall');
    set({ cartItems: [], cartStall: null });
  },

  // 4. LIVE ORDER TRACKING
  activeTrackingOrderId: (() => {
    return localStorage.getItem('kirbite_active_order') || null;
  })(),
  setActiveTrackingOrderId: (orderId) => {
    if (orderId) {
      localStorage.setItem('kirbite_active_order', orderId);
    } else {
      localStorage.removeItem('kirbite_active_order');
    }
    set({ activeTrackingOrderId: orderId });
  },
}));
