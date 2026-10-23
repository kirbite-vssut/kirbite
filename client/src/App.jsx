import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CustomerHome } from './pages/CustomerHome';
import { StallMenu } from './pages/StallMenu';
import { VendorDashboard } from './pages/VendorDashboard';
import { CartDrawer } from './components/CartDrawer';
import { OrderTrackerModal } from './components/OrderTrackerModal';
import { CartProvider, useCart } from './context/CartContext';
import { api } from './utils/api';
import { socket } from './utils/socket';
import { MapPin, Heart, ShieldCheck, Utensils, Store } from 'lucide-react';

const KFCApp = () => {
  const [currentView, setCurrentView] = useState('customer'); // 'customer' | 'vendor'
  const [stalls, setStalls] = useState([]);
  const [loadingStalls, setLoadingStalls] = useState(true);
  const [selectedStall, setSelectedStall] = useState(null);
  const [selectedVendorStallId, setSelectedVendorStallId] = useState('');

  const { activeTrackingOrderId, setActiveTrackingOrderId } = useCart();
  const [showTrackerModal, setShowTrackerModal] = useState(false);

  // Fetch stalls from backend
  const fetchStalls = async () => {
    try {
      setLoadingStalls(true);
      const res = await api.getStalls();
      if (res.success) {
        setStalls(res.data);
        if (res.data.length > 0 && !selectedVendorStallId) {
          setSelectedVendorStallId(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load stalls:', err);
    } finally {
      setLoadingStalls(false);
    }
  };

  useEffect(() => {
    fetchStalls();

    // Listen for stall open/close updates in real time
    const handleStallStatusChange = (data) => {
      setStalls((prev) =>
        prev.map((s) => (s._id === data.stallId ? { ...s, isOpen: data.isOpen } : s))
      );
      if (selectedStall && selectedStall._id === data.stallId) {
        setSelectedStall((prev) => ({ ...prev, isOpen: data.isOpen }));
      }
    };

    socket.on('stall_status_changed', handleStallStatusChange);

    return () => {
      socket.off('stall_status_changed', handleStallStatusChange);
    };
  }, []);

  const handleStallSelect = (stall) => {
    setSelectedStall(stall);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStalls = () => {
    setSelectedStall(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderSuccess = (newOrder) => {
    setShowTrackerModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Hidden button for Navbar to trigger tracker */}
      <button
        id="open-tracker-btn"
        className="hidden"
        onClick={() => setShowTrackerModal(true)}
      />

      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        stalls={stalls}
        selectedStallId={selectedVendorStallId}
        setSelectedStallId={setSelectedVendorStallId}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6">
        {currentView === 'customer' ? (
          selectedStall ? (
            <StallMenu
              stallId={selectedStall._id}
              onBack={handleBackToStalls}
            />
          ) : (
            <CustomerHome
              stalls={stalls}
              loading={loadingStalls}
              onSelectStall={handleStallSelect}
            />
          )
        ) : (
          <VendorDashboard
            stalls={stalls}
            selectedStallId={selectedVendorStallId}
            onSelectStallId={setSelectedVendorStallId}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer onOrderSuccess={handleOrderSuccess} />

      {/* Order Tracker Modal */}
      {showTrackerModal && activeTrackingOrderId && (
        <OrderTrackerModal
          orderId={activeTrackingOrderId}
          onClose={() => setShowTrackerModal(false)}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 text-sm">
              Kir<span className="text-orange-600">bite</span>
            </span>
            <span>•</span>
            <span>Campus Hostel Food Delivery</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-orange-600" />
              Kirba Chowk
            </span>
            <span className="flex items-center gap-1 text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Direct UPI Intent & COD
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CartProvider>
      <KFCApp />
    </CartProvider>
  );
}
