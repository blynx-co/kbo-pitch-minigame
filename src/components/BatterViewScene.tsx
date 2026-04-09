import { Canvas } from '@react-three/fiber';
import type { PitchTrajectory } from '../data/types';
import BatterBox from './BatterBox';
import PitchBall from './PitchBall';

interface BatterViewSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

/**
 * Batter's eye view — camera behind home plate looking toward the mound.
 * Ball travels from z=-55 (mound) to z=0 (plate).
 * Camera placed slightly behind plate looking toward negative z (mound).
 */
export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete }: BatterViewSceneProps) {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas
        camera={{
          // Behind home plate, left-handed batter's eye
          position: [1.2, 3.8, 3],
          fov: 40,
          near: 0.1,
          far: 500,
        }}
        onCreated={({ camera }) => {
          // Look toward the mound (z = -55)
          camera.lookAt(0, 2.5, -55);
        }}
      >
        <BatterBox
          szTop={pitch.szTop}
          szBot={pitch.szBot}
          batSide={pitch.batSide}
        />
        <PitchBall
          pitch={pitch}
          isAnimating={isAnimating}
          onAnimationComplete={onAnimationComplete}
          animationSpeed={0.4}
        />
      </Canvas>
    </div>
  );
}
