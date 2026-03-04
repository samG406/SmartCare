'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

interface CircularRevealProps {
  isPlaying: boolean;
  color?: string;
  duration?: number;
  spinnerDuration?: number;
  ringThickness?: number;
  originX?: number;
  originY?: number;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

export default function CircularReveal({
  isPlaying,
  color = '#4361ee',
  duration = 3600,
  spinnerDuration = 200,
  ringThickness = 28,
  originX = 0.5,
  originY = 0.5,
  onMidpoint,
  onComplete,
}: CircularRevealProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const abortedRef = useRef(false);
  const [showSpinner, setShowSpinner] = useState(false);
  const midFired = useRef(false);

  const easeOutQuart = (t: number) => 1 - Math.pow(1 - t, 4);

  const playReveal = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    abortedRef.current = false;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const cx = W * originX;
    const cy = H * originY;

    const maxR =
      Math.max(
        Math.hypot(cx, cy),
        Math.hypot(W - cx, cy),
        Math.hypot(cx, H - cy),
        Math.hypot(W - cx, H - cy),
      ) + 40;

    midFired.current = false;
    const startT = performance.now();

    function draw(now: number) {
      if (abortedRef.current) return;

      const t = Math.min((now - startT) / duration, 1);
      ctx.clearRect(0, 0, W, H);

      const outerR = easeOutQuart(t) * maxR * 1.3;

      const taperStart = 0.8;
      const taper = t > taperStart ? 1 - (t - taperStart) / (1 - taperStart) : 1;
      const thickness = ringThickness * taper;
      const innerR = Math.max(0, outerR - thickness);

      if (!midFired.current && outerR > maxR * 0.45) {
        midFired.current = true;
        onMidpoint?.();
      }

      if (outerR > 0.5 && thickness > 0.3) {
        ctx.beginPath();
        ctx.arc(cx, cy, outerR, 0, Math.PI * 2, false);
        ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
        ctx.fillStyle = color;
        ctx.fill('evenodd');
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(draw);
      } else {
        ctx.clearRect(0, 0, W, H);
        onComplete?.();
      }
    }

    rafRef.current = requestAnimationFrame(draw);
  }, [color, duration, ringThickness, originX, originY, onMidpoint, onComplete]);

  useEffect(() => {
    if (!isPlaying) {
      setShowSpinner(false);
      return;
    }

    setShowSpinner(true);
    const t1 = setTimeout(() => setShowSpinner(false), spinnerDuration);
    const t2 = setTimeout(() => playReveal(), spinnerDuration + 120);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      abortedRef.current = true;
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, spinnerDuration, playReveal]);

  if (!isPlaying) return null;

  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          opacity: showSpinner ? 1 : 0,
          transition: 'opacity 0.15s',
        }}
      >
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: '50%',
            border: '4.5px solid #e5e7eb',
            borderTopColor: color,
            animation: showSpinner ? 'cr-spin 0.75s linear infinite' : 'none',
          }}
        />
        <style>{`@keyframes cr-spin { to { transform: rotate(360deg); } }`}</style>
      </div>

      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: 'none',
          zIndex: 9999,
        }}
      />
    </>
  );
}
