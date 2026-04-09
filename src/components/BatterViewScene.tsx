import { Canvas } from '@react-three/fiber';
import type { PitchTrajectory } from '../data/types';
import BatterBox from './BatterBox';
import PitchBall from './PitchBall';

interface BatterViewSceneProps {
  pitch: PitchTrajectory;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

export default function BatterViewScene({ pitch, isAnimating, onAnimationComplete }: BatterViewSceneProps) {
  return (
    <div className="w-full h-full bg-slate-950">
      <Canvas
        camera={{
          position: [1.0, 3.5, 4],
          fov: 35,
          near: 0.1,
          far: 500,
        }}
        onCreated={({ camera }) => {
          camera.lookAt(0, 2.5, -55);
        }}
      >
        <ambientLight intensity={1.0} />
        <pointLight position={[0, 10, -30]} intensity={150} color="#ffffff" />
        <pointLight position={[0, 5, 0]} intensity={80} color="#ffffff" />

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
          ballScale={5}
          glowIntensity={0.8}
        />
      </Canvas>
    </div>
  );
}
