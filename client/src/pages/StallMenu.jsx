import React, { useState, useEffect, useMemo } from 'react';
import {
  ArrowLeft,
  Star,
  Clock,
  MapPin,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Search,
} from 'lucide-react';
import { MenuItemCard } from '../components/MenuItemCard';
import { useCart } from '../context/CartContext';
import { api } from '../utils/api';

export const StallMenu = ({ stallId, onBack }) => {
  const [stall, setStall] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [vegOnly, setVegOnly] = useState(false);
  const [searchDish, setSearchDish] = useState('');

  const { totalCount, totalAmount, setIsCartOpen, cartStall } = useCart();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        const res = await api.getStallMenu(stallId);
        if (res.success) {
          setStall(res.data.stall);
          setMenuItems(res.data.menuItems);
        }
      } catch (err) {
        console.error('Menu load error:', err);
        setError('Failed to load menu items');
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, [stallId]);

  // Extract unique categories from items
  const categories = useMemo(() => {
    const cats = new Set(menuItems.map((item) => item.category));
    return ['ALL', ...Array.from(cats)];
  }, [menuItems]);

  // Filtered Items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
      const matchVeg = !vegOnly || item.isVeg;
      const matchSearch =
        item.name.toLowerCase().includes(searchDish.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchDish.toLowerCase());
      return matchCat && matchVeg && matchSearch;
    });
  }, [menuItems, activeCategory, vegOnly, searchDish]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-sm font-semibold text-slate-500">
          Loading Kirba Chowk menu...
        </p>
      </div>
    );
  }

  if (error || !stall) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
        <p className="text-rose-600 font-semibold mb-4">{error || 'Stall not found'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold"
        >
          Return to Stalls
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 mb-4 transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>Back to Kirba Chowk Stalls</span>
      </button>

      {/* Stall Hero Header */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 shadow-xs mb-8">
        <div className="relative h-48 sm:h-60 w-full overflow-hidden bg-slate-100">
          <img
            src={stall.bannerImage}
            alt={stall.stallName}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-transparent" />

          {/* Status Badge */}
          <div className="absolute top-4 left-4">
            {stall.isOpen ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                ACCEPTING ORDERS
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
                CLOSED RIGHT NOW
              </span>
            )}
          </div>

          {/* Rating */}
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white text-slate-800 shadow-sm">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              {stall.rating}
            </span>
          </div>

          {/* Stall Name & Details Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {stall.stallName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 line-clamp-1">
              {stall.description}
            </p>
          </div>
        </div>

        {/* Stall Meta Bar */}
        <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-600">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-1.5 font-medium">
              <Clock className="w-4 h-4 text-orange-600" />
              <span>{stall.deliveryTime} delivery</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-orange-600" />
              <span>{stall.location}</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>UPI Verified: {stall.upiId}</span>
            </div>
          </div>

          <a
            href={`tel:${stall.phone}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 font-bold text-slate-700 shadow-2xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-orange-600" />
            <span>Call Stall</span>
          </a>
        </div>
      </div>

      {/* Category Tabs and Filter Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat === 'ALL' ? 'All Dishes' : cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all ${
              vegOnly
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center ${
                vegOnly ? 'border-emerald-600' : 'border-slate-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  vegOnly ? 'bg-emerald-600' : 'bg-transparent'
                }`}
              />
            </span>
            <span>Pure Veg</span>
          </button>
        </div>
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
          <p className="text-slate-600 font-bold">No dishes found in this filter.</p>
          <button
            onClick={() => {
              setActiveCategory('ALL');
              setVegOnly(false);
              setSearchDish('');
            }}
            className="mt-3 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <MenuItemCard key={item._id} item={item} stall={stall} />
          ))}
        </div>
      )}

      {/* Floating Bottom Cart Bar (Mobile First Experience) */}
      {totalCount > 0 && cartStall && (
        <div className="fixed bottom-4 left-4 right-4 max-w-xl mx-auto z-40 animate-in slide-in-from-bottom duration-300">
          <div className="bg-slate-900 text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center font-black text-sm">
                {totalCount}
              </div>
              <div>
                <p className="text-xs text-slate-400 font-medium truncate max-w-[150px] sm:max-w-[200px]">
                  {cartStall.stallName}
                </p>
                <p className="text-base font-extrabold text-white">₹{totalAmount}</p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2.5 px-4 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              <span>View Cart</span>
              <ShoppingBag className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
