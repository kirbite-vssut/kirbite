import React, { useEffect, useRef, useState } from 'react';
import { useKirbiteStore } from '../store/useKirbiteStore';

export const FrameCanvas = ({ stalls = [] }) => {
  const canvasRef = useRef(null);
  const {
    scrollProgress,
    currentStopIndex,
    activeShop,
    isEnteringShop,
    setPreloadProgress,
  } = useKirbiteStore();

  const [hasRealFrames, setHasRealFrames] = useState(false);
  const framesCacheRef = useRef([]);
  const targetFrameRef = useRef(0);
  const currentFrameRef = useRef(0);
  const animFrameIdRef = useRef(null);
  const pushInRef = useRef(0); // 0 (street) to 1 (inside shop)

  const TOTAL_STREET_FRAMES = 240;

  // Check if real frame assets exist in /frames/street/
  useEffect(() => {
    let active = true;
    const testImg = new Image();
    testImg.src = '/frames/street/f_000.webp';
    testImg.onload = () => {
      if (!active) return;
      setHasRealFrames(true);
      preloadStreetFrames();
    };
    testImg.onerror = () => {
      if (!active) return;
      setHasRealFrames(false);
      setPreloadProgress(100); // Instantly ready in cinematic procedural mode!
    };
    return () => {
      active = false;
    };
  }, []);

  // Preload real frames if available
  const preloadStreetFrames = () => {
    let loaded = 0;
    const cache = [];
    for (let i = 0; i < TOTAL_STREET_FRAMES; i++) {
      const img = new Image();
      const num = String(i).padStart(3, '0');
      img.src = `/frames/street/f_${num}.webp`;
      img.onload = () => {
        loaded++;
        const pct = Math.min(100, Math.round((loaded / TOTAL_STREET_FRAMES) * 100));
        setPreloadProgress(pct);
      };
      cache.push(img);
    }
    framesCacheRef.current = cache;
  };

  // Main rendering loop (smooth lerp 60fps)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    let lastTime = performance.now();

    const render = (time) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      // Lerp frame scrubbing
      targetFrameRef.current = scrollProgress * (TOTAL_STREET_FRAMES - 1);
      currentFrameRef.current += (targetFrameRef.current - currentFrameRef.current) * 0.12;

      // Lerp push-in camera dolly (0 = street view, 1 = inside shop)
      const targetPushIn = activeShop ? 1 : 0;
      pushInRef.current += (targetPushIn - pushInRef.current) * 0.08;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = canvas.width;
      const height = canvas.height;

      ctx.save();
      ctx.clearRect(0, 0, width, height);

      const frameIdx = Math.round(currentFrameRef.current);

      if (hasRealFrames && framesCacheRef.current[frameIdx]?.complete) {
        // Draw real film frame with cover math
        const img = framesCacheRef.current[frameIdx];
        drawCoverImage(ctx, img, width, height, pushInRef.current);
      } else {
        // High-aesthetic Cinematic Procedural Night Market Engine
        drawCinematicProceduralScene(
          ctx,
          width,
          height,
          scrollProgress,
          pushInRef.current,
          time,
          stalls,
          activeShop
        );
      }

      ctx.restore();
      animFrameIdRef.current = requestAnimationFrame(render);
    };

    animFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [scrollProgress, activeShop, hasRealFrames, stalls]);

  // Helper to draw image scaled to cover
  const drawCoverImage = (ctx, img, width, height, pushIn) => {
    const imgRatio = img.width / img.height;
    const screenRatio = width / height;
    let sWidth, sHeight, sx, sy;

    if (screenRatio > imgRatio) {
      sWidth = width;
      sHeight = width / imgRatio;
      sx = 0;
      sy = (height - sHeight) / 2;
    } else {
      sHeight = height;
      sWidth = height * imgRatio;
      sx = (width - sWidth) / 2;
      sy = 0;
    }

    // Camera push-in scale zoom
    const zoom = 1 + pushIn * 0.35;
    ctx.translate(width / 2, height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-width / 2, -height / 2);

    ctx.drawImage(img, sx, sy, sWidth, sHeight);
  };

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ display: 'block' }}
    />
  );
};

// ==========================================
// CINEMATIC PROCEDURAL NIGHT MARKET ENGINE
// Photoreal 35mm atmosphere with wet pavement reflections,
// tungsten lights, steam, and dusk-to-night gradient
// ==========================================
function drawCinematicProceduralScene(
  ctx,
  width,
  height,
  progress,
  pushIn,
  time,
  stalls,
  activeShop
) {
  const t = time * 0.001;

  // 1. SKY & AMBIENT (Golden dusk 0.0 -> deep blue night 1.0)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.65);
  if (progress < 0.35) {
    // Dusk to twilight
    const p = progress / 0.35;
    skyGrad.addColorStop(0, lerpColor('#090d16', '#020617', p));
    skyGrad.addColorStop(0.5, lerpColor('#311026', '#0f172a', p));
    skyGrad.addColorStop(1, lerpColor('#7c2d12', '#1e1b4b', p));
  } else {
    // Deep midnight
    skyGrad.addColorStop(0, '#02040a');
    skyGrad.addColorStop(0.6, '#070d1a');
    skyGrad.addColorStop(1, '#0c162c');
  }

  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, height);

  // Distant Hostel Buildings & Campus Lights
  drawDistantHostels(ctx, width, height, progress, t);

  // 2. WET ASPHALT GROUND WITH REFLECTIONS
  const groundY = height * 0.58;
  const groundGrad = ctx.createLinearGradient(0, groundY, 0, height);
  groundGrad.addColorStop(0, '#0b0f19');
  groundGrad.addColorStop(0.4, '#080a11');
  groundGrad.addColorStop(1, '#040508');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, groundY, width, height - groundY);

  // Wet pavement reflective sheen
  drawWetPavementReflections(ctx, width, height, groundY, progress, t);

  // 3. PERSPECTIVE FOOD STREET & STALL HUBS
  drawStreetStalls(ctx, width, height, progress, pushIn, t, stalls, activeShop);

  // 4. SUBTLE 35mm FILM GRAIN & VIGNETTE
  drawVignetteAndFog(ctx, width, height, progress, pushIn);
}

// Draw distant hostel silhouettes with warm window lights
function drawDistantHostels(ctx, width, height, progress, t) {
  ctx.save();
  const groundY = height * 0.58;

  ctx.fillStyle = 'rgba(7, 10, 18, 0.95)';
  const bldgWidths = [width * 0.22, width * 0.18, width * 0.28, width * 0.2];
  let curX = width * 0.05;

  bldgWidths.forEach((bw, idx) => {
    const bh = height * (0.24 + (idx % 3) * 0.05);
    const by = groundY - bh;
    ctx.fillRect(curX, by, bw, bh);

    // Glowing hostel windows
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 5; c++) {
        if ((r * 3 + c + idx) % 4 !== 0) {
          ctx.fillRect(
            curX + 15 + c * (bw / 6),
            by + 15 + r * (bh / 5),
            bw / 12,
            bh / 8
          );
        }
      }
    }
    ctx.fillStyle = 'rgba(7, 10, 18, 0.95)';
    curX += bw + width * 0.04;
  });

  ctx.restore();
}

// Wet pavement puddle reflections & light scatter
function drawWetPavementReflections(ctx, width, height, groundY, progress, t) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Warm tungsten reflection strips on wet road
  const puddleCenters = [width * 0.25, width * 0.5, width * 0.75];
  puddleCenters.forEach((cx, idx) => {
    const flicker = Math.sin(t * 3 + idx) * 0.05 + 0.15;
    const grad = ctx.createRadialGradient(
      cx,
      groundY + height * 0.2,
      10,
      cx,
      groundY + height * 0.2,
      width * 0.35
    );
    grad.addColorStop(0, `rgba(251, 146, 60, ${flicker})`);
    grad.addColorStop(0.5, `rgba(245, 158, 11, ${flicker * 0.5})`);
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY, width, height - groundY);
  });

  ctx.restore();
}

// Perspective stalls along the walk
function drawStreetStalls(ctx, width, height, progress, pushIn, t, stalls, activeShop) {
  const groundY = height * 0.58;

  // Stalls positions along scroll range
  const stallStops = [
    { idx: 0, pos: 0.20, name: 'Sharma Ji Fast Food & Maggi Point', color: '#f59e0b', specialty: 'Maggi' },
    { idx: 1, pos: 0.38, name: 'South Express Dosa Plaza', color: '#fbbf24', specialty: 'Dosa' },
    { idx: 2, pos: 0.54, name: 'Kirba Chinese Wok & Momo Point', color: '#ef4444', specialty: 'Momos' },
    { idx: 3, pos: 0.70, name: 'Biryani & Roll Corner', color: '#f97316', specialty: 'Biryani' },
    { idx: 4, pos: 0.88, name: 'Chai Sutta & Night Canteen', color: '#38bdf8', specialty: 'Chai' },
  ];

  stallStops.forEach((stop, i) => {
    // Relative distance to camera (-1 to +1)
    const dist = stop.pos - progress;
    if (Math.abs(dist) > 0.35 && !activeShop) return;

    // Scale and position based on camera walk
    const scale = Math.max(0.2, 1 - Math.abs(dist) * 2.8);
    const alpha = Math.max(0, 1 - Math.abs(dist) * 3.5);
    const xOffset = dist * width * 1.8;
    const centerX = width * 0.5 + xOffset;

    const stallData = stalls[i];
    const isClosed = stallData ? !stallData.isOpen : false;

    // Camera push-in zoom into current active shop
    const isThisActive = activeShop && activeShop._id === stallData?._id;
    const zoomMultiplier = isThisActive ? 1 + pushIn * 0.9 : 1;

    ctx.save();
    ctx.translate(centerX, groundY);
    ctx.scale(scale * zoomMultiplier, scale * zoomMultiplier);
    ctx.globalAlpha = isThisActive ? 1 : alpha;

    // Draw realistic stall structure
    drawIndividualStall(ctx, width, height, stop, isClosed, t, pushIn, isThisActive);

    ctx.restore();
  });
}

// Single stall visual rendering
function drawIndividualStall(ctx, width, height, stop, isClosed, t, pushIn, isThisActive) {
  const sWidth = Math.min(width * 0.85, 750);
  const sHeight = sWidth * 0.65;

  ctx.translate(-sWidth / 2, -sHeight);

  // 1. Warm Stall Backing & Lighting Glow
  const glowGrad = ctx.createRadialGradient(
    sWidth / 2,
    sHeight * 0.45,
    20,
    sWidth / 2,
    sHeight * 0.45,
    sWidth * 0.7
  );
  glowGrad.addColorStop(0, isClosed ? 'rgba(239, 68, 68, 0.25)' : 'rgba(251, 146, 60, 0.4)');
  glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(-sWidth * 0.2, -sHeight * 0.2, sWidth * 1.4, sHeight * 1.4);

  // 2. Stall Outer Shell & Counter
  ctx.fillStyle = '#111625';
  ctx.beginPath();
  ctx.roundRect(0, 0, sWidth, sHeight, [24, 24, 8, 8]);
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // 3. Striped / Glowing Stall Canopy Awning
  const awningH = sHeight * 0.28;
  const awningGrad = ctx.createLinearGradient(0, 0, 0, awningH);
  awningGrad.addColorStop(0, '#ea580c');
  awningGrad.addColorStop(1, '#c2410c');
  ctx.fillStyle = awningGrad;
  ctx.beginPath();
  ctx.roundRect(0, 0, sWidth, awningH, [24, 24, 0, 0]);
  ctx.fill();

  // Canopy stripes
  ctx.fillStyle = '#ffffff18';
  for (let i = 0; i < sWidth; i += sWidth / 12) {
    ctx.fillRect(i, 0, sWidth / 24, awningH);
  }

  // 4. Stall Name Signboard (illuminated neon glow)
  ctx.fillStyle = '#0a0d14';
  const signH = awningH * 0.45;
  ctx.fillRect(sWidth * 0.1, awningH * 0.3, sWidth * 0.8, signH);
  ctx.strokeStyle = isClosed ? '#ef4444' : '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(sWidth * 0.1, awningH * 0.3, sWidth * 0.8, signH);

  // Glowing Sign text
  ctx.fillStyle = isClosed ? '#f87171' : '#fef08a';
  ctx.font = `bold ${Math.round(sWidth * 0.038)}px 'Plus Jakarta Sans', system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(stop.name, sWidth / 2, awningH * 0.3 + signH / 2);

  // 5. Serving Counter Hatch & Food Scene OR Closed Roller Shutter
  const hatchY = awningH + 15;
  const hatchH = sHeight - hatchY - 30;
  const hatchW = sWidth - 40;

  if (isClosed) {
    // STEEL ROLLER SHUTTER DOWN (Stop 3 / Closed variant - 03 & 04 spec)
    ctx.fillStyle = '#1e2433';
    ctx.fillRect(20, hatchY, hatchW, hatchH);

    // Shutter horizontal slats
    ctx.strokeStyle = '#0f1420';
    ctx.lineWidth = 2;
    for (let sy = hatchY; sy < hatchY + hatchH; sy += 14) {
      ctx.beginPath();
      ctx.moveTo(20, sy);
      ctx.lineTo(20 + hatchW, sy);
      ctx.stroke();
    }

    // Closed Shutter Stamp
    ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
    ctx.beginPath();
    ctx.roundRect(sWidth / 2 - 80, hatchY + hatchH * 0.4, 160, 44, 12);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('SHUTTER CLOSED', sWidth / 2, hatchY + hatchH * 0.4 + 22);
  } else {
    // OPEN VENDOR KITCHEN INTERIOR
    const kitchenGrad = ctx.createLinearGradient(0, hatchY, 0, hatchY + hatchH);
    kitchenGrad.addColorStop(0, '#2d1808');
    kitchenGrad.addColorStop(1, '#1c1007');
    ctx.fillStyle = kitchenGrad;
    ctx.fillRect(20, hatchY, hatchW, hatchH);

    // Warm tungsten bulb pendant lights
    for (let b = 1; b <= 3; b++) {
      const bx = 20 + (hatchW / 4) * b;
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(bx, hatchY + 12, 6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hot steam rising from cooking pan
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.fillStyle = '#ffffff';
    for (let s = 0; s < 5; s++) {
      const sx = sWidth * 0.4 + Math.sin(t * 2 + s) * 20;
      const sy = hatchY + hatchH * 0.7 - ((t * 40 + s * 25) % (hatchH * 0.6));
      ctx.beginPath();
      ctx.arc(sx, sy, 12 + s * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Food prep counter surface
    ctx.fillStyle = '#475569';
    ctx.fillRect(10, hatchY + hatchH - 24, sWidth - 20, 24);
  }
}

// Vignette & Light Mist
function drawVignetteAndFog(ctx, width, height, progress, pushIn) {
  ctx.save();
  const vigGrad = ctx.createRadialGradient(
    width / 2,
    height / 2,
    width * 0.35,
    width / 2,
    height / 2,
    width * 0.75
  );
  vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  vigGrad.addColorStop(1, 'rgba(3, 7, 18, 0.7)');
  ctx.fillStyle = vigGrad;
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}

function lerpColor(a, b, amount) {
  const ah = parseInt(a.replace(/#/g, ''), 16);
  const ar = ah >> 16, ag = (ah >> 8) & 0xff, ab = ah & 0xff;
  const bh = parseInt(b.replace(/#/g, ''), 16);
  const br = bh >> 16, bg = (bh >> 8) & 0xff, bb = bh & 0xff;
  const rr = Math.round(ar + amount * (br - ar));
  const rg = Math.round(ag + amount * (bg - ag));
  const rb = Math.round(ab + amount * (bb - ab));
  return `rgb(${rr}, ${rg}, ${rb})`;
}
