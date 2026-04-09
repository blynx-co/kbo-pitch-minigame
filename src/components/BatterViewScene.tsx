import { useState, useEffect, useRef, useCallback } from 'react';
import type { PitchTrajectory, Zone } from '../data/types';

interface BatterViewSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  onSwing?: (zone: Zone) => void;
}

/**
 * Stadium photo background + CSS animated ball + clickable strike zone grid.
 * Replaces 3D scene for a cleaner, more intuitive batting experience.
 */
export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete, onSwing }: BatterViewSceneProps) {
  const [ballPos, setBallPos] = useState({ x: 50, y: 25, scale: 0.3 }); // % based
  const [ballVisible, setBallVisible] = useState(false);
  const animRef = useRef<number>(0);
  const startTime = useRef(0);
  const completedRef = useRef(false);

  // Ball target position in % (based on pitch zone → screen position)
  const getTargetPos = useCallback(() => {
    // Map pX (-1 to 1 ft) → screen x% (40-60%)
    // Map pZ (1.6 to 3.4 ft) → screen y% (52-38%) — inverted (higher = lower on screen)
    const x = 50 + (pitch.pX / 1.5) * 10; // center ± 10%
    const y = 45 - ((pitch.pZ - 2.5) / 1.5) * 10; // center ± 10%
    return { x, y };
  }, [pitch.pX, pitch.pZ]);

  // Animate ball from mound to plate
  useEffect(() => {
    if (!isAnimating) {
      setBallVisible(false);
      completedRef.current = false;
      return;
    }

    setBallVisible(true);
    startTime.current = performance.now();
    completedRef.current = false;
    const duration = pitch.plateTime * (1 / 0.8) * 1000; // faster ball

    const target = getTargetPos();

    const animate = () => {
      const elapsed = performance.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-in for "ball getting closer" feel
      const eased = progress * progress;

      // Ball starts at center-top (mound), moves to target zone
      const x = 50 + (target.x - 50) * eased;
      const y = 18 + (target.y - 18) * eased;
      const scale = 0.2 + eased * 1.2; // grows as it approaches

      setBallPos({ x, y, scale });

      if (progress >= 1) {
        if (!completedRef.current) {
          completedRef.current = true;
          onAnimationComplete();
        }
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [isAnimating, pitch.plateTime, getTargetPos, onAnimationComplete]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Stadium background */}
      <img
        src="/images/stadium.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Dark overlay for contrast */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Animated ball */}
      {ballVisible && (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${ballPos.x}%`,
            top: `${ballPos.y}%`,
            width: `${ballPos.scale * 2}rem`,
            height: `${ballPos.scale * 2}rem`,
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle at 35% 35%, #ffffff, #cccccc, #999999)',
            boxShadow: `0 0 ${ballPos.scale * 10}px rgba(255,255,255,0.8), 0 0 ${ballPos.scale * 20}px rgba(255,200,50,0.4)`,
            zIndex: 20,
          }}
        />
      )}

      {/* Strike zone — 3x3 clickable grid */}
      <div
        className="absolute"
        style={{
          left: '50%',
          top: '45%',
          transform: 'translate(-50%, -50%)',
          width: '22%',
          maxWidth: '200px',
          minWidth: '120px',
          aspectRatio: '3 / 4',
          zIndex: 10,
        }}
      >
        {/* Zone border glow */}
        <div className="absolute inset-0 border-2 border-amber-400/60 rounded-sm shadow-[0_0_15px_rgba(251,191,36,0.3)]" />

        {/* 3x3 grid */}
        <div className="grid grid-cols-3 grid-rows-3 w-full h-full">
          {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Zone[]).map(z => (
            <button
              key={z}
              onClick={() => onSwing?.(z)}
              className="border border-amber-400/30 bg-transparent hover:bg-amber-400/30 hover:border-amber-400/80 active:bg-red-500/50 active:scale-95 transition-all duration-75 cursor-crosshair relative z-20"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
