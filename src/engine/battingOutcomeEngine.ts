/**
 * Batting outcome engine — timing + zone accuracy → realistic outcomes.
 *
 * Rules:
 * - TAKE: ball in zone 1-9 = called strike, zone 11-14 = ball
 * - SWING timing:
 *   PERFECT (0.65-0.85): clean contact → HR/hit/out possible
 *   GOOD (0.50-0.65 or 0.85-0.92): topped/under → groundout, some singles
 *   EARLY (<0.50): way ahead → mostly whiff, some weak groundout
 *   LATE (>0.92): behind → mostly whiff, some foul
 * - Zone match: perfect match = solid, adjacent = glancing, far = miss
 */
import type { Zone, PitchOutcome } from '../data/types';
import { NOH_SIHWAN } from '../data/nohSihwanProfile';

const STRIKE_ZONES: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function isStrikeZone(zone: Zone): boolean {
  return STRIKE_ZONES.includes(zone);
}

const ZONE_ADJACENCY: Record<Zone, Zone[]> = {
  1: [2, 4, 5],    2: [1, 3, 4, 5, 6],   3: [2, 5, 6],
  4: [1, 2, 5, 7, 8], 5: [1, 2, 3, 4, 6, 7, 8, 9], 6: [2, 3, 5, 8, 9],
  7: [4, 5, 8],    8: [4, 5, 6, 7, 9],   9: [5, 6, 8],
  11: [1, 2, 3],   12: [7, 8, 9],  13: [1, 4, 7],  14: [3, 6, 9],
};

export type TimingQuality = 'perfect' | 'good' | 'early' | 'late' | 'way_off';

export interface BattingResult {
  outcome: PitchOutcome;
  description: string;
  timingQuality: TimingQuality;
  swingZoneAfterError: Zone | null;
}

/**
 * Swing error: 55% accurate, 35% adjacent, 10% wild
 */
export function applySwingError(targetZone: Zone): Zone {
  const roll = Math.random();
  if (roll < 0.55) return targetZone;
  if (roll < 0.90) {
    const adj = ZONE_ADJACENCY[targetZone];
    return adj && adj.length > 0 ? adj[Math.floor(Math.random() * adj.length)] : targetZone;
  }
  const all: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14];
  return all[Math.floor(Math.random() * all.length)];
}

/**
 * Timing quality from click ratio (0 = pitch start, 1 = ball arrival)
 */
export function getTimingQuality(clickRatio: number): TimingQuality {
  if (clickRatio >= 0.65 && clickRatio <= 0.85) return 'perfect';
  if (clickRatio >= 0.50 && clickRatio <= 0.92) return 'good';
  if (clickRatio < 0.35) return 'way_off';
  if (clickRatio < 0.50) return 'early';
  return 'late'; // > 0.92
}

/**
 * Main batting outcome.
 */
export function determineBattingOutcome(
  action: 'swing' | 'take',
  playerSwingZone: Zone | null,
  actualPitchZone: Zone,
  pitchCode: string,
  timing: TimingQuality,
  strikes: number = 0,
): BattingResult {
  const batter = NOH_SIHWAN;
  const twoStrikes = strikes >= 2;

  // === TAKE ===
  if (action === 'take' || !playerSwingZone) {
    if (isStrikeZone(actualPitchZone)) {
      return { outcome: 'called_strike', description: '스트라이크! 쳐야 했다...', timingQuality: timing, swingZoneAfterError: null };
    } else {
      return { outcome: 'ball', description: '볼! 좋은 눈!', timingQuality: timing, swingZoneAfterError: null };
    }
  }

  // === SWING ===
  const actualSwingZone = applySwingError(playerSwingZone);
  const perfectMatch = actualSwingZone === actualPitchZone;
  const adjacent = ZONE_ADJACENCY[actualPitchZone]?.includes(actualSwingZone) ?? false;

  const zoneStats = batter.zones[actualPitchZone];
  const pitchStats = batter.pitchTypeStats[pitchCode] ?? { ba: 0.200, whiffRate: 0.35 };
  const hrRate = zoneStats.hrRate;

  // Helper: on 2 strikes, convert some whiffs to fouls (foul protection)
  const foulOrWhiff = (desc: string): BattingResult => {
    if (twoStrikes && (perfectMatch || adjacent) && Math.random() < 0.5) {
      return { outcome: 'foul', description: '파울! 간신히 걸렸다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }
    return { outcome: 'swinging_strike', description: desc, timingQuality: timing, swingZoneAfterError: actualSwingZone };
  };

  // === WAY OFF timing → always whiff ===
  if (timing === 'way_off') {
    return { outcome: 'swinging_strike', description: '타이밍 완전 빗나감! 헛스윙!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === EARLY timing → mostly whiff, some weak groundout ===
  if (timing === 'early') {
    if (!perfectMatch && !adjacent) {
      return foulOrWhiff('너무 빨랐다! 헛스윙!');
    }
    const roll = Math.random();
    if (roll < 0.40) {
      return foulOrWhiff('너무 빨랐다! 헛스윙!');
    }
    if (roll < 0.75) {
      return { outcome: 'foul', description: '파울! 살짝 걸렸다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }
    return { outcome: 'groundout', description: '땅볼... 타이밍이 빨랐다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === LATE timing → mostly whiff/foul, some weak groundout ===
  if (timing === 'late') {
    if (!perfectMatch && !adjacent) {
      return foulOrWhiff('늦었다! 헛스윙!');
    }
    const roll = Math.random();
    if (roll < 0.35) {
      return foulOrWhiff('타이밍 늦었다! 헛스윙!');
    }
    if (roll < 0.75) {
      return { outcome: 'foul', description: '파울! 늦게 걸렸다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }
    return { outcome: 'groundout', description: '땅볼... 타이밍이 늦었다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === GOOD timing → topped/under contact → groundout/some singles ===
  if (timing === 'good') {
    // Far zone = whiff
    if (!perfectMatch && !adjacent) {
      return { outcome: 'swinging_strike', description: '헛스윙! 코스가 안 맞았다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }

    // Adjacent zone = weak contact → 안타 20%
    if (!perfectMatch && adjacent) {
      const roll = Math.random();
      if (roll < 0.15) return { outcome: 'foul', description: '파울!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.45) return { outcome: 'groundout', description: '땅볼... 맞긴 했는데', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.65) return { outcome: 'flyout', description: '뜬공 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.90) return { outcome: 'single', description: '안타! 잘 맞진 않았지만', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      return { outcome: 'double', description: '2루타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }

    // Perfect zone match + good timing → decent contact
    // Target: 파울 10%, 안타류 40%, 아웃 35%, 2루타+ 15%
    const roll = Math.random();
    if (roll < 0.10) return { outcome: 'foul', description: '파울! 아깝다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.28) return { outcome: 'groundout', description: '땅볼... 타이밍이 살짝', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.45) return { outcome: 'flyout', description: '뜬공 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.80) return { outcome: 'single', description: '안타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.95) return { outcome: 'double', description: '2루타! 좋은 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'homerun', description: '홈런!!! 타이밍 좋았다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === PERFECT timing ===

  // Far zone = whiff (even with perfect timing, can't reach)
  if (!perfectMatch && !adjacent) {
    const roll = Math.random();
    if (roll < 0.60) return { outcome: 'swinging_strike', description: '헛스윙! 코스 판단이 빗나갔다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'foul', description: '파울! 간신히 닿았다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Adjacent zone + perfect timing → contact but not clean
  if (!perfectMatch && adjacent) {
    const roll = Math.random();
    if (roll < 0.10) return { outcome: 'foul', description: '파울!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.40) return { outcome: 'groundout', description: '땅볼 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.60) return { outcome: 'flyout', description: '뜬공 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.90) return { outcome: 'single', description: '안타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.97) return { outcome: 'double', description: '2루타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'homerun', description: '홈런!!! 잘 걸렸다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === PERFECT timing + PERFECT zone match → BEST CONTACT ===
  // Target: ~18% HR, ~30% hit, ~30% out (before swing error)
  const roll = Math.random();
  const hrBonus = hrRate * 3.0;

  if (roll < hrBonus) {
    return { outcome: 'homerun', description: '홈런!!! 달을 쐈다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Hit: ~48% of remaining → ~40% total hits (HR + hits)
  if (roll < hrBonus + 0.48) {
    const hitRoll = Math.random();
    if (hitRoll < 0.10) return { outcome: 'triple', description: '3루타! 장타력 폭발!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (hitRoll < 0.35) return { outcome: 'double', description: '2루타! 통쾌한 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'single', description: '안타! 깔끔한 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Out: ~34% remaining
  if (roll < 0.88) return { outcome: 'flyout', description: '깊은 외야 플라이... 아깝다!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  return { outcome: 'lineout', description: '라인드라이브! 하지만 정면...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
}
