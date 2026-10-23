import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('kfc_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [cartStall, setCartStall] = useState(() => {
    try {
      const saved = localStorage.getItem('kfc_cart_stall');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState(() => {
    return localStorage.getItem('kfc_active_order') || null;
  });

  useEffect(() => {
    localStorage.setItem('kfc_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('kfc_cart_stall', JSON.stringify(cartStall));
  }, [cartStall]);

  useEffect(() => {
    if (activeTrackingOrderId) {
      localStorage.setItem('kfc_active_order', activeTrackingOrderId);
    } else {
      localStorage.removeItem('kfc_active_order');
    }
  }, [activeTrackingOrderId]);

  // Add item
  const addToCart = (item, stall) => {
    // If cart has items from another stall, prompt to clear
    if (cartStall && cartStall._id !== stall._id && cartItems.length > 0) {
      const confirmReset = window.confirm(
        `Your cart contains items from ${cartStall.stallName}. Would you like to clear your cart and order from ${stall.stallName} instead?`
      );
      if (!confirmReset) return false;
      setCartItems([{ ...item, quantity: 1 }]);
      setCartStall(stall);
      return true;
    }

    if (!cartStall) {
      setCartStall(stall);
    }

    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === item._id);
      if (existing) {
        return prev.map((i) =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    return true;
  };

  // Decrement or remove item
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i._id === itemId);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        const remaining = prev.filter((i) => i._id !== itemId);
        if (remaining.length === 0) setCartStall(null);
        return remaining;
      }
      return prev.map((i) =>
        i._id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCartStall(null);
  };

  const totalCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cartItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartStall,
        addToCart,
        removeFromCart,
        clearCart,
        totalCount,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
        activeTrackingOrderId,
        setActiveTrackingOrderId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
