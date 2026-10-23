import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  MapPin,
  User,
  Phone,
  Home,
  CreditCard,
  Banknote,
  ArrowRight,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { UpiPaymentModal } from './UpiPaymentModal';
import { api } from '../utils/api';
import confetti from 'canvas-confetti';

const HOSTEL_BLOCKS = [
  'CV Raman Hall',
  'Vasishtha Hostel',
  'Aryabhatta Hostel',
  'Gargi Girls Hostel',
  'Kalpana Chawla Girls Hostel',
  'Ramanujan Hostel',
  'Shivalik Hostel',
  'Nilgiri Hostel',
  'Bhabha Hall',
];

export const CartDrawer = ({ onOrderSuccess }) => {
  const {
    cartItems,
    cartStall,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    removeFromCart,
    clearCart,
    totalCount,
    totalAmount,
    setActiveTrackingOrderId,
  } = useCart();

  const { user, openAuthModal } = useAuth();

  // Form State
  const [studentName, setStudentName] = useState(() => user?.name || localStorage.getItem('kfc_student_name') || '');
  const [phone, setPhone] = useState(() => user?.phone || localStorage.getItem('kfc_student_phone') || '');
  const [hostelBlock, setHostelBlock] = useState(() => user?.hostelBlock || localStorage.getItem('kfc_hostel_block') || HOSTEL_BLOCKS[0]);
  const [roomNumber, setRoomNumber] = useState(() => user?.room || localStorage.getItem('kfc_room_number') || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' or 'CASH'

  useEffect(() => {
    if (user && user.role === 'student') {
      if (user.name) setStudentName(user.name);
      if (user.phone) setPhone(user.phone);
      if (user.hostelBlock) setHostelBlock(user.hostelBlock);
      if (user.room) setRoomNumber(user.room);
    }
  }, [user]);

  // UPI Modal State
  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCartOpen) return null;

  const validateForm = () => {
    if (!studentName.trim()) {
      setErrorMessage('Please enter your full name');
      return false;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!roomNumber.trim()) {
      setErrorMessage('Please enter your hostel room number');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const saveDetailsToStorage = () => {
    localStorage.setItem('kfc_student_name', studentName.trim());
    localStorage.setItem('kfc_student_phone', phone.trim());
    localStorage.setItem('kfc_hostel_block', hostelBlock);
    localStorage.setItem('kfc_room_number', roomNumber.trim());
  };

  const handleCheckoutClick = () => {
    if (!validateForm()) return;
    saveDetailsToStorage();

    if (paymentMode === 'UPI') {
      setShowUpiModal(true);
    } else {
      executeOrderPlacement('CASH', 'Cash_On_Delivery');
    }
  };

  const executeOrderPlacement = async (pMode = paymentMode, pStatus = 'Pending') => {
    try {
      setIsSubmitting(true);
      setErrorMessage('');

      const payload = {
        customerName: studentName.trim(),
        customerPhone: phone.trim(),
        hostelDetails: {
          block: hostelBlock,
          room: roomNumber.trim(),
        },
        stallId: cartStall._id,
        items: cartItems.map((item) => ({
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalAmount,
        paymentMode: pMode,
        paymentStatus: pStatus,
        orderNotes: orderNotes.trim(),
      };

      const result = await api.createOrder(payload);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
      });

      // Clear cart & close drawer
      clearCart();
      setShowUpiModal(false);
      setIsCartOpen(false);

      // Set active order for live tracking
      const createdOrder = result.data.order;
      setActiveTrackingOrderId(createdOrder._id);

      if (onOrderSuccess) {
        onOrderSuccess(createdOrder);
      }
    } catch (err) {
      console.error('Order creation error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
        <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg leading-tight">
                  Your Campus Food Cart
                </h3>
                {cartStall && (
                  <p className="text-xs text-orange-600 font-semibold truncate max-w-[240px]">
                    Ordering from: {cartStall.stallName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Your cart is empty</h4>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Explore delicious Maggi, momos, rolls, and hot chai from stalls at Kirba Chowk!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-6 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Browse Stalls
              </button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Selected Items ({totalCount})</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-500 hover:text-rose-600 flex items-center gap-1 font-semibold normal-case"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>

                <div className="space-y-2.5">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <span
                          className={`w-3.5 h-3.5 shrink-0 rounded-xs border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-600' : 'border-rose-600'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                            }`}
                          />
                        </span>
                        <div className="truncate">
                          <p className="text-sm font-bold text-slate-900 truncate">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">₹{item.price} each</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-white border border-slate-200 rounded-lg px-2 py-0.5 shadow-2xs">
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1 hover:text-orange-600"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item, cartStall)}
                            className="p-1 hover:text-orange-600"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-slate-900 min-w-[50px] text-right">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Cooking Notes / Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy, less butter, keep chutney separate"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                />
              </div>

              {/* Hostel Delivery Form */}
              <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-orange-950 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                    Hostel Delivery Details
                  </h4>
                  {user ? (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Auto-filled
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAuthModal('student')}
                      className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Sign In</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Student Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        placeholder="Aryan Verma"
                        value={studentName}
                        onChange={(e) => setStudentName(e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Phone Number (for delivery call) *
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Hostel Block *
                    </label>
                    <div className="relative">
                      <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={hostelBlock}
                        onChange={(e) => setHostelBlock(e.target.value)}
                        className="w-full text-xs pl-8.5 pr-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      >
                        {HOSTEL_BLOCKS.map((block) => (
                          <option key={block} value={block}>
                            {block}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 214 / B-Block"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMode === 'UPI'
                        ? 'border-orange-600 bg-orange-50/70 text-orange-900 ring-2 ring-orange-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className={`w-4 h-4 ${paymentMode === 'UPI' ? 'text-orange-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        Instant
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs block">UPI Pay</span>
                      <span className="text-[11px] text-slate-500">GPay, PhonePe, Paytm</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('CASH')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                      paymentMode === 'CASH'
                        ? 'border-orange-600 bg-orange-50/70 text-orange-900 ring-2 ring-orange-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Banknote className={`w-4 h-4 ${paymentMode === 'CASH' ? 'text-orange-600' : 'text-slate-500'}`} />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                        Hostel Gate
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs block">Cash On Delivery</span>
                      <span className="text-[11px] text-slate-500">Pay delivery student</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bill Details */}
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-semibold text-slate-900">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Hostel Campus Delivery</span>
                  <span className="font-semibold">FREE</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>To Pay</span>
                  <span className="text-orange-600">₹{totalAmount}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Footer Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
              <button
                onClick={handleCheckoutClick}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-between transition-all"
              >
                <div className="text-left">
                  <span className="text-xs font-medium text-orange-100 block">
                    {totalCount} {totalCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-lg font-black leading-none">₹{totalAmount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>{paymentMode === 'UPI' ? 'Continue with UPI' : 'Place Cash Order'}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Direct UPI Modal Step */}
      <UpiPaymentModal
        isOpen={showUpiModal}
        onClose={() => setShowUpiModal(false)}
        stall={cartStall}
        totalAmount={totalAmount}
        onConfirmOrder={() => executeOrderPlacement('UPI', 'Confirmed')}
        isSubmitting={isSubmitting}
      />
    </>
  );
};
