import React from 'react';
import { ShoppingBag, Store, UtensilsCrossed, Clock, Radio, Sparkles, User, LogIn } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export const Navbar = ({ currentView, setCurrentView, stalls = [], selectedStallId, setSelectedStallId }) => {
  const { totalCount, setIsCartOpen, activeTrackingOrderId } = useCart();
  const { user, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Kirbite Brand Logo & Wordmark */}
        <div 
          onClick={() => setCurrentView('customer')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <img
            src="/kirbite-logo.svg"
            alt="Kirbite Logo"
            className="w-10 h-10 rounded-xl shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-2xl tracking-tight text-slate-900 leading-none">
                Kir<span className="text-orange-600">bite</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 tracking-wide uppercase">
                Kirba Chowk
              </span>
            </div>
            <p className="text-[11px] font-semibold text-slate-400 mt-0.5">Hostel Food Delivery</p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active order quick tracking pill */}
          {activeTrackingOrderId && currentView === 'customer' && (
            <button
              onClick={() => {
                const modalBtn = document.getElementById('open-tracker-btn');
                if (modalBtn) modalBtn.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-colors animate-pulse"
              title="Track your active order live"
            >
              <Radio className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden md:inline">Track Live</span>
            </button>
          )}

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setCurrentView('customer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'customer'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Student</span>
            </button>
            <button
              onClick={() => setCurrentView('vendor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentView === 'vendor'
                  ? 'bg-white text-orange-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Vendor</span>
            </button>
          </div>

          {/* User Profile / Login Button */}
          {user ? (
            <button
              onClick={() => openAuthModal(user.role)}
              className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl bg-slate-100 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-all text-xs font-bold text-slate-800"
              title={`Logged in as ${user.name || user.stallName}`}
            >
              <img
                src={user.avatar}
                alt={user.name || user.stallName}
                className="w-7 h-7 rounded-lg bg-white border border-slate-200"
              />
              <span className="hidden sm:inline-block max-w-[90px] truncate">
                {user.role === 'student' ? user.name.split(' ')[0] : 'Vendor'}
              </span>
            </button>
          ) : (
            <button
              onClick={() => openAuthModal('student')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          {/* Cart Icon in Customer View */}
          {currentView === 'customer' && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 transition-colors"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-orange-600 text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {totalCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
