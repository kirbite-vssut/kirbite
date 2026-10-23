import React from 'react';
import { useKirbiteStore } from '../store/useKirbiteStore';

export const LoaderScreen = () => {
  const { preloadProgress, isPreloaded } = useKirbiteStore();

  if (isPreloaded) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-950 text-white p-6 animate-in fade-in duration-300">
      {/* Kirbite Logo */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-600/40 animate-pulse">
          <img
            src="/kirbite-logo.svg"
            alt="Kirbite"
            className="w-14 h-14 drop-shadow-md"
          />
        </div>
      </div>

      <h1 className="text-2xl font-black tracking-tight text-white mb-1">
        Kir<span className="text-orange-500">bite</span>
      </h1>
      <p className="text-xs text-slate-400 font-medium mb-6">
        Hostel food delivery • Kirba Chowk, VSSUT Burla
      </p>

      {/* Progress Bar in Brand Orange #FF5A00 */}
      <div className="w-64 max-w-full h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
        <div
          className="h-full bg-[#FF5A00] transition-all duration-300 rounded-full shadow-[0_0_12px_#FF5A00]"
          style={{ width: `${preloadProgress}%` }}
        />
      </div>

      <div className="flex items-center justify-between w-64 max-w-full mt-2 text-[11px] text-slate-400 font-mono">
        <span>Loading cinematic street...</span>
        <span>{preloadProgress}%</span>
      </div>
    </div>
  );
};
