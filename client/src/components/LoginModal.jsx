import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Home,
  Store,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  LogOut,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HOSTEL_BLOCKS = [
  'CV Raman Hall',
  'Vasishtha Hostel',
  'Aryabhatta Hostel',
  'Gargi Girls Hostel',
  'Kalpana Chawla Girls Hostel',
  'Ramanujan Hostel',
  'Shivalik Hostel',
  'Nilgiri Hostel',
  'Bhabha Hall',
];

export const LoginModal = ({ stalls = [], onVendorSuccess }) => {
  const {
    user,
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalTab,
    setAuthModalTab,
    loginStudent,
    loginVendor,
    logout,
  } = useAuth();

  // Student form state
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentPhone, setStudentPhone] = useState(user?.phone || '');
  const [hostelBlock, setHostelBlock] = useState(user?.hostelBlock || HOSTEL_BLOCKS[0]);
  const [roomNumber, setRoomNumber] = useState(user?.room || '');

  // Vendor form state
  const [selectedStallId, setSelectedStallId] = useState(
    stalls[0]?._id || ''
  );
  const [vendorPin, setVendorPin] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (stalls.length > 0 && !selectedStallId) {
      setSelectedStallId(stalls[0]._id);
    }
  }, [stalls]);

  useEffect(() => {
    if (user && user.role === 'student') {
      setStudentName(user.name || '');
      setStudentPhone(user.phone || '');
      setHostelBlock(user.hostelBlock || HOSTEL_BLOCKS[0]);
      setRoomNumber(user.room || '');
    }
  }, [user]);

  if (!isAuthModalOpen) return null;

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setErrorMessage('Please enter your full name');
      return;
    }
    if (!studentPhone.trim() || studentPhone.trim().length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!roomNumber.trim()) {
      setErrorMessage('Please enter your hostel room number');
      return;
    }

    setErrorMessage('');
    loginStudent({
      name: studentName,
      phone: studentPhone,
      hostelBlock,
      room: roomNumber,
    });
    setSuccessMessage('Welcome to Kirbite! Profile saved.');
    setTimeout(() => {
      setSuccessMessage('');
      setIsAuthModalOpen(false);
    }, 1000);
  };

  const handleVendorSubmit = (e) => {
    e.preventDefault();
    if (!selectedStallId) {
      setErrorMessage('Please select your Kirba Chowk stall');
      return;
    }
    if (!vendorPin || vendorPin.length < 4) {
      setErrorMessage('Please enter your 4-digit Vendor PIN (default: 1234)');
      return;
    }

    const stall = stalls.find((s) => s._id === selectedStallId);
    setErrorMessage('');
    const vendor = loginVendor({
      stallId: selectedStallId,
      stallName: stall?.stallName || 'Stall Owner',
      ownerPin: vendorPin,
    });

    if (onVendorSuccess) {
      onVendorSuccess(selectedStallId);
    }

    setSuccessMessage(`Logged into ${stall?.stallName || 'Vendor Dashboard'}`);
    setTimeout(() => {
      setSuccessMessage('');
      setIsAuthModalOpen(false);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[92vh]">
        {/* Header with Kirbite Logo */}
        <div className="relative bg-linear-to-r from-orange-600 via-orange-500 to-amber-600 p-6 text-white text-center">
          <button
            onClick={() => setIsAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <img
            src="/kirbite-logo.svg"
            alt="Kirbite Logo"
            className="w-14 h-14 mx-auto mb-2 rounded-2xl shadow-lg shadow-orange-700/30"
          />
          <h3 className="font-black text-2xl tracking-tight leading-tight">
            Kir<span className="text-amber-200">bite</span> Login
          </h3>
          <p className="text-xs text-orange-100 mt-1">
            Campus Hostel Food Delivery • Kirba Chowk
          </p>
        </div>

        {/* Tab Switcher: Student vs Vendor */}
        <div className="flex border-b border-slate-100 bg-slate-50/80 p-1.5">
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('student');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authModalTab === 'student'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Student Login</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthModalTab('vendor');
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authModalTab === 'vendor'
                ? 'bg-white text-orange-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Vendor Login</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto">
          {successMessage && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold">
              {errorMessage}
            </div>
          )}

          {/* If already logged in, show current profile card */}
          {user && (
            <div className="mb-5 p-3.5 bg-orange-50/60 border border-orange-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar}
                  alt={user.name || user.stallName}
                  className="w-9 h-9 rounded-full bg-white p-0.5 border border-orange-300"
                />
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {user.role === 'student' ? user.name : user.stallName}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {user.role === 'student'
                      ? `${user.hostelBlock}, Room ${user.room}`
                      : 'Verified Kirba Chowk Stall'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1 text-[11px] font-bold text-rose-600 hover:bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            </div>
          )}

          {/* Student Form */}
          {authModalTab === 'student' ? (
            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Aryan Verma"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile (for delivery calls)"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Hostel Block *
                  </label>
                  <div className="relative">
                    <Home className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={hostelBlock}
                      onChange={(e) => setHostelBlock(e.target.value)}
                      className="w-full text-xs pl-8 pr-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-medium"
                    >
                      {HOSTEL_BLOCKS.map((block) => (
                        <option key={block} value={block}>
                          {block}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                    Room No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 304"
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    className="w-full text-xs px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                Saving your details saves time during checkout so you can order with 1 tap.
              </p>

              <button
                type="submit"
                className="w-full mt-2 py-3 px-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Sparkles className="w-4 h-4 text-orange-200" />
                <span>{user ? 'Update Profile' : 'Save & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            /* Vendor Form */
            <form onSubmit={handleVendorSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Select Your Stall *
                </label>
                <div className="relative">
                  <Store className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                  <select
                    value={selectedStallId}
                    onChange={(e) => setSelectedStallId(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-bold text-slate-800"
                  >
                    {stalls.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.stallName} ({s.ownerName})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                  4-Digit Owner PIN *
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter PIN (Default: 1234)"
                    value={vendorPin}
                    onChange={(e) => setVendorPin(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono tracking-widest"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  For testing/demo: enter PIN <strong className="text-slate-600">1234</strong>.
                </p>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Logging in unlocks real-time order alerts, shop open/close controls, and kitchen actions for this stall.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-slate-900 hover:bg-black active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all"
              >
                <Store className="w-4 h-4 text-orange-400" />
                <span>Access Vendor Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
