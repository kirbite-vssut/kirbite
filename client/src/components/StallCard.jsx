import React from 'react';
import { Star, Clock, MapPin, ChevronRight, Phone } from 'lucide-react';

export const StallCard = ({ stall, onSelect }) => {
  const {
    _id,
    stallName,
    ownerName,
    phone,
    location,
    isOpen,
    rating = 4.5,
    cuisine = [],
    deliveryTime = '15-20 min',
    bannerImage,
    description,
  } = stall;

  return (
    <div
      onClick={() => onSelect(stall)}
      className={`group relative bg-white rounded-2xl overflow-hidden border border-slate-200/80 hover:border-orange-300 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col cursor-pointer ${
        !isOpen ? 'opacity-75 grayscale-25' : ''
      }`}
    >
      {/* Stall Banner Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={bannerImage}
          alt={stallName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge: Open / Closed */}
        <div className="absolute top-3 left-3">
          {isOpen ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              OPEN NOW
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
              CLOSED
            </span>
          )}
        </div>

        {/* Rating & Delivery Time Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {rating}
          </span>
        </div>

        {/* Delivery Time Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-white text-xs font-semibold drop-shadow-sm">
          <Clock className="w-3.5 h-3.5 text-orange-400" />
          <span>{deliveryTime} delivery to hostel</span>
        </div>
      </div>

      {/* Stall Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-orange-600 transition-colors">
              {stallName}
            </h3>
            <div className="p-1 rounded-full bg-slate-100 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>

          <p className="text-xs text-slate-500 line-clamp-1 mt-1 mb-2.5">
            {description}
          </p>

          {/* Cuisine pills */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {cuisine.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Location & Owner Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 truncate max-w-[200px]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="font-medium text-slate-700">
            {ownerName.split(' ')[0]}
          </div>
        </div>
      </div>
    </div>
  );
};
