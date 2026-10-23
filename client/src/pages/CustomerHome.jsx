import React, { useState, useMemo } from 'react';
import { Search, Flame, MapPin, Sparkles, SlidersHorizontal, Coffee, Clock } from 'lucide-react';
import { StallCard } from '../components/StallCard';

export const CustomerHome = ({ stalls, loading, onSelectStall }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [showOnlyOpen, setShowOnlyOpen] = useState(false);

  const categories = [
    { id: 'ALL', label: 'All Stalls', icon: Sparkles },
    { id: 'MAGGI', label: 'Maggi & Chai', keyword: 'Maggi' },
    { id: 'ROLLS', label: 'Kathi Rolls', keyword: 'Rolls' },
    { id: 'BIRYANI', label: 'Biryani & Rice', keyword: 'Biryani' },
    { id: 'DOSA', label: 'South Indian', keyword: 'Dosas' },
    { id: 'NIGHT', label: 'Night Canteen', keyword: 'Late Night' },
  ];

  const filteredStalls = useMemo(() => {
    return stalls.filter((stall) => {
      const matchesSearch =
        stall.stallName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        stall.cuisine.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase())) ||
        stall.location.toLowerCase().includes(searchTerm.toLowerCase());

      const selectedCat = categories.find((c) => c.id === activeCategory);
      const matchesCategory =
        activeCategory === 'ALL' ||
        (selectedCat?.keyword &&
          stall.cuisine.some((c) =>
            c.toLowerCase().includes(selectedCat.keyword.toLowerCase())
          ));

      const matchesOpen = !showOnlyOpen || stall.isOpen;

      return matchesSearch && matchesCategory && matchesOpen;
    });
  }, [stalls, searchTerm, activeCategory, showOnlyOpen]);

  return (
    <div className="pb-24">
      {/* Hero Campus Banner */}
      <section className="relative bg-linear-to-b from-orange-600 via-orange-500 to-amber-600 text-white rounded-3xl p-6 sm:p-10 mb-8 overflow-hidden shadow-lg shadow-orange-600/15">
        <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-bold mb-3">
            <MapPin className="w-3.5 h-3.5 text-orange-200" />
            <span>Kirba Chowk Campus Hub</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2 leading-tight">
            Hungry in Hostel? <br />
            Order From Kirba Chowk!
          </h1>
          <p className="text-orange-100 text-sm sm:text-base max-w-lg mb-6">
            Directly order hot butter Maggi, Kolkata kathi rolls, crispy dosas, and kulhad chai straight to your hostel room.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Search stalls, butter maggi, rolls, chai..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-slate-800 placeholder-slate-400 pl-11 pr-4 py-3.5 rounded-2xl shadow-md text-sm font-medium focus:outline-hidden focus:ring-4 focus:ring-white/30"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-3.5 text-xs text-slate-400 hover:text-slate-600 font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter Chips Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Toggle only open stalls */}
        <button
          onClick={() => setShowOnlyOpen(!showOnlyOpen)}
          className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
            showOnlyOpen
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              showOnlyOpen ? 'bg-emerald-600' : 'bg-slate-300'
            }`}
          />
          <span>Open Now Only</span>
        </button>
      </div>

      {/* Stalls Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white rounded-2xl h-72 border border-slate-200 animate-pulse overflow-hidden"
            >
              <div className="bg-slate-200 h-44 w-full" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                <div className="h-3 bg-slate-200 rounded-md w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredStalls.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/80">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-slate-800 text-lg">No Kirba Chowk stalls matched</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or turning off the "Open Now Only" filter.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setActiveCategory('ALL');
              setShowOnlyOpen(false);
            }}
            className="mt-4 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStalls.map((stall) => (
            <StallCard key={stall._id} stall={stall} onSelect={onSelectStall} />
          ))}
        </div>
      )}
    </div>
  );
};
