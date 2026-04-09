/**
 * Yamamoto AI — selects pitch type + zone based on count and tendencies.
 */
import type { Zone } from '../data/types';
import { YAMAMOTO_PITCH_WEIGHTS, YAMAMOTO_ZONE_WEIGHTS } from '../data/yamamotoProfile';

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

export function yamamotoSelectPitch(
  balls: number,
  strikes: number,
): { pitchCode: string; zone: Zone } {
  const countKey = `${balls}-${strikes}`;
  const pitchWeights = YAMAMOTO_PITCH_WEIGHTS[countKey] ?? YAMAMOTO_PITCH_WEIGHTS['1-1'];

  // Select pitch type
  const pitchCode = weightedRandom(pitchWeights);

  // Select zone based on pitch type distribution
  const zoneWeights = YAMAMOTO_ZONE_WEIGHTS[pitchCode] ?? { 5: 100 };
  const zoneStr = weightedRandom(zoneWeights as Record<string, number>);
  const zone = parseInt(zoneStr) as Zone;

  return { pitchCode, zone };
}
