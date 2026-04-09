/**
 * Batting outcome engine — determines result when Noh Si-hwan swings or takes.
 *
 * Key factors:
 * - Timing quality (how well the player timed the swing)
 * - Zone accuracy (clicked zone vs actual pitch zone, with skill-gap error)
 * - Noh Si-hwan's stats vs Yamamoto's pitch type
 */
import type { Zone, PitchOutcome } from '../data/types';
import { NOH_SIHWAN } from '../data/nohSihwanProfile';

const STRIKE_ZONES: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function isStrikeZone(zone: Zone): boolean {
  return STRIKE_ZONES.includes(zone);
}

// Zone adjacency for determining contact quality
const ZONE_ADJACENCY: Record<Zone, Zone[]> = {
  1: [2, 4, 5],    2: [1, 3, 4, 5, 6],   3: [2, 5, 6],
  4: [1, 2, 5, 7, 8], 5: [1, 2, 3, 4, 6, 7, 8, 9], 6: [2, 3, 5, 8, 9],
  7: [4, 5, 8],    8: [4, 5, 6, 7, 9],   9: [5, 6, 8],
  11: [1, 2, 3],   12: [7, 8, 9],  13: [1, 4, 7],  14: [3, 6, 9],
};

export type TimingQuality = 'perfect' | 'good' | 'early' | 'late' | 'way_off';

export interface BattingResult {
  outcome: PitchOutcome;
  description: string;  // Korean description for display
  timingQuality: TimingQuality;
  swingZoneAfterError: Zone | null;  // where bat actually went (after skill error)
}

/**
 * Apply random swing error reflecting MLB ace vs KBO .250 hitter skill gap.
 * ~35% chance the swing drifts to adjacent zone, ~10% to random zone.
 */
export function applySwingError(targetZone: Zone): Zone {
  const roll = Math.random();

  // 55% → on target
  if (roll < 0.55) return targetZone;

  // 35% → drift to adjacent zone
  if (roll < 0.90) {
    const adj = ZONE_ADJACENCY[targetZone];
    if (adj && adj.length > 0) {
      return adj[Math.floor(Math.random() * adj.length)];
    }
    return targetZone;
  }

  // 10% → wild swing (random zone)
  const allZones: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14];
  return allZones[Math.floor(Math.random() * allZones.length)];
}

/**
 * Calculate timing quality from the player's click timing.
 * @param clickRatio - when the player clicked relative to ball flight (0 = pitch start, 1 = ball arrival)
 */
export function getTimingQuality(clickRatio: number): TimingQuality {
  // Sweet spot: 0.65 - 0.85 of flight time
  if (clickRatio >= 0.65 && clickRatio <= 0.85) return 'perfect';
  if (clickRatio >= 0.50 && clickRatio <= 0.92) return 'good';
  if (clickRatio < 0.50) return 'early';
  if (clickRatio > 0.92) return 'late';
  return 'way_off';
}

/**
 * Main batting outcome determination.
 */
export function determineBattingOutcome(
  action: 'swing' | 'take',
  playerSwingZone: Zone | null,  // null if take
  actualPitchZone: Zone,
  pitchCode: string,
  timing: TimingQuality,
): BattingResult {
  const batter = NOH_SIHWAN;

  // === TAKE (보내기) ===
  if (action === 'take' || !playerSwingZone) {
    if (isStrikeZone(actualPitchZone)) {
      return { outcome: 'called_strike', description: '스트라이크! 쳐야 했다...', timingQuality: timing, swingZoneAfterError: null };
    } else {
      return { outcome: 'ball', description: '볼! 좋은 눈!', timingQuality: timing, swingZoneAfterError: null };
    }
  }

  // === SWING (스윙) ===
  // Apply skill-gap error to swing zone
  const actualSwingZone = applySwingError(playerSwingZone);

  // Zone match quality
  const perfectMatch = actualSwingZone === actualPitchZone;
  const adjacent = ZONE_ADJACENCY[actualPitchZone]?.includes(actualSwingZone) ?? false;

  // Timing multiplier
  let timingMult: number;
  switch (timing) {
    case 'perfect': timingMult = 1.0; break;
    case 'good':    timingMult = 0.6; break;
    case 'early':   timingMult = 0.2; break;
    case 'late':    timingMult = 0.15; break;
    default:        timingMult = 0.05;
  }

  // Base stats
  const zoneStats = batter.zones[actualPitchZone];
  const pitchStats = batter.pitchTypeStats[pitchCode] ?? { ba: 0.200, whiffRate: 0.35 };

  // Contact quality multiplier based on zone match
  let contactQuality: number;
  if (perfectMatch) {
    contactQuality = 1.0;
  } else if (adjacent) {
    contactQuality = 0.4;
  } else {
    contactQuality = 0.05;  // way off → almost certain miss
  }

  // Combined contact chance
  const combinedQuality = contactQuality * timingMult;

  // Step 1: Whiff check
  const baseWhiff = (zoneStats.whiffRate * 0.4 + pitchStats.whiffRate * 0.6);
  const whiffProb = Math.min(0.95, baseWhiff + (1 - combinedQuality) * 0.5);

  if (Math.random() < whiffProb) {
    const desc = timing === 'perfect' && perfectMatch
      ? '아슬하게 빗나갔다!'
      : timing === 'early' ? '너무 빨랐다! 헛스윙!'
      : timing === 'late' ? '타이밍 늦었다! 헛스윙!'
      : '헛스윙!';
    return { outcome: 'swinging_strike', description: desc, timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Step 2: Foul check
  const foulProb = perfectMatch ? 0.25 : adjacent ? 0.45 : 0.60;
  if (Math.random() < foulProb * (1.1 - timingMult)) {
    return { outcome: 'foul', description: '파울!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Step 3: Ball in play — determine outcome
  const ba = pitchStats.ba * combinedQuality;
  const hrRate = zoneStats.hrRate * combinedQuality * timingMult;

  // Homerun check (boosted for perfect timing + perfect zone)
  const hrBonus = (timing === 'perfect' && perfectMatch) ? 2.5 : 1.0;
  if (Math.random() < hrRate * hrBonus) {
    return { outcome: 'homerun', description: '홈런!!! 달을 쐈다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Hit vs out
  const hitProb = (zoneStats.wOBA * 0.5 + ba * 0.5) * combinedQuality;
  if (Math.random() < hitProb) {
    const r = Math.random();
    if (r < 0.05) return { outcome: 'triple', description: '3루타! 장타력 폭발!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (r < 0.30) return { outcome: 'double', description: '2루타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'single', description: '안타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Out
  const outRoll = Math.random();
  const desc = outRoll < 0.45 ? '땅볼 아웃...' : outRoll < 0.80 ? '뜬공 아웃...' : '라인아웃...';
  const outType = outRoll < 0.45 ? 'groundout' : outRoll < 0.80 ? 'flyout' : 'lineout';
  return { outcome: outType as PitchOutcome, description: desc, timingQuality: timing, swingZoneAfterError: actualSwingZone };
}
