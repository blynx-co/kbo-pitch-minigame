import { Canvas } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { PitchTrajectory, Zone } from '../data/types';
import BatterBox from './BatterBox';
import PitchBall from './PitchBall';

interface BatterViewSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
  onSwing?: (zone: Zone) => void;
}

/**
 * Catcher's view — behind home plate, ball comes TOWARD camera.
 * Zone grid rendered in 3D space exactly at the strike zone.
 */
export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete, onSwing }: BatterViewSceneProps) {
  const szTop = pitch.szTop;
  const szBot = pitch.szBot;
  const szHeight = szTop - szBot;
  const szCenterY = (szTop + szBot) / 2;
  const szWidth = 17 / 12; // 17 inches in feet

  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas
        camera={{
          // Catcher's eye: behind home plate, slightly above
          position: [0, 4.2, 5],
          fov: 32,
          near: 0.1,
          far: 500,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 2.5, -55);
        }}
      >
        <BatterBox
          szTop={szTop}
          szBot={szBot}
          batSide={pitch.batSide}
        />
        <PitchBall
          pitch={pitch}
          isAnimating={isAnimating}
          onAnimationComplete={onAnimationComplete}
          animationSpeed={0.5}
          ballScale={2}
          glowIntensity={0.5}
        />

        {/* Clickable zone grid — rendered in 3D at the exact strike zone position */}
        {onSwing && (
          <Html
            position={[0, szCenterY, 0.01]}
            center
            transform
            style={{
              width: '1px',
              height: '1px',
            }}
          >
            <div
              style={{
                width: `${szWidth * 68}px`,
                height: `${szHeight * 68}px`,
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'auto',
              }}
            >
              {([1, 2, 3, 4, 5, 6, 7, 8, 9] as Zone[]).map(z => (
                <button
                  key={z}
                  onClick={(e) => { e.stopPropagation(); onSwing(z); }}
                  style={{
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    cursor: 'crosshair',
                    transition: 'background 0.1s',
                  }}
                  onPointerEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(251,191,36,0.25)'; }}
                  onPointerLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
                  onPointerDown={(e) => { (e.target as HTMLElement).style.background = 'rgba(251,191,36,0.5)'; }}
                />
              ))}
            </div>
          </Html>
        )}
      </Canvas>
    </div>
  );
}
