import { useMemo } from 'react';
import * as THREE from 'three';

interface BatterBoxProps {
  szTop: number;
  szBot: number;
  batSide: 'L' | 'R';
}

/** Home plate pentagon shape (official dimensions in feet) */
function HomePlate() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // 17 inches = 1.417 ft wide, pentagon shape
    const hw = 0.708; // half-width
    s.moveTo(-hw, 0);
    s.lineTo(hw, 0);
    s.lineTo(hw, -0.5);
    s.lineTo(0, -0.85);
    s.lineTo(-hw, -0.5);
    s.closePath();
    return s;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#ffffff" roughness={0.6} />
    </mesh>
  );
}

/** Pitcher's mound - simple raised circle */
function PitcherMound() {
  return (
    <group position={[0, 0, -60.5]}>
      {/* Mound dirt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]}>
        <circleGeometry args={[5, 32]} />
        <meshStandardMaterial color="#D4A574" roughness={0.9} />
      </mesh>
      {/* Rubber */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.35, 0]}>
        <planeGeometry args={[0.5, 0.17]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
    </group>
  );
}

/** Strike zone — bright outline + 3x3 grid lines */
function StrikeZone({ szTop, szBot }: { szTop: number; szBot: number }) {
  const height = szTop - szBot;
  const centerY = (szTop + szBot) / 2;
  const width = 17 / 12; // 17 inches in feet
  const hw = width / 2;
  const hh = height / 2;

  const gridGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    // Outer rectangle
    pts.push(new THREE.Vector3(-hw, -hh, 0), new THREE.Vector3(hw, -hh, 0));
    pts.push(new THREE.Vector3(hw, -hh, 0), new THREE.Vector3(hw, hh, 0));
    pts.push(new THREE.Vector3(hw, hh, 0), new THREE.Vector3(-hw, hh, 0));
    pts.push(new THREE.Vector3(-hw, hh, 0), new THREE.Vector3(-hw, -hh, 0));
    // Vertical grid lines (1/3, 2/3)
    for (let i = 1; i <= 2; i++) {
      const x = -hw + (width * i) / 3;
      pts.push(new THREE.Vector3(x, -hh, 0), new THREE.Vector3(x, hh, 0));
    }
    // Horizontal grid lines (1/3, 2/3)
    for (let i = 1; i <= 2; i++) {
      const y = -hh + (height * i) / 3;
      pts.push(new THREE.Vector3(-hw, y, 0), new THREE.Vector3(hw, y, 0));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    return geo;
  }, [hw, hh, width, height]);

  return (
    <lineSegments position={[0, centerY, 0]} geometry={gridGeo}>
      <lineBasicMaterial color="#fbbf24" transparent opacity={0.7} />
    </lineSegments>
  );
}

/** Catcher area - semicircle dirt behind home plate */
function CatcherArea() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const radius = 6;
    s.absarc(0, 0, radius, 0, Math.PI, false);
    s.lineTo(-radius, 0);
    return s;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 1]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#D4A574" roughness={0.95} />
    </mesh>
  );
}

/** Infield dirt diamond shape */
function InfieldDirt() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const size = 95; // slightly larger than 90ft diamond
    // Diamond oriented: home at bottom, 2B at top
    s.moveTo(0, 0);             // home plate area
    s.lineTo(size * 0.7, -size * 0.7);  // 1B side
    s.lineTo(0, -size * 1.4);   // 2B area
    s.lineTo(-size * 0.7, -size * 0.7); // 3B side
    s.closePath();
    return s;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#D4A574" roughness={1} />
    </mesh>
  );
}

/** Outfield grass extending behind the infield */
function OutfieldGrass() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, -90]}>
      <planeGeometry args={[300, 200]} />
      <meshStandardMaterial color="#3da63d" roughness={0.85} />
    </mesh>
  );
}

/** Infield grass - arc inside the diamond (between bases, excluding mound path) */
function InfieldGrass() {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // Roughly the grass area inside the basepaths (arc shape)
    const r = 60; // radius of infield grass arc
    s.absarc(0, 0, r, -0.15, -Math.PI + 0.15, true);
    s.closePath();
    return s;
  }, []);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, -15]}>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial color="#5CBF60" roughness={0.85} />
    </mesh>
  );
}

export default function BatterBox({ szTop, szBot, batSide: _batSide }: BatterBoxProps) {
  void _batSide; // kept in interface for compatibility
  return (
    <group>
      {/* Outfield grass (lowest layer) */}
      <OutfieldGrass />

      {/* Infield dirt diamond */}
      <InfieldDirt />

      {/* Infield grass inside the diamond */}
      <InfieldGrass />

      {/* Catcher area behind plate */}
      <CatcherArea />

      {/* Home plate */}
      <HomePlate />

      {/* Pitcher's mound */}
      <PitcherMound />

      {/* Strike zone */}
      <StrikeZone szTop={szTop} szBot={szBot} />

      {/* Ambient light - night game feel */}
      <ambientLight intensity={0.7} color="#b0c4de" />

      {/* Main stadium lights */}
      <spotLight
        position={[0, 80, -30]}
        angle={0.5}
        penumbra={0.5}
        intensity={5}
        color="#fffaf0"
        castShadow={false}
      />
      <spotLight
        position={[-40, 60, 0]}
        angle={0.6}
        penumbra={0.8}
        intensity={2.5}
        color="#fffaf0"
      />
      <spotLight
        position={[40, 60, 0]}
        angle={0.6}
        penumbra={0.8}
        intensity={2.5}
        color="#fffaf0"
      />

      {/* Sky dome - night sky blue */}
      <mesh>
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial color="#1e2d52" side={THREE.BackSide} />
      </mesh>
    </group>
  );
}
