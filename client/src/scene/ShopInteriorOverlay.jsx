import React, { useEffect, useState, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useKirbiteStore } from '../store/useKirbiteStore';
import { api } from '../utils/api';

export const ShopInteriorOverlay = ({ stall, onBackToStreet }) => {
  const { cartItems, addToCart, removeFromCart, setIsCheckoutOpen } = useKirbiteStore();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);

  const totalCartCount = cartItems.reduce((s, i) => s + (i.quantity || 1), 0);
  const totalCartAmount = cartItems.reduce((s, i) => s + i.price * (i.quantity || 1), 0);

  // Fetch live menu from API
  useEffect(() => {
    if (!stall) return;
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await api.getStallMenu(stall._id);
        if (res.success) {
          setMenuItems(res.data.menuItems || []);
        }
      } catch (err) {
        console.error('Failed to load shop menu:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [stall]);

  // Extract categories
  const categories = useMemo(() => {
    const set = new Set(menuItems.map((m) => m.category));
    return ['ALL', ...Array.from(set)];
  }, [menuItems]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter((m) => {
      const matchCat = activeCategory === 'ALL' || m.category === activeCategory;
      const matchVeg = !vegOnly || m.isVeg;
      return matchCat && matchVeg;
    });
  }, [menuItems, activeCategory, vegOnly]);

  if (!stall) return null;

  return (
    <div className="fixed inset-0 z-30 flex flex-col justify-end pointer-events-none animate-in fade-in duration-300">
      {/* Background radial gradient to give focused warm kitchen bokeh */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/70 to-black/40 pointer-events-auto" />

      {/* Main Glassmorphic Menu Drawer Sheet */}
      <div className="relative z-10 w-full max-w-4xl mx-auto h-[88vh] bg-slate-950/90 border-t border-white/15 rounded-t-3xl shadow-2xl backdrop-blur-2xl flex flex-col pointer-events-auto overflow-hidden animate-in slide-in-from-bottom duration-400">
        {/* Top Stall Bar */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between gap-4 bg-white/5">
          <div className="flex items-center gap-3">
            {/* Back to Street Button (03 Spec) */}
            <button
              onClick={onBackToStreet}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Street</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
                  {stall.stallName}
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    stall.isOpen
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {stall.isOpen ? 'ONLINE' : 'CLOSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {stall.deliveryTime} • {stall.location} • By {stall.ownerName}
              </p>
            </div>
          </div>

          <a
            href={`tel:${stall.phone}`}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-orange-300"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call Stall</span>
          </a>
        </div>

        {/* Filter Bar (Categories & Veg Only) */}
        <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between gap-3 overflow-x-auto scrollbar-none bg-black/20">
          <div className="flex items-center gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'ALL' ? 'All Dishes' : cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              vegOnly
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/5 text-slate-400 border-white/10'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                vegOnly ? 'bg-emerald-400' : 'bg-slate-500'
              }`}
            />
            <span>Pure Veg</span>
          </button>
        </div>

        {/* Menu Items Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-28">
          {loading ? (
            <div className="py-20 text-center text-xs font-bold text-slate-400 flex flex-col items-center">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
              <span>Loading fresh kitchen menu...</span>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400">
              No dishes available in this filter.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredDishes.map((item) => {
                const inCart = cartItems.find((c) => c._id === item._id);
                const quantity = inCart ? inCart.quantity : 0;

                return (
                  <div
                    key={item._id}
                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-4"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Veg indicator & Category */}
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                            item.isVeg ? 'border-emerald-500' : 'border-rose-500'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'
                            }`}
                          />
                        </span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {item.category}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-white text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                        {item.description}
                      </p>
                      <div className="mt-2 text-base font-black text-white">
                        ₹{item.price}
                      </div>
                    </div>

                    {/* Image & Add Button */}
                    <div className="relative shrink-0 flex flex-col items-center">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-24 h-20 rounded-xl object-cover bg-slate-800"
                        loading="lazy"
                      />

                      <div className="absolute -bottom-2">
                        {!stall.isOpen ? (
                          <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 border border-slate-700">
                            Closed
                          </span>
                        ) : quantity > 0 ? (
                          <div className="flex items-center bg-orange-600 text-white rounded-xl px-2 py-0.5 shadow-md text-xs font-bold">
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="p-1 hover:text-black cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2">{quantity}</span>
                            <button
                              onClick={() => addToCart(item, stall)}
                              className="p-1 hover:text-black cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => addToCart(item, stall)}
                            className="px-3.5 py-1 bg-white hover:bg-orange-50 text-orange-600 font-extrabold text-xs uppercase rounded-xl shadow-md transition-all cursor-pointer border border-orange-200"
                          >
                            + ADD
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Bottom Cart Bar inside Shop */}
        {totalCartCount > 0 && (
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="p-3.5 rounded-2xl bg-orange-600 text-white shadow-2xl flex items-center justify-between border border-orange-400/40 animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-black text-sm">
                  {totalCartCount}
                </div>
                <div>
                  <span className="text-[11px] text-orange-100 font-semibold block leading-tight">
                    Kirba Chowk Hostel Delivery
                  </span>
                  <span className="text-base font-black">₹{totalCartAmount}</span>
                </div>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="py-2 px-4 bg-white hover:bg-orange-50 text-orange-700 text-xs font-black rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <span>Checkout</span>
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
