import React, { useEffect, useState } from 'react';
import {
  X,
  Phone,
  Clock,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  Bike,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';
import { api } from '../utils/api';
import { socket } from '../utils/socket';
import { playOrderChime } from '../utils/sound';

const STATUS_STEPS = [
  { key: 'Received', label: 'Order Placed', icon: Clock, desc: 'Stall notified at Kirba Chowk' },
  { key: 'Preparing', label: 'Kitchen Preparing', icon: ChefHat, desc: 'Cooking fresh & hot' },
  { key: 'Ready', label: 'Food Ready', icon: PackageCheck, desc: 'Packed & heading for delivery' },
  { key: 'Delivered', label: 'Delivered to Hostel', icon: Bike, desc: 'Handed over at hostel' },
];

export const OrderTrackerModal = ({ orderId, onClose }) => {
  const [orderData, setOrderData] = useState(null);
  const [stallData, setStallData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Fetch initial order details
  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await api.getOrderById(orderId);
        if (res.success) {
          setOrderData(res.data.order);
          setStallData(res.data.stall);
        }
      } catch (err) {
        console.error('Fetch order error:', err);
        setError('Could not load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    // Join Socket.io room for this order
    socket.emit('join_order', orderId);

    // Listen for live status updates from vendor
    const handleStatusUpdate = (updatedOrder) => {
      if (updatedOrder && updatedOrder._id === orderId) {
        setOrderData(updatedOrder);
        playOrderChime();
      }
    };

    socket.on('order_status_updated', handleStatusUpdate);

    return () => {
      socket.off('order_status_updated', handleStatusUpdate);
    };
  }, [orderId]);

  if (!orderId) return null;

  const currentStatus = orderData?.orderStatus || 'Received';
  const getStepIndex = (status) => {
    switch (status) {
      case 'Received':
        return 0;
      case 'Preparing':
        return 1;
      case 'Ready':
        return 2;
      case 'Delivered':
        return 3;
      default:
        return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-linear-to-r from-orange-600 to-amber-600 text-white p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-orange-200 uppercase tracking-wider block">
              Live Campus Food Tracker
            </span>
            <h3 className="font-bold text-xl">
              {stallData ? stallData.stallName : 'Kirbite'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 flex flex-col items-center">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-xs font-semibold">Connecting to Kirba Chowk stall...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 text-sm">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
            <p>{error}</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-5 space-y-6">
            {/* Status Header Badge */}
            <div className="flex items-center justify-between p-3.5 bg-orange-50 border border-orange-200/80 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                  Current Status
                </span>
                <span className="text-base font-extrabold text-orange-950 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {currentStatus === 'Received' && 'Order Placed & Notified'}
                  {currentStatus === 'Preparing' && 'Kitchen is Cooking Fresh'}
                  {currentStatus === 'Ready' && 'Food Ready for Pickup/Delivery'}
                  {currentStatus === 'Delivered' && 'Order Delivered! Enjoy!'}
                  {currentStatus === 'Cancelled' && 'Order Cancelled'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Order ID
                </span>
                <button
                  onClick={copyOrderId}
                  className="font-mono text-xs font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1"
                >
                  <span>#{orderId.toString().slice(-6).toUpperCase()}</span>
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="space-y-4 px-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx <= activeIndex;
                const isCurrent = idx === activeIndex;
                const IconComponent = step.icon;

                return (
                  <div key={step.key} className="flex items-start gap-4 relative">
                    {/* Connecting line */}
                    {idx < STATUS_STEPS.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 bottom-0 w-0.5 -ml-px ${
                          idx < activeIndex ? 'bg-orange-500' : 'bg-slate-200'
                        }`}
                      />
                    )}

                    {/* Step Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-orange-600 text-white ring-4 ring-orange-200 shadow-md scale-105'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Step Info */}
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-bold ${
                            isCurrent
                              ? 'text-orange-950 font-extrabold'
                              : isPassed
                              ? 'text-slate-800'
                              : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </p>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold text-orange-600 uppercase tracking-wider bg-orange-100 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery Destination */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Delivery Destination
                </span>
                <span className="font-bold text-slate-800">
                  {orderData?.hostelDetails?.block}, Room {orderData?.hostelDetails?.room}
                </span>
                <p className="text-slate-500 text-[11px]">
                  Student: {orderData?.customerName} ({orderData?.customerPhone})
                </p>
              </div>

              {stallData?.phone && (
                <a
                  href={`tel:${stallData.phone}`}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl font-bold text-orange-600 shadow-2xs transition-colors shrink-0"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Stall</span>
                </a>
              )}
            </div>

            {/* Order Items Summary */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Order Items ({orderData?.items?.length})
              </span>
              <div className="space-y-1.5">
                {orderData?.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs text-slate-700">
                    <span>
                      <strong className="text-slate-900">{item.quantity}x</strong> {item.name}
                    </span>
                    <span className="font-semibold">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                <span>Total ({orderData?.paymentMode})</span>
                <span className="text-orange-600">₹{orderData?.totalAmount}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
