import React, { useState } from 'react';
import {
  Phone,
  ShieldCheck,
  ArrowRight,
  User,
  Home,
  CheckCircle2,
  Sparkles,
  Lock,
  UtensilsCrossed,
} from 'lucide-react';
import { useKirbiteStore } from '../store/useKirbiteStore';

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

export const SignInGate = () => {
  const { loginStudent } = useKirbiteStore();

  // Step 1: Phone + OTP / Quick Sign-In
  // Step 2: First-Login Profile (Hostel Block & Room)
  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'profile'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Profile fields
  const [name, setName] = useState('');
  const [hostelBlock, setHostelBlock] = useState(HOSTEL_BLOCKS[0]);
  const [room, setRoom] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Send OTP handler
  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone.trim() || phone.trim().length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      const code = '1234';
      setGeneratedOtp(code);
      setOtpSent(true);
      setStep('otp');
      setLoading(false);
    }, 600);
  };

  // Verify OTP handler
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp !== '1234' && otp !== generatedOtp) {
      setError('Invalid OTP code. Please enter 1234 for demo verification.');
      return;
    }
    setError('');
    setStep('profile');
  };

  // Save profile and enter Kirba Chowk
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    if (!room.trim()) {
      setError('Please enter your hostel room number');
      return;
    }

    loginStudent({
      name,
      phone,
      hostelBlock,
      room,
    });
  };

  // Fast Quick Access for instant testing
  const handleFastDemoLogin = (studentName, block, roomNo) => {
    loginStudent({
      name: studentName,
      phone: '9876543210',
      hostelBlock: block,
      room: roomNo,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black/85 backdrop-blur-md">
      {/* Background cinematic atmospheric lighting */}
      <div className="absolute inset-0 bg-radial from-orange-950/30 via-slate-950/80 to-black pointer-events-none" />

      {/* Centered Glassmorphic Card (02-AUTH-FLOW) */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 border border-white/10 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-2xl text-white">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-tr from-amber-600 to-orange-600 shadow-lg shadow-orange-600/30 mb-3">
            <img
              src="/kirbite-logo.svg"
              alt="Kirbite"
              className="w-10 h-10 drop-shadow"
            />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
            Sign in to enter Kirba Chowk
          </h2>
          <p className="text-xs text-orange-200/80 mt-1 font-medium">
            Hostel food delivery • VSSUT Burla
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
            {error}
          </div>
        )}

        {/* STEP 1: Phone Entry */}
        {step === 'phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3.5 text-xs font-bold text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl pl-12 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-mono tracking-wider"
                  autoFocus
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Send Login Code</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Student Access for Instant Review */}
            <div className="pt-2 border-t border-white/5">
              <span className="block text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                Or Instant 1-Click Demo Login
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleFastDemoLogin('Aryan Verma', 'CV Raman Hall', '304')}
                  className="py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Aryan (CV Raman)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFastDemoLogin('Ananya Patel', 'Gargi Girls Hostel', '212')}
                  className="py-2 px-3 rounded-xl bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/80 text-[11px] font-semibold text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Ananya (Gargi)</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-200 flex items-center justify-between">
              <span>Code sent to +91 {phone}</span>
              <span className="font-mono font-bold text-amber-400">Code: 1234</span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Enter 4-Digit Code
              </label>
              <input
                type="text"
                maxLength={4}
                placeholder="1234"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-2xl px-4 py-3.5 text-center text-xl font-mono tracking-widest text-white focus:outline-hidden focus:border-orange-500"
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Verify & Continue</span>
            </button>

            <button
              type="button"
              onClick={() => setStep('phone')}
              className="w-full text-center text-xs text-slate-400 hover:text-white"
            >
              Change mobile number
            </button>
          </form>
        )}

        {/* STEP 3: First-Login Profile (Hostel Block & Room) */}
        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-3.5">
            <div className="text-left mb-2">
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">
                One-Time Setup
              </span>
              <p className="text-xs text-slate-400">
                Set your hostel room once. All orders will be delivered here directly.
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                Your Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Aryan Verma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Hostel Block *
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <select
                    value={hostelBlock}
                    onChange={(e) => setHostelBlock(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-8 pr-2 py-2.5 text-xs text-white focus:outline-hidden focus:border-orange-500"
                  >
                    {HOSTEL_BLOCKS.map((h) => (
                      <option key={h} value={h} className="bg-slate-900 text-white">
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  Room No *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 304"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-orange-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3.5 px-4 bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Enter Kirba Chowk</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Why sign in footer note (02-AUTH-FLOW) */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
          <p className="text-[11px] text-slate-400">
            <span className="font-semibold text-slate-300">Why sign in?</span> So your hostel block and room are remembered and vendors can reach you immediately.
          </p>
          <div className="flex items-center justify-center gap-3 text-[10px] text-slate-500">
            <span>VSSUT Burla Campus Delivery</span>
            <span>•</span>
            <span>No Guest Checkout</span>
          </div>
        </div>
      </div>
    </div>
  );
};
