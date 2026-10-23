import React, { useState } from 'react';
import { Smartphone, CheckCircle2, Copy, Check, ExternalLink, ShieldAlert, ArrowLeft } from 'lucide-react';

export const UpiPaymentModal = ({
  isOpen,
  onClose,
  stall,
  totalAmount,
  orderDetails,
  onConfirmOrder,
  isSubmitting,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !stall) return null;

  const upiId = stall.upiId;
  const upiName = stall.upiName || stall.ownerName;
  const note = `Kirbite-${stall.stallName.substring(0, 8)}`;

  // Mobile UPI deep-link standard URI
  const upiIntentUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    upiName
  )}&am=${encodeURIComponent(totalAmount)}&cu=INR&tn=${encodeURIComponent(note)}`;

  // QR Code URL for desktop or manual scan
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
    upiIntentUri
  )}&margin=10`;

  const copyUpiId = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-1 rounded-full hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h3 className="font-bold text-lg leading-tight">Pay via UPI</h3>
              <p className="text-xs text-orange-100">{stall.stallName}</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-orange-200 uppercase font-bold tracking-wider">Amount</span>
            <div className="text-2xl font-black">₹{totalAmount}</div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 flex-1 flex flex-col items-center text-center">
          {/* Mobile UPI Direct App Intent Button (Primary on Mobile) */}
          <div className="w-full mb-5">
            <a
              href={upiIntentUri}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
            >
              <Smartphone className="w-5 h-5" />
              <span>Tap to Pay with UPI App</span>
              <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
            </a>
            <p className="text-[11px] text-slate-500 mt-1.5">
              Directly launches GPay, PhonePe, Paytm, or BHIM on your phone
            </p>
          </div>

          <div className="w-full flex items-center gap-3 my-2">
            <div className="h-px bg-slate-200 flex-1" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">OR SCAN / COPY UPI</span>
            <div className="h-px bg-slate-200 flex-1" />
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs my-3">
            <img
              src={qrCodeUrl}
              alt="UPI QR Code"
              className="w-44 h-44 object-contain rounded-xl"
            />
          </div>

          {/* Copy UPI ID Pill */}
          <div className="w-full flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl mb-4">
            <div className="text-left overflow-hidden">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Vendor UPI ID ({upiName})
              </span>
              <span className="font-mono font-semibold text-xs text-slate-800 truncate block">
                {upiId}
              </span>
            </div>
            <button
              onClick={copyUpiId}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors shrink-0 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-start gap-2 text-left bg-amber-50 border border-amber-200 rounded-xl p-3 mb-5 w-full text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              After completing your transfer in your UPI app, click below to confirm your order so the stall vendor receives it instantly!
            </span>
          </div>

          {/* Manual "I Have Paid / Place Order" confirmation step */}
          <button
            onClick={onConfirmOrder}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] disabled:opacity-50 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting Order...
              </span>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>I Have Paid • Place Order</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
