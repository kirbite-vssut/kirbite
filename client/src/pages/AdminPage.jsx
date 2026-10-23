import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  KeyRound,
  Store,
  Power,
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  LogOut,
  ExternalLink,
  ChevronRight,
  Search,
  User,
  Home,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { socket } from '../utils/socket';

export const AdminPage = ({ stalls = [], onRefreshStalls, onExitAdmin }) => {
  const { user, loginAdmin, logout } = useAuth();

  // Login form state
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Admin Dashboard State
  const [allOrders, setAllOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [stallUpdatingId, setStallUpdatingId] = useState(null);

  // Fetch orders from all stalls for admin
  const loadAllCampusOrders = async () => {
    try {
      setLoadingOrders(true);
      const ordersPromises = stalls.map((s) =>
        api.getOrdersByVendor(s._id).catch(() => ({ success: false, data: [] }))
      );
      const results = await Promise.all(ordersPromises);
      const combined = results.flatMap((r) => (r.success ? r.data : []));
      // Sort desc by creation time
      combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setAllOrders(combined);
    } catch (err) {
      console.error('Error fetching campus orders for admin:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin' && stalls.length > 0) {
      loadAllCampusOrders();
    }
  }, [user, stalls]);

  // Listen for all new orders in real-time across all stalls
  useEffect(() => {
    if (user?.role !== 'admin') return;

    // Join all stall rooms so admin gets live notifications from every single stall
    stalls.forEach((s) => {
      socket.emit('join_stall', s._id);
    });

    const handleNewOrder = (data) => {
      const order = data.order || data;
      setAllOrders((prev) => [order, ...prev.filter((o) => o._id !== order._id)]);
    };

    const handleOrderUpdated = (updatedOrder) => {
      setAllOrders((prev) =>
        prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
      );
    };

    socket.on('new_order', handleNewOrder);
    socket.on('order_updated', handleOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('order_updated', handleOrderUpdated);
    };
  }, [user, stalls]);

  // Handle Admin Login
  const handleAdminLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    const res = loginAdmin({
      username: adminUsername,
      password: adminPassword,
    });

    if (!res.success) {
      setLoginError(res.message);
    }
  };

  // Toggle stall open/closed from admin master panel
  const handleAdminToggleStall = async (stallId, currentStatus) => {
    try {
      setStallUpdatingId(stallId);
      const nextStatus = !currentStatus;
      await api.updateStallStatus(stallId, nextStatus);
      if (onRefreshStalls) {
        onRefreshStalls();
      }
    } catch (err) {
      alert('Failed to update stall status: ' + err.message);
    } finally {
      setStallUpdatingId(null);
    }
  };

  // Admin Login Screen (if not authenticated)
  if (user?.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-slate-900 text-white rounded-3xl p-7 sm:p-9 shadow-2xl border border-slate-800">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-orange-600/20 border border-orange-500/30 text-orange-500 mx-auto mb-3 flex items-center justify-center">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Kirbite Admin Portal</h2>
            <p className="text-xs text-slate-400 mt-1">
              Campus Master Control • Kirba Chowk Food Hub
            </p>
          </div>

          {loginError && (
            <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Admin Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="admin"
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Master Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-[11px] text-slate-400">
              Default credentials: <strong className="text-slate-200">admin</strong> /{' '}
              <strong className="text-slate-200">admin123</strong>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-orange-200" />
              <span>Unlock Admin Center</span>
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={onExitAdmin}
              className="text-xs font-semibold text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 mx-auto transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Kirbite Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Admin Statistics
  const totalRevenue = allOrders
    .filter((o) => o.orderStatus !== 'Cancelled')
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const openStallsCount = stalls.filter((s) => s.isOpen).length;

  const filteredOrders = allOrders.filter((order) => {
    const q = orderSearch.toLowerCase();
    return (
      order.customerName?.toLowerCase().includes(q) ||
      order.hostelDetails?.block?.toLowerCase().includes(q) ||
      order.hostelDetails?.room?.toLowerCase().includes(q) ||
      order._id?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="pb-24 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Admin Master Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/30 text-orange-400 text-xs font-extrabold mb-2 uppercase tracking-wide">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Master Administrator Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Kirbite Campus Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time management for all Kirba Chowk stalls, college hostel orders, and status overrides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAllCampusOrders}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={onExitAdmin}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors"
          >
            <span>Public Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/30 text-xs font-bold text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Campus Stalls</span>
            <Store className="w-4 h-4 text-orange-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {openStallsCount} <span className="text-xs font-semibold text-slate-400">/ {stalls.length} Open</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Total Campus Orders</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allOrders.length}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Gross Campus GMV</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">₹{totalRevenue}</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider">Active Pipeline</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {allOrders.filter((o) => o.orderStatus === 'Received' || o.orderStatus === 'Preparing').length}
          </div>
        </div>
      </div>

      {/* Section 1: Kirba Chowk Stalls Master Controls */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Kirba Chowk Stalls Overview & Overrides
            </h3>
            <p className="text-xs text-slate-500">
              Admins can remotely open or close any campus stall during emergencies or bad weather.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stalls.map((stall) => (
            <div
              key={stall._id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {stall.stallName}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                      stall.isOpen
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {stall.isOpen ? 'ONLINE' : 'CLOSED'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">Owner: {stall.ownerName} • {stall.phone}</p>
                <p className="text-[11px] font-mono text-slate-600 mt-1">UPI: {stall.upiId}</p>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {stall.location}
                </span>

                <button
                  disabled={stallUpdatingId === stall._id}
                  onClick={() => handleAdminToggleStall(stall._id, stall.isOpen)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs ${
                    stall.isOpen
                      ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{stall.isOpen ? 'Force Close' : 'Re-open'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Master Live Orders Feed Across Campus */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900">
              Master Campus Order Feed
            </h3>
            <p className="text-xs text-slate-500">
              Live orders updating in real-time from all hostels and Kirba Chowk stalls.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search student, room, order #..."
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              className="w-full text-xs pl-8.5 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20"
            />
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center text-xs text-slate-400">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            Fetching orders from all campus stalls...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No campus orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase font-bold text-[10px]">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Student & Hostel</th>
                  <th className="py-3 px-3">Stall</th>
                  <th className="py-3 px-3">Items</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map((ord) => {
                  const stall = stalls.find((s) => s._id === ord.stallId);
                  return (
                    <tr key={ord._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-900">
                        #{ord._id.toString().slice(-6).toUpperCase()}
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-800">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-500">
                          {ord.hostelDetails?.block}, Room {ord.hostelDetails?.room}
                        </div>
                      </td>
                      <td className="py-3 px-3 font-semibold text-orange-600">
                        {stall?.stallName || 'Stall'}
                      </td>
                      <td className="py-3 px-3">
                        {ord.items?.map((item, idx) => (
                          <span key={idx} className="block text-[11px]">
                            {item.quantity}x {item.name}
                          </span>
                        ))}
                      </td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">
                        ₹{ord.totalAmount}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {ord.paymentMode} ({ord.paymentStatus})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            ord.orderStatus === 'Delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : ord.orderStatus === 'Preparing'
                              ? 'bg-amber-100 text-amber-800'
                              : ord.orderStatus === 'Ready'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
