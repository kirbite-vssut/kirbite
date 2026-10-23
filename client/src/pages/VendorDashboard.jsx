import React, { useState, useEffect } from 'react';
import {
  Store,
  Power,
  Bell,
  Volume2,
  VolumeX,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  PackageCheck,
  Bike,
} from 'lucide-react';
import { OrderCardVendor } from '../components/OrderCardVendor';
import { api } from '../utils/api';
import { socket } from '../utils/socket';
import { playOrderChime } from '../utils/sound';

export const VendorDashboard = ({ stalls = [], selectedStallId, onSelectStallId }) => {
  const [currentStall, setCurrentStall] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ALL');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [updatingStatusId, setUpdatingStatusId] = useState(null);

  // Fallback to first stall if not provided
  const activeStallId = selectedStallId || stalls[0]?._id;

  // Load stall details
  useEffect(() => {
    if (!activeStallId) return;
    const found = stalls.find((s) => s._id === activeStallId);
    if (found) {
      setCurrentStall(found);
    }
  }, [activeStallId, stalls]);

  // Load orders for stall
  const loadOrders = async () => {
    if (!activeStallId) return;
    try {
      setLoading(true);
      const res = await api.getOrdersByVendor(activeStallId);
      if (res.success) {
        setOrders(res.data);
      }
    } catch (err) {
      console.error('Error loading vendor orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [activeStallId]);

  // Socket.io integration for Vendor Dashboard
  useEffect(() => {
    if (!activeStallId) return;

    // Join vendor room for this stall
    socket.emit('join_stall', activeStallId);

    // Incoming new order
    const handleNewOrder = (data) => {
      console.log('[Socket] Incoming order received:', data);
      const order = data.order || data;

      if (order.stallId === activeStallId) {
        setOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);

        if (soundEnabled) {
          playOrderChime();
        }

        // Show visual flash notification
        setNewOrderAlert(order);
        setTimeout(() => setNewOrderAlert(null), 8000);
      }
    };

    // Live order updates (e.g. from customer or co-worker)
    const handleOrderUpdated = (updatedOrder) => {
      if (updatedOrder && updatedOrder.stallId === activeStallId) {
        setOrders((prev) =>
          prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
        );
      }
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdated);
    };
  }, [activeStallId, soundEnabled]);

  // Toggle stall open/closed status
  const handleToggleShopStatus = async () => {
    if (!currentStall) return;
    const nextStatus = !currentStall.isOpen;
    try {
      const res = await api.updateStallStatus(currentStall._id, nextStatus);
      if (res.success) {
        setCurrentStall((prev) => ({ ...prev, isOpen: nextStatus }));
      }
    } catch (err) {
      alert('Failed to update stall status: ' + err.message);
    }
  };

  // Update order status action
  const handleUpdateOrderStatus = async (orderId, newStatus, paymentStatus) => {
    try {
      setUpdatingStatusId(orderId);
      const res = await api.updateOrderStatus(orderId, {
        orderStatus: newStatus,
        paymentStatus,
      });

      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? res.data : o))
        );
      }
    } catch (err) {
      alert('Error updating order status: ' + err.message);
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Calculations
  const stats = {
    total: orders.length,
    revenue: orders
      .filter((o) => o.orderStatus !== 'Cancelled')
      .reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    received: orders.filter((o) => o.orderStatus === 'Received').length,
    preparing: orders.filter((o) => o.orderStatus === 'Preparing').length,
    ready: orders.filter((o) => o.orderStatus === 'Ready').length,
    delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
  };

  // Tab Filtering
  const filteredOrders = orders.filter((order) => {
    if (activeTab === 'ALL') return true;
    return order.orderStatus === activeTab;
  });

  return (
    <div className="pb-24 max-w-6xl mx-auto space-y-6">
      {/* Top Vendor Control Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Stall Selector & Details */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vendor Dashboard
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <select
                value={activeStallId}
                onChange={(e) => onSelectStallId(e.target.value)}
                className="font-bold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-sm focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
              >
                {stalls.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.stallName}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              UPI: <span className="font-mono text-slate-700 font-semibold">{currentStall?.upiId}</span> • Owner: {currentStall?.ownerName}
            </p>
          </div>
        </div>

        {/* Quick Toggles: Shop Open/Closed & Audio Chime */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Audio Chime Toggle */}
          <button
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              if (!soundEnabled) playOrderChime();
            }}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
              soundEnabled
                ? 'bg-orange-50 border-orange-200 text-orange-700'
                : 'bg-slate-100 border-slate-200 text-slate-500'
            }`}
            title="Toggle incoming order chime"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-orange-600" />
                <span>Chime ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Chime Muted</span>
              </>
            )}
          </button>

          {/* Refresh Orders */}
          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            title="Refresh order feed"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Shop Open / Closed Toggle Switch */}
          <button
            onClick={handleToggleShopStatus}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-extrabold text-xs tracking-wide transition-all shadow-sm ${
              currentStall?.isOpen
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{currentStall?.isOpen ? 'STALL OPEN (Online)' : 'STALL CLOSED (Offline)'}</span>
          </button>
        </div>
      </div>

      {/* Visual Flash Alert for New Incoming Order */}
      {newOrderAlert && (
        <div className="bg-orange-600 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between animate-bounce">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Bell className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h4 className="font-black text-base">New Order Received!</h4>
              <p className="text-xs text-orange-100">
                {newOrderAlert.customerName} from {newOrderAlert.hostelDetails?.block} • ₹{newOrderAlert.totalAmount}
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewOrderAlert(null)}
            className="px-3 py-1 bg-white text-orange-700 font-bold rounded-lg text-xs"
          >
            View
          </button>
        </div>
      )}

      {/* Real-time Order Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Today's Orders</span>
            <ShoppingBag className="w-4 h-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.total}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Gross Sales</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{stats.revenue}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Needs Kitchen</span>
            <ChefHat className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats.received + stats.preparing}
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-blue-600">{stats.delivered}</div>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { key: 'ALL', label: 'All Orders', count: stats.total },
          { key: 'Received', label: 'New / Received', count: stats.received },
          { key: 'Preparing', label: 'In Kitchen', count: stats.preparing },
          { key: 'Ready', label: 'Ready for Pickup', count: stats.ready },
          { key: 'Delivered', label: 'Delivered', count: stats.delivered },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-400">Loading incoming orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">No orders in this category</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            When students place an order from hostel rooms, it will appear here in real time with an audio alert.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOrders.map((order) => (
            <OrderCardVendor
              key={order._id}
              order={order}
              onUpdateStatus={handleUpdateOrderStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
};
