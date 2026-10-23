import React, { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { FrameCanvas } from './FrameCanvas';
import { SceneHUD } from './SceneHUD';
import { ShopInteriorOverlay } from './ShopInteriorOverlay';
import { useKirbiteStore } from '../store/useKirbiteStore';
import { StallCard } from '../components/StallCard';

export const StreetJourney = ({ stalls = [] }) => {
  const containerRef = useRef(null);
  const lenisRef = useRef(null);

  const {
    scrollProgress,
    setScrollProgress,
    currentStopIndex,
    setCurrentStopIndex,
    activeShop,
    setActiveShop,
    isListView,
    setIsListView,
  } = useKirbiteStore();

  // Storyboard stop anchors (03-SCENE-AND-STORY)
  const stopTargets = [0.20, 0.38, 0.54, 0.70, 0.88];

  // Initialize Lenis smooth scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Scroll listener
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const maxScroll = el.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      const progress = Math.min(1, Math.max(0, scrollTop / maxScroll));
      setScrollProgress(progress);

      // Determine active stop (with snap tolerance)
      let activeIdx = -1;
      stopTargets.forEach((tgt, idx) => {
        if (Math.abs(progress - tgt) < 0.08) {
          activeIdx = idx;
        }
      });
      setCurrentStopIndex(activeIdx);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      lenis.destroy();
    };
  }, []);

  // Programmatic scroll to target stop
  const scrollToTarget = (targetProgress) => {
    const el = containerRef.current;
    if (!el || !lenisRef.current) return;
    const maxScroll = el.offsetHeight - window.innerHeight;
    const targetY = targetProgress * maxScroll;
    lenisRef.current.scrollTo(targetY, { duration: 1.2 });
  };

  // Step in handler
  const handleStepIn = (stall) => {
    setActiveShop(stall);
  };

  const handleBackToStreet = () => {
    setActiveShop(null);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-white selection:bg-orange-500">
      {/* 1. CINEMATIC FULLSCREEN CANVAS */}
      <FrameCanvas stalls={stalls} />

      {/* 2. SCROLL CONTAINER (Simulates 240-frame walking journey) */}
      <div ref={containerRef} className="relative w-full h-[550vh] pointer-events-none">
        {/* Invisible snap anchor stops */}
        <div className="absolute top-[20%] w-full h-1" id="stop-1" />
        <div className="absolute top-[38%] w-full h-1" id="stop-2" />
        <div className="absolute top-[54%] w-full h-1" id="stop-3" />
        <div className="absolute top-[70%] w-full h-1" id="stop-4" />
        <div className="absolute top-[88%] w-full h-1" id="stop-5" />
      </div>

      {/* 3. CINEMATIC HEADS-UP DISPLAY OVERLAY */}
      <SceneHUD
        stalls={stalls}
        onStepIn={handleStepIn}
        onScrollToStop={scrollToTarget}
      />

      {/* 4. SHOP INTERIOR MODAL (Push-in camera dolly) */}
      {activeShop && (
        <ShopInteriorOverlay
          stall={activeShop}
          onBackToStreet={handleBackToStreet}
        />
      )}

      {/* 5. ACCESSIBILITY 2D FAST LIST VIEW (Skip to List) */}
      {isListView && (
        <div className="fixed inset-0 z-40 bg-slate-950/95 overflow-y-auto p-4 sm:p-8 animate-in fade-in duration-200">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-black text-white">
                  Kirba Chowk Stalls Catalog
                </h2>
                <p className="text-xs text-slate-400">
                  Fast 2D view for quick campus ordering
                </p>
              </div>
              <button
                onClick={() => setIsListView(false)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Back to Cinematic Walk
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {stalls.map((stall) => (
                <StallCard
                  key={stall._id}
                  stall={stall}
                  onSelect={(s) => {
                    setIsListView(false);
                    handleStepIn(s);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
