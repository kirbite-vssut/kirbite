import React from 'react';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const MenuItemCard = ({ item, stall }) => {
  const { cartItems, addToCart, removeFromCart } = useCart();
  const cartItem = cartItems.find((i) => i._id === item._id);
  const quantity = cartItem ? cartItem.quantity : 0;
  const isStallOpen = stall?.isOpen ?? true;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs flex gap-4 transition-all">
      {/* Item Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          {/* Veg / Non-Veg Indicator Dot */}
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-4 h-4 rounded-sm border flex items-center justify-center ${
                item.isVeg ? 'border-emerald-600' : 'border-rose-600'
              }`}
              title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isVeg ? 'bg-emerald-600' : 'bg-rose-600'
                }`}
              />
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              {item.category}
            </span>
          </div>

          <h4 className="font-bold text-slate-900 text-base leading-snug">
            {item.name}
          </h4>

          <div className="mt-1 flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900">
              ₹{item.price}
            </span>
          </div>

          {item.description && (
            <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 pr-2">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Image & Add Stepper */}
      <div className="relative flex flex-col items-center shrink-0 w-28">
        <div className="w-28 h-24 rounded-xl overflow-hidden bg-slate-100">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Quantity Stepper / Add button */}
        <div className="absolute -bottom-2 w-24">
          {!isStallOpen ? (
            <div className="w-full py-1 text-center bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs">
              Closed
            </div>
          ) : !item.isAvailable ? (
            <div className="w-full py-1 text-center bg-slate-100 text-slate-400 rounded-lg text-xs font-semibold border border-slate-200 shadow-xs">
              Sold Out
            </div>
          ) : quantity > 0 ? (
            <div className="flex items-center justify-between bg-orange-600 text-white rounded-xl px-2 py-1 shadow-sm font-bold text-sm">
              <button
                onClick={() => removeFromCart(item._id)}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-700 rounded transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs px-1">{quantity}</span>
              <button
                onClick={() => addToCart(item, stall)}
                className="w-6 h-6 flex items-center justify-center hover:bg-orange-700 rounded transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(item, stall)}
              className="w-full py-1.5 px-3 bg-white text-orange-600 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-orange-200 hover:bg-orange-50 shadow-sm transition-all flex items-center justify-center gap-1 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5 text-orange-600" />
              ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
