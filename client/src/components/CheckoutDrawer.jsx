import React, { useState } from 'react';
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
import { useKirbiteStore } from '../store/useKirbiteStore';
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

export const CheckoutDrawer = ({ onOrderPlaced }) => {
  const {
    cartItems,
    cartStall,
    isCheckoutOpen,
    setIsCheckoutOpen,
    addToCart,
    removeFromCart,
    clearCart,
    user,
    setActiveTrackingOrderId,
  } = useKirbiteStore();

  const totalCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const totalAmount = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

  // Form State prefilled from authenticated user profile
  const [studentName, setStudentName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [hostelBlock, setHostelBlock] = useState(user?.hostelBlock || HOSTEL_BLOCKS[0]);
  const [roomNumber, setRoomNumber] = useState(user?.room || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI'); // 'UPI' or 'CASH'

  const [showUpiModal, setShowUpiModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isCheckoutOpen) return null;

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

  const handleCheckoutClick = () => {
    if (!validateForm()) return;
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
        particleCount: 90,
        spread: 65,
        origin: { y: 0.6 },
      });

      // Clear cart & close drawer
      clearCart();
      setShowUpiModal(false);
      setIsCheckoutOpen(false);

      const createdOrder = result.data.order;
      setActiveTrackingOrderId(createdOrder._id);

      if (onOrderPlaced) {
        onOrderPlaced(createdOrder);
      }
    } catch (err) {
      console.error('Order placement error:', err);
      setErrorMessage(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-md flex justify-end animate-in fade-in duration-200">
        <div className="bg-slate-900 border-l border-white/10 text-white w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base sm:text-lg leading-tight">
                  Your Campus Food Cart
                </h3>
                {cartStall && (
                  <p className="text-xs text-orange-400 font-semibold truncate max-w-[240px]">
                    Ordering from: {cartStall.stallName}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsCheckoutOpen(false)}
              className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Body */}
          {cartItems.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-4">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <h4 className="text-lg font-bold text-white">Your cart is empty</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Walk down Kirba Chowk, step into a stall, and add hot dishes to your cart!
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
              {/* Items List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span>Selected Dishes ({totalCount})</span>
                  <button
                    onClick={clearCart}
                    className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold normal-case cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear
                  </button>
                </div>

                <div className="space-y-2">
                  {cartItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between gap-3 p-3 bg-white/5 border border-white/10 rounded-xl"
                    >
                      <div className="truncate">
                        <p className="text-sm font-bold text-white truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-slate-400">₹{item.price} each</p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center bg-white/10 rounded-lg px-2 py-0.5">
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1 hover:text-orange-400 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold px-2">{item.quantity}</span>
                          <button
                            onClick={() => addToCart(item, cartStall)}
                            className="p-1 hover:text-orange-400 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-sm font-bold text-white min-w-[50px] text-right">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Special Cooking Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Cooking Notes / Special Requests (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Extra spicy tastemaker, keep chutney separate"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Hostel Delivery Form */}
              <div className="p-4 bg-orange-950/20 border border-orange-500/30 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    Hostel Delivery Destination
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Pre-filled from profile
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Student Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Aryan Verma"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Hostel Block *
                    </label>
                    <select
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500"
                    >
                      {HOSTEL_BLOCKS.map((block) => (
                        <option key={block} value={block} className="bg-slate-900">
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Room Number *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 304"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-hidden focus:border-orange-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMode('UPI')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMode === 'UPI'
                        ? 'border-orange-500 bg-orange-600/20 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <CreditCard className="w-4 h-4 text-orange-400" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Instant
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Direct UPI</span>
                      <span className="text-[11px] text-slate-400">GPay, PhonePe, Paytm</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMode('CASH')}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                      paymentMode === 'CASH'
                        ? 'border-orange-500 bg-orange-600/20 text-white'
                        : 'border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <Banknote className="w-4 h-4 text-orange-400" />
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                        Hostel Gate
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-xs block text-white">Cash On Delivery</span>
                      <span className="text-[11px] text-slate-400">Pay delivery student</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bill Details */}
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1.5 text-xs text-slate-300">
                <div className="flex justify-between">
                  <span>Item Total</span>
                  <span className="font-semibold text-white">₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Hostel Delivery</span>
                  <span className="font-semibold">FREE</span>
                </div>
                <div className="pt-2 border-t border-white/10 flex justify-between text-sm font-extrabold text-white">
                  <span>Total Amount</span>
                  <span className="text-orange-400">₹{totalAmount}</span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-semibold">
                  {errorMessage}
                </div>
              )}
            </div>
          )}

          {/* Footer Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-white/10 bg-black/40">
              <button
                onClick={handleCheckoutClick}
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-between transition-all cursor-pointer"
              >
                <div className="text-left">
                  <span className="text-xs font-medium text-orange-200 block">
                    {totalCount} {totalCount === 1 ? 'dish' : 'dishes'}
                  </span>
                  <span className="text-lg font-black leading-none">₹{totalAmount}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span>{paymentMode === 'UPI' ? 'Pay via UPI' : 'Place Cash Order'}</span>
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
