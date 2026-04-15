/**
 * Kim Seo-hyun AI — bad control pitcher with heavy arm-side run on FF.
 * 40% strikes, 60% balls. FF curves towards RHB body.
 */
import type { Zone, PitchTrajectory } from '../data/types';

const STRIKE_ZONES: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function weightedRandom<T extends string>(weights: Record<T, number>): T {
  const entries = Object.entries(weights) as [T, number][];
  const total = entries.reduce((s, [, w]) => s + (w as number), 0);
  let r = Math.random() * total;
  for (const [key, weight] of entries) {
    r -= weight as number;
    if (r <= 0) return key;
  }
  return entries[entries.length - 1][0];
}

// Pitch selection weights by count
const KIM_PITCH_WEIGHTS: Record<string, Record<string, number>> = {
  '0-0': { FF: 0.55, SL: 0.25, CH: 0.20 },
  '0-1': { FF: 0.45, SL: 0.30, CH: 0.25 },
  '0-2': { FF: 0.35, SL: 0.35, CH: 0.30 },
  '1-0': { FF: 0.60, SL: 0.20, CH: 0.20 },
  '1-1': { FF: 0.50, SL: 0.25, CH: 0.25 },
  '1-2': { FF: 0.40, SL: 0.35, CH: 0.25 },
  '2-0': { FF: 0.65, SL: 0.15, CH: 0.20 },
  '2-1': { FF: 0.55, SL: 0.25, CH: 0.20 },
  '2-2': { FF: 0.50, SL: 0.30, CH: 0.20 },
  '3-0': { FF: 0.75, SL: 0.10, CH: 0.15 },
  '3-1': { FF: 0.65, SL: 0.15, CH: 0.20 },
  '3-2': { FF: 0.55, SL: 0.25, CH: 0.20 },
};

export interface KimPitch {
  pitchCode: string;
  zone: Zone;
  isAtBatter: boolean;
}

export function kimSelectPitch(balls: number, strikes: number): KimPitch {
  const countKey = `${balls}-${strikes}`;
  const pitchWeights = KIM_PITCH_WEIGHTS[countKey] ?? KIM_PITCH_WEIGHTS['1-1'];
  const pitchCode = weightedRandom(pitchWeights);

  // 40% strike zone, 60% ball
  const isStrike = Math.random() < 0.40;

  if (isStrike) {
    const zone = STRIKE_ZONES[Math.floor(Math.random() * STRIKE_ZONES.length)];
    return { pitchCode, zone, isAtBatter: false };
  }

  // Ball zone distribution (matches pitch map: lots of high, inside, low scatter)
  const ballRoll = Math.random();
  if (ballRoll < 0.25) {
    // High ball — very common for Kim
    return { pitchCode, zone: 11 as Zone, isAtBatter: false };
  }
  if (ballRoll < 0.55) {
    // Inside — FF has high chance of going at batter's body
    const atBatterChance = pitchCode === 'FF' ? 0.35 : 0.05;
    const isAtBatter = Math.random() < atBatterChance;
    return { pitchCode, zone: 13 as Zone, isAtBatter };
  }
  if (ballRoll < 0.78) {
    // Low ball
    return { pitchCode, zone: 12 as Zone, isAtBatter: false };
  }
  // Outside
  return { pitchCode, zone: 14 as Zone, isAtBatter: false };
}

/**
 * Custom trajectory for Kim's pitches.
 * FF has heavy arm-side run towards RHB body.
 * More scatter than Yamamoto (bad control).
 */
export function generateKimPitchTrajectory(
  pitchCode: string,
  zone: Zone,
  avgSpeed: number,
  isAtBatter: boolean,
): PitchTrajectory {
  const zoneTargets: Record<number, { pX: number; pZ: number }> = {
    1:  { pX: -0.5,  pZ: 3.2 },
    2:  { pX: 0.0,   pZ: 3.2 },
    3:  { pX: 0.5,   pZ: 3.2 },
    4:  { pX: -0.5,  pZ: 2.5 },
    5:  { pX: 0.0,   pZ: 2.5 },
    6:  { pX: 0.5,   pZ: 2.5 },
    7:  { pX: -0.5,  pZ: 1.8 },
    8:  { pX: 0.0,   pZ: 1.8 },
    9:  { pX: 0.5,   pZ: 1.8 },
    11: { pX: 0.0,   pZ: 4.0 },   // high — more extreme
    12: { pX: 0.0,   pZ: 0.8 },   // low — more extreme
    13: { pX: -1.0,  pZ: 2.5 },   // inside
    14: { pX: 1.0,   pZ: 2.5 },   // outside
  };

  const target = zoneTargets[zone] ?? { pX: 0, pZ: 2.5 };

  // Kim has worse control → more scatter
  let pX: number, pZ: number;

  if (isAtBatter) {
    // Ball aimed at batter's body — very far inside
    pX = -(1.5 + Math.random() * 0.8); // -1.5 to -2.3
    pZ = 2.0 + Math.random() * 1.0;     // mid-body height
  } else {
    pX = target.pX + (Math.random() - 0.5) * 0.5; // more scatter than Yamamoto (±0.25 vs ±0.15)
    pZ = target.pZ + (Math.random() - 0.5) * 0.5;
  }

  const speedFtS = avgSpeed * 1.467;
  const x0 = -2.0; // Right-handed pitcher
  const y0 = 55.0;
  const z0 = 5.8;
  const plateTime = y0 / speedFtS;
  const gravity = -32.17;

  // Kim-specific movement profiles
  // FF: Heavy arm-side run towards RHB body (big negative aX)
  // SL: Sweeping away from RHB
  // CH: Arm-side fade + drop
  const movements: Record<string, { aX: number; aY: number; aZ: number }> = {
    FF: { aX: -20, aY: -28, aZ: gravity + 14 },
    SL: { aX: 10,  aY: -26, aZ: gravity - 4 },
    CH: { aX: -14, aY: -26, aZ: gravity + 2 },
  };

  const mov = movements[pitchCode] || movements.FF;
  const vX0 = (pX - x0 - 0.5 * mov.aX * plateTime * plateTime) / plateTime;
  const vY0 = (-y0 - 0.5 * mov.aY * plateTime * plateTime) / plateTime;
  const vZ0 = (pZ - z0 - 0.5 * mov.aZ * plateTime * plateTime) / plateTime;

  return {
    vX0, vY0, vZ0,
    aX: mov.aX, aY: mov.aY, aZ: mov.aZ,
    x0, y0, z0,
    pX, pZ,
    plateTime,
    pitchCode,
    szTop: 3.4,
    szBot: 1.6,
    batSide: 'R',
  };
}
