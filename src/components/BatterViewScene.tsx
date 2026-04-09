import { useState, useEffect, useRef, useCallback } from 'react';
import type { PitchTrajectory, Zone, PitchOutcome } from '../data/types';

export type SwingEffect = {
  outcome: PitchOutcome;
  zone: Zone;
  actualZone: Zone;
};

interface BatterViewSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  onSwing?: (zone: Zone) => void;
  effect?: SwingEffect | null;
}

/**
 * Zone → screen position mapping.
 * Strike zone grid: left=39%, right=61%, top=33%, bottom=57%
 * Ball zones: clearly outside these bounds.
 *
 * This ensures zones 1-9 ALWAYS land inside the visual grid,
 * and zones 11-14 ALWAYS land outside.
 */
const ZONE_SCREEN_POS: Record<number, { x: number; y: number }> = {
  // Strike zone 3x3 (inside grid bounds)
  1: { x: 42.7, y: 36 },  2: { x: 50, y: 36 },  3: { x: 57.3, y: 36 },
  4: { x: 42.7, y: 45 },  5: { x: 50, y: 45 },  6: { x: 57.3, y: 45 },
  7: { x: 42.7, y: 54 },  8: { x: 50, y: 54 },  9: { x: 57.3, y: 54 },
  // Ball zones (clearly outside grid)
  11: { x: 50, y: 26 },   // high ball
  12: { x: 50, y: 63 },   // low ball
  13: { x: 34, y: 45 },   // inside (left)
  14: { x: 66, y: 45 },   // outside (right)
};

// Grid bounds (for reference)
const GRID = { left: 39, right: 61, top: 33, bottom: 57, cx: 50, cy: 45 };

export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete, onSwing, effect }: BatterViewSceneProps) {
  const [ballPos, setBallPos] = useState({ x: 50, y: 20, scale: 0.3 });
  const [ballVisible, setBallVisible] = useState(false);
  const animRef = useRef<number>(0);
  const startTime = useRef(0);
  const completedRef = useRef(false);

  // Get target based on zone number (guaranteed alignment)
  const getTargetPos = useCallback(() => {
    // Find the zone from the pitch data
    // Map pX/pZ to nearest zone, then use the fixed screen position
    const pX = pitch.pX;
    const pZ = pitch.pZ;

    // Determine zone from coordinates
    let col = pX < -0.25 ? 0 : pX > 0.25 ? 2 : 1; // 0=left, 1=center, 2=right
    let row = pZ > 2.9 ? 0 : pZ < 2.1 ? 2 : 1;     // 0=top, 1=mid, 2=bottom
    const strikeZone = row * 3 + col + 1; // 1-9

    // Check if it's actually a ball (outside strike zone)
    const isInZone = pX >= -0.85 && pX <= 0.85 && pZ >= 1.5 && pZ <= 3.5;

    if (isInZone) {
      return ZONE_SCREEN_POS[strikeZone] ?? { x: 50, y: 45 };
    }

    // Ball zone
    if (pZ > 3.5) return ZONE_SCREEN_POS[11]; // high
    if (pZ < 1.5) return ZONE_SCREEN_POS[12]; // low
    if (pX < -0.85) return ZONE_SCREEN_POS[13]; // inside
    return ZONE_SCREEN_POS[14]; // outside
  }, [pitch.pX, pitch.pZ]);

  useEffect(() => {
    if (!isAnimating) {
      setBallVisible(false);
      completedRef.current = false;
      return;
    }

    setBallVisible(true);
    startTime.current = performance.now();
    completedRef.current = false;
    const duration = pitch.plateTime * (1 / 0.8) * 1000;
    const target = getTargetPos();

    const animate = () => {
      const elapsed = performance.now() - startTime.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * progress;

      // Start from top-center (mound), fly to target
      const x = GRID.cx + (target.x - GRID.cx) * eased;
      const y = 15 + (target.y - 15) * eased;
      const scale = 0.15 + eased * 1.3;
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

  const isHit = effect && ['single', 'double', 'triple', 'homerun'].includes(effect.outcome);
  const isHR = effect?.outcome === 'homerun';
  const isWhiff = effect?.outcome === 'swinging_strike';
  const isFoul = effect?.outcome === 'foul';
  const isOut = effect && ['groundout', 'flyout', 'lineout'].includes(effect.outcome);

  const target = getTargetPos();

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      {/* Stadium background */}
      <img
        src="/images/stadium.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/20" />

      {isHR && <div className="absolute inset-0 animate-pulse bg-red-500/10 z-30" />}

      {/* Animated ball */}
      {ballVisible && !effect && (
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

      {/* === IMPACT EFFECTS === */}
      {effect && (
        <>
          {isHR && (
            <>
              <div className="absolute pointer-events-none z-30 animate-ping"
                style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full"
                  style={{ background: 'radial-gradient(circle, #fbbf24, #f97316, transparent)' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <span className="text-6xl sm:text-8xl animate-bounce">💥</span>
              </div>
            </>
          )}
          {isHit && !isHR && (
            <>
              <div className="absolute pointer-events-none z-30"
                style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full animate-ping"
                  style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <span className="text-5xl sm:text-6xl animate-bounce">⚡</span>
              </div>
            </>
          )}
          {isWhiff && (
            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
              <div className="relative">
                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full rotate-[-20deg] animate-pulse" />
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">💨</span>
              </div>
            </div>
          )}
          {isFoul && (
            <div className="absolute pointer-events-none z-30"
              style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-ping"
                style={{ background: 'radial-gradient(circle, rgba(255,200,50,0.6), transparent)' }} />
            </div>
          )}
          {isOut && (
            <div className="absolute pointer-events-none z-30"
              style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}>
              <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full animate-ping opacity-50"
                style={{ background: 'radial-gradient(circle, rgba(200,200,200,0.5), transparent)' }} />
            </div>
          )}
        </>
      )}

      {/* Strike zone — 3x3 clickable grid (hidden during effect) */}
      {!effect && (
        <div
          className="absolute"
          style={{
            left: `${GRID.left}%`,
            top: `${GRID.top}%`,
            width: `${GRID.right - GRID.left}%`,
            height: `${GRID.bottom - GRID.top}%`,
            zIndex: 10,
          }}
        >
          <div className="absolute inset-0 border-2 border-amber-400/60 rounded-sm shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
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
      )}
    </div>
  );
}
