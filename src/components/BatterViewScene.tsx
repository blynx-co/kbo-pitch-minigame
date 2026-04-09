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
 * Batter's eye view — camera behind the batter looking toward the mound.
 * The ball comes flying TOWARD the camera.
 */
export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete }: BatterViewSceneProps) {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas
        camera={{
          // Batter's eye: slightly behind and above home plate
          // Left-handed batter stands on right side (catcher POV), so offset left from batter's POV
          position: [1.5, 4.0, -2],
          fov: 45,
          near: 0.1,
          far: 500,
        }}
        onCreated={({ camera }) => {
          // Look toward the pitcher's mound
          camera.lookAt(0, 3, 55);
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
        />
      </Canvas>
    </div>
  );
}
