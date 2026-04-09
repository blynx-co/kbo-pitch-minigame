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
 * Catcher/umpire view for batting mode.
 * Same camera as PitchScene but with bigger ball + glow for visibility.
 */
export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete }: BatterViewSceneProps) {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas
        camera={{
          position: [0, 12, -65],
          fov: 30,
          near: 0.1,
          far: 500,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 3, 0);
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
          animationSpeed={0.5}
          ballScale={2}
          glowIntensity={0.5}
        />
      </Canvas>
    </div>
  );
}
