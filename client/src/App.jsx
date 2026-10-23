import React, { useState, useEffect } from 'react';
import { StreetJourney } from './scene/StreetJourney';
import { SignInGate } from './auth/SignInGate';
import { LoaderScreen } from './components/LoaderScreen';
import { CheckoutDrawer } from './components/CheckoutDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { VendorDashboard } from './pages/VendorDashboard';
import { AdminPage } from './pages/AdminPage';
import { useKirbiteStore } from './store/useKirbiteStore';
import { api } from './utils/api';
import { socket } from './utils/socket';

export default function App() {
  const { user, isPreloaded, activeTrackingOrderId } = useKirbiteStore();

  // Route state
  const getInitialRoute = () => {
    const path = window.location.pathname.toLowerCase();
    if (path === '/admin' || path.startsWith('/admin')) return 'admin';
    if (path.startsWith('/vendor')) return 'vendor';
    return 'street';
  };

  const [currentRoute, setCurrentRoute] = useState(getInitialRoute);
  const [stalls, setStalls] = useState([]);
  const [selectedVendorStallId, setSelectedVendorStallId] = useState('');
  const [showOrderTracker, setShowOrderTracker] = useState(false);

  // Sync browser path navigation
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname.toLowerCase();
      if (path === '/admin' || path.startsWith('/admin')) {
        setCurrentRoute('admin');
      } else if (path.startsWith('/vendor')) {
        setCurrentRoute('vendor');
      } else {
        setCurrentRoute('street');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    return () => window.removeEventListener('popstate', handleUrlChange);
  }, []);

  // Fetch stalls only after sign in (or if vendor/admin)
  const fetchStalls = async () => {
    try {
      const res = await api.getStalls();
      if (res.success && res.data) {
        setStalls(res.data);
        if (res.data.length > 0 && !selectedVendorStallId) {
          setSelectedVendorStallId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load Kirba Chowk stalls:', err);
    }
  };

  useEffect(() => {
    if (user || currentRoute === 'vendor' || currentRoute === 'admin') {
      fetchStalls();
    }
  }, [user, currentRoute]);

  // Live Socket.io updates for stall Open/Closed state
  useEffect(() => {
    const handleStallStatusChange = (data) => {
      setStalls((prev) =>
        prev.map((s) => (s._id === data.stallId ? { ...s, isOpen: data.isOpen } : s))
      );
    };

    socket.on('stall_status_changed', handleStallStatusChange);
    return () => socket.off('stall_status_changed', handleStallStatusChange);
  }, []);

  // 1. Initial Loader Screen
  if (!isPreloaded) {
    return <LoaderScreen />;
  }

  // 2. Hidden Admin Center (/admin)
  if (currentRoute === 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans">
        <AdminPage
          stalls={stalls}
          onRefreshStalls={fetchStalls}
          onExitAdmin={() => {
            window.history.pushState({}, '', '/');
            setCurrentRoute('street');
          }}
        />
      </div>
    );
  }

  // 3. Vendor Dashboard (/vendor/:stallId)
  if (currentRoute === 'vendor') {
    return (
      <div className="min-h-screen bg-slate-950 text-white font-sans p-4 sm:p-6">
        <div className="max-w-6xl mx-auto mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/kirbite-logo.svg" alt="Kirbite" className="w-8 h-8 rounded-lg" />
            <span className="font-black text-xl text-white">
              Kir<span className="text-orange-500">bite</span> Vendor Portal
            </span>
          </div>
          <button
            onClick={() => {
              window.history.pushState({}, '', '/');
              setCurrentRoute('street');
            }}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
          >
            ← Public Street
          </button>
        </div>
        <VendorDashboard
          stalls={stalls}
          selectedStallId={selectedVendorStallId}
          onSelectStallId={setSelectedVendorStallId}
        />
      </div>
    );
  }

  // 4. Customer Sign-In Gate (BEFORE street or menus render - 02 Spec)
  if (!user) {
    return <SignInGate />;
  }

  // 5. Cinematic Scroll-Driven Street Journey
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      <StreetJourney stalls={stalls} />

      {/* Persistent Checkout Drawer */}
      <CheckoutDrawer
        onOrderPlaced={() => setShowOrderTracker(true)}
      />

      {/* Live Order Tracker Modal */}
      {showOrderTracker && activeTrackingOrderId && (
        <OrderTrackerModal
          orderId={activeTrackingOrderId}
          onClose={() => setShowOrderTracker(false)}
        />
      )}
    </div>
  );
}
