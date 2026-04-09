import { useState, useEffect, useRef, useCallback } from 'react';
import type { PitchTrajectory, Zone, PitchOutcome } from '../data/types';

export type SwingEffect = {
  outcome: PitchOutcome;
  zone: Zone;          // where player clicked
  actualZone: Zone;    // where ball actually was
};

interface BatterViewSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  onSwing?: (zone: Zone) => void;
  effect?: SwingEffect | null;  // show impact effect
}

export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete, onSwing, effect }: BatterViewSceneProps) {
  const [ballPos, setBallPos] = useState({ x: 50, y: 25, scale: 0.3 });
  const [ballVisible, setBallVisible] = useState(false);
  const animRef = useRef<number>(0);
  const startTime = useRef(0);
  const completedRef = useRef(false);

  const getTargetPos = useCallback(() => {
    const x = 50 + (pitch.pX / 1.5) * 10;
    const y = 45 - ((pitch.pZ - 2.5) / 1.5) * 10;
    return { x, y };
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

      const x = 50 + (target.x - 50) * eased;
      const y = 18 + (target.y - 18) * eased;
      const scale = 0.2 + eased * 1.2;
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

  // Effect visuals
  const isHit = effect && ['single', 'double', 'triple', 'homerun'].includes(effect.outcome);
  const isHR = effect?.outcome === 'homerun';
  const isWhiff = effect?.outcome === 'swinging_strike';
  const isFoul = effect?.outcome === 'foul';
  const isOut = effect && ['groundout', 'flyout', 'lineout'].includes(effect.outcome);

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

      {/* Screen shake on homerun */}
      {isHR && <div className="absolute inset-0 animate-pulse bg-red-500/10 z-30" />}

      {/* Animated ball (hidden during effect) */}
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
      {effect && (() => {
        const target = getTargetPos();
        return (
          <>
            {/* Homerun — explosion burst */}
            {isHR && (
              <div
                className="absolute pointer-events-none z-30 animate-ping"
                style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-gradient-radial from-yellow-300 via-orange-500 to-transparent opacity-80"
                  style={{ background: 'radial-gradient(circle, #fbbf24, #f97316, transparent)' }} />
              </div>
            )}
            {isHR && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <span className="text-6xl sm:text-8xl animate-bounce">💥</span>
              </div>
            )}

            {/* Hit (single/double/triple) — bat crack flash */}
            {isHit && !isHR && (
              <>
                <div
                  className="absolute pointer-events-none z-30"
                  style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full animate-ping"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.8), transparent)' }} />
                </div>
                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                  <span className="text-5xl sm:text-6xl animate-bounce">⚡</span>
                </div>
              </>
            )}

            {/* Whiff — swing line + miss */}
            {isWhiff && (
              <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                <div className="relative">
                  {/* Swing arc */}
                  <div className="w-32 h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full rotate-[-20deg] animate-pulse" />
                  <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-4xl">💨</span>
                </div>
              </div>
            )}

            {/* Foul — glancing spark */}
            {isFoul && (
              <div
                className="absolute pointer-events-none z-30"
                style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full animate-ping"
                  style={{ background: 'radial-gradient(circle, rgba(255,200,50,0.6), transparent)' }} />
              </div>
            )}

            {/* Out — dull thud */}
            {isOut && (
              <div
                className="absolute pointer-events-none z-30"
                style={{ left: `${target.x}%`, top: `${target.y}%`, transform: 'translate(-50%, -50%)' }}
              >
                <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-full animate-ping opacity-50"
                  style={{ background: 'radial-gradient(circle, rgba(200,200,200,0.5), transparent)' }} />
              </div>
            )}
          </>
        );
      })()}

      {/* Strike zone — 3x3 clickable grid (hidden during effect) */}
      {!effect && (
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
