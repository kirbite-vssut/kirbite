import React from 'react';
import {
  Clock,
  Phone,
  Home,
  User,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  XCircle,
  CreditCard,
  Banknote,
} from 'lucide-react';

export const OrderCardVendor = ({ order, onUpdateStatus }) => {
  const {
    _id,
    customerName,
    customerPhone,
    hostelDetails,
    items = [],
    totalAmount,
    paymentMode,
    paymentStatus,
    orderStatus,
    orderNotes,
    createdAt,
  } = order;

  // Format date / relative time
  const formatTime = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Received':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Preparing':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Delivered':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between">
      {/* Top Banner */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
            #{_id.toString().slice(-6).toUpperCase()}
          </span>
          <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatTime(createdAt)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Status Badge */}
          <span
            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusColor(
              orderStatus
            )}`}
          >
            {orderStatus}
          </span>
        </div>
      </div>

      {/* Customer & Hostel Destination */}
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span>{customerName}</span>
            </div>
            <a
              href={`tel:${customerPhone}`}
              className="text-xs text-orange-600 hover:underline flex items-center gap-1 mt-0.5"
            >
              <Phone className="w-3 h-3" />
              <span>{customerPhone}</span>
            </a>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-slate-800 font-bold text-xs justify-end">
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>{hostelDetails?.block}</span>
            </div>
            <span className="text-[11px] text-slate-500 font-semibold block">
              Room #{hostelDetails?.room}
            </span>
          </div>
        </div>

        {/* Items List */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Items ({items.reduce((s, i) => s + (i.quantity || 1), 0)})
          </span>
          {items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-xs text-slate-700 font-medium">
              <span>
                <strong className="text-slate-900">{item.quantity}x</strong> {item.name}
              </span>
              <span className="text-slate-500">₹{item.price * item.quantity}</span>
            </div>
          ))}

          {orderNotes && (
            <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-amber-800 font-medium bg-amber-50/60 p-1.5 rounded-lg">
              <strong>Note:</strong> {orderNotes}
            </div>
          )}
        </div>

        {/* Payment Details */}
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-1.5">
            {paymentMode === 'UPI' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold text-[11px]">
                <CreditCard className="w-3 h-3" />
                UPI ({paymentStatus})
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-semibold text-[11px]">
                <Banknote className="w-3 h-3" />
                Cash On Delivery
              </span>
            )}
          </div>

          <div className="text-right">
            <span className="text-sm font-black text-slate-900">₹{totalAmount}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons for Vendor Workflow */}
      <div className="p-3 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2">
        {orderStatus === 'Received' && (
          <>
            <button
              onClick={() => onUpdateStatus(_id, 'Preparing')}
              className="flex-1 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Accept & Prepare</span>
            </button>
            <button
              onClick={() => onUpdateStatus(_id, 'Cancelled')}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Decline / Cancel Order"
            >
              <XCircle className="w-4 h-4" />
            </button>
          </>
        )}

        {orderStatus === 'Preparing' && (
          <button
            onClick={() => onUpdateStatus(_id, 'Ready')}
            className="w-full py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <PackageCheck className="w-3.5 h-3.5" />
            <span>Mark Food Ready</span>
          </button>
        )}

        {orderStatus === 'Ready' && (
          <button
            onClick={() => onUpdateStatus(_id, 'Delivered', 'Confirmed')}
            className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Bike className="w-3.5 h-3.5" />
            <span>Mark Delivered</span>
          </button>
        )}

        {orderStatus === 'Delivered' && (
          <div className="w-full py-1.5 text-center text-emerald-700 text-xs font-bold flex items-center justify-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Completed & Delivered</span>
          </div>
        )}

        {orderStatus === 'Cancelled' && (
          <div className="w-full py-1.5 text-center text-rose-600 text-xs font-bold">
            Cancelled
          </div>
        )}
      </div>
    </div>
  );
};
