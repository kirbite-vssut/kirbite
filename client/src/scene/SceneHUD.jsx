import React from 'react';
import {
  Star,
  Clock,
  MapPin,
  ArrowRight,
  ShoppingBag,
  List,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import { useKirbiteStore } from '../store/useKirbiteStore';

export const SceneHUD = ({ stalls = [], onStepIn, onScrollToStop }) => {
  const {
    scrollProgress,
    currentStopIndex,
    activeShop,
    user,
    logout,
    setIsListView,
    isListView,
    cartItems,
    setIsCheckoutOpen,
  } = useKirbiteStore();

  const totalCartCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const totalCartAmount = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

  // Stalls storyboard targets (03-SCENE-AND-STORY)
  const stops = [
    { target: 0.20, label: 'Stop 1', stallIdx: 0 },
    { target: 0.38, label: 'Stop 2', stallIdx: 1 },
    { target: 0.54, label: 'Stop 3', stallIdx: 2 },
    { target: 0.70, label: 'Stop 4', stallIdx: 3 },
    { target: 0.88, label: 'Stop 5', stallIdx: 4 },
  ];

  // Current stall data based on currentStopIndex
  const currentStall =
    currentStopIndex >= 0 && currentStopIndex < stalls.length
      ? stalls[currentStopIndex]
      : null;

  // If inside shop, HUD is hidden so ShopInteriorOverlay has full stage
  if (activeShop) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-20 flex flex-col justify-between p-4 sm:p-6">
      {/* 1. TOP CINEMATIC BAR */}
      <header className="flex items-center justify-between gap-3 pointer-events-auto">
        {/* Brand Logo & College Marker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl shadow-lg">
            <img
              src="/kirbite-logo.svg"
              alt="Kirbite"
              className="w-7 h-7 rounded-lg"
            />
            <span className="font-black text-lg tracking-tight text-white leading-none">
              Kir<span className="text-orange-500">bite</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
              VSSUT BURLA
            </span>
          </div>

          {/* Skip to plain 2D fast list view (01 accessibility rule) */}
          <button
            onClick={() => setIsListView(!isListView)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/10 backdrop-blur-xl text-xs font-bold text-slate-300 transition-colors cursor-pointer"
            title="Fast 2D catalog list"
          >
            <List className="w-3.5 h-3.5 text-orange-400" />
            <span className="hidden sm:inline">
              {isListView ? 'Cinematic Walk' : 'Skip to List'}
            </span>
          </button>
        </div>

        {/* Student Profile Pill & Cart Pill */}
        <div className="flex items-center gap-2">
          {/* Student Welcome Pill */}
          {user && (
            <div className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl text-white text-xs">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-6 h-6 rounded-full bg-slate-800 border border-orange-500/40"
              />
              <span className="font-bold hidden sm:inline">
                {user.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-orange-300 font-mono hidden md:inline">
                ({user.room})
              </span>
              <button
                onClick={logout}
                className="ml-1 p-1 hover:text-rose-400 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Floating Cart Button */}
          {totalCartCount > 0 && (
            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold shadow-lg shadow-orange-600/30 transition-all cursor-pointer animate-in zoom-in-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{totalCartCount}</span>
              <span className="text-orange-200">₹{totalCartAmount}</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. CENTER CINEMATIC PROLOGUE / EPILOGUE HEADLINES */}
      <div className="my-auto text-center px-4 pointer-events-none">
        {scrollProgress < 0.12 && (
          <div className="max-w-xl mx-auto space-y-3 animate-in fade-in zoom-in-95 duration-500">
            <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
              Campus Night Market
            </span>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-xl leading-tight">
              Hungry in hostel?
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-orange-100/90 drop-shadow">
              Don't open a menu. Walk down Kirba Chowk.
            </p>
            <p className="text-xs text-slate-400 tracking-wider uppercase font-semibold mt-4 animate-bounce">
              ↓ Scroll to begin walking ↓
            </p>
          </div>
        )}

        {scrollProgress > 0.94 && (
          <div className="max-w-xl mx-auto space-y-3 animate-in fade-in duration-500">
            <span className="inline-block text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Kirba Chowk Complete
            </span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white drop-shadow-xl">
              Your food's on its way.
            </h2>
            <p className="text-base sm:text-xl font-bold text-slate-200">
              See you at Kirba Chowk.
            </p>
            <button
              onClick={() => onScrollToStop(0.20)}
              className="pointer-events-auto mt-4 px-5 py-2.5 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg transition-all cursor-pointer"
            >
              Walk Again from Stop 1
            </button>
          </div>
        )}
      </div>

      {/* 3. BOTTOM CINEMATIC HUD (Active Stall Stop Card) */}
      <footer className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4 pointer-events-auto">
        {/* Stall Stop Card */}
        {currentStall ? (
          <div className="w-full sm:max-w-md bg-slate-950/85 border border-white/15 rounded-3xl p-5 shadow-2xl backdrop-blur-2xl text-white animate-in slide-in-from-bottom-6 duration-300">
            {/* Stop Indicator */}
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-orange-400 mb-1.5">
              <span>STOP {currentStopIndex + 1} OF 5 · STALL #{currentStopIndex + 1}</span>
              <span className="flex items-center gap-1 text-white bg-white/10 px-2 py-0.5 rounded-full font-bold">
                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                {currentStall.rating}
              </span>
            </div>

            {/* Title & Pitch */}
            <h3 className="text-xl font-black text-white leading-tight">
              {currentStall.stallName}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 leading-relaxed">
              {currentStall.description}
            </p>

            {/* Meta row: Open status, delivery time, owner */}
            <div className="flex items-center gap-3 my-3 text-xs text-slate-400 border-t border-b border-white/10 py-2">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  currentStall.isOpen
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    currentStall.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {currentStall.isOpen ? 'OPEN NOW' : 'SHUTTER DOWN'}
              </span>

              <span className="flex items-center gap-1 font-semibold text-slate-300">
                <Clock className="w-3.5 h-3.5 text-orange-400" />
                {currentStall.deliveryTime}
              </span>

              <span className="text-[11px] text-slate-400">
                By {currentStall.ownerName}
              </span>
            </div>

            {/* STEP IN BUTTON (03 spec) */}
            <button
              onClick={() => onStepIn(currentStall)}
              className={`w-full py-3 px-4 rounded-2xl font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                currentStall.isOpen
                  ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/30 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <span>{currentStall.isOpen ? 'Step in' : 'View Menu (Closed)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div />
        )}

        {/* 4. SIDE / BOTTOM DOT NAVIGATION */}
        <div className="flex items-center gap-2 p-2 rounded-2xl bg-black/60 border border-white/10 backdrop-blur-xl">
          {stops.map((stop, i) => {
            const isCurrent = currentStopIndex === i;
            return (
              <button
                key={stop.label}
                onClick={() => onScrollToStop(stop.target)}
                className={`relative px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>{stop.label}</span>
              </button>
            );
          })}
        </div>
      </footer>
    </div>
  );
};
