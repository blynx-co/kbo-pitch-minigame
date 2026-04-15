/**
 * Kim Seo-hyun batting outcome engine — more generous than Yamamoto.
 * When you time it right and match the zone, hits/HRs come more easily.
 * Also handles HBP (hit by pitch) and dodge mechanics.
 */
import type { Zone, PitchOutcome } from '../data/types';

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

export interface KimBattingResult {
  outcome: PitchOutcome;
  description: string;
  timingQuality: TimingQuality;
  swingZoneAfterError: Zone | null;
}

/** Swing error: 55% accurate, 35% adjacent, 10% wild */
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

/** Timing quality from click ratio */
export function getTimingQuality(clickRatio: number): TimingQuality {
  if (clickRatio >= 0.75 && clickRatio <= 0.95) return 'perfect';
  if (clickRatio >= 0.55 && clickRatio <= 1.10) return 'good';
  if (clickRatio < 0.30) return 'way_off';
  if (clickRatio < 0.55) return 'early';
  return 'late';
}

export function determineKimBattingOutcome(
  action: 'swing' | 'take' | 'dodge',
  playerSwingZone: Zone | null,
  actualPitchZone: Zone,
  _pitchCode: string,
  timing: TimingQuality,
  strikes: number = 0,
  isAtBatter: boolean = false,
): KimBattingResult {
  const twoStrikes = strikes >= 2;

  // === DODGE ===
  if (action === 'dodge') {
    if (isAtBatter) {
      return { outcome: 'ball', description: '위험! 몸을 피했다!', timingQuality: timing, swingZoneAfterError: null };
    }
    // Dodge on non-at-batter pitch: same as take
    if (isStrikeZone(actualPitchZone)) {
      return { outcome: 'called_strike', description: '피했는데... 스트라이크!', timingQuality: timing, swingZoneAfterError: null };
    }
    return { outcome: 'ball', description: '볼! 피할 필요 없었다', timingQuality: timing, swingZoneAfterError: null };
  }

  // === TAKE ===
  if (action === 'take' || !playerSwingZone) {
    if (isAtBatter) {
      return { outcome: 'hit_by_pitch', description: '몸에 맞는 볼! 출루!', timingQuality: timing, swingZoneAfterError: null };
    }
    if (isStrikeZone(actualPitchZone)) {
      return { outcome: 'called_strike', description: '스트라이크! 쳐야 했다...', timingQuality: timing, swingZoneAfterError: null };
    }
    return { outcome: 'ball', description: '볼! 좋은 눈!', timingQuality: timing, swingZoneAfterError: null };
  }

  // === SWING ===
  const actualSwingZone = applySwingError(playerSwingZone);
  const perfectMatch = actualSwingZone === actualPitchZone;
  const adjacent = ZONE_ADJACENCY[actualPitchZone]?.includes(actualSwingZone) ?? false;

  const foulOrWhiff = (desc: string): KimBattingResult => {
    if (twoStrikes && (perfectMatch || adjacent) && Math.random() < 0.5) {
      return { outcome: 'foul', description: '파울! 간신히 걸렸다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }
    return { outcome: 'swinging_strike', description: desc, timingQuality: timing, swingZoneAfterError: actualSwingZone };
  };

  // WAY OFF timing → always whiff
  if (timing === 'way_off') {
    return { outcome: 'swinging_strike', description: '타이밍 완전 빗나감! 헛스윙!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // EARLY timing → mostly whiff/foul, some weak groundout, rare lucky hit
  if (timing === 'early') {
    if (!perfectMatch && !adjacent) return foulOrWhiff('너무 빨랐다! 헛스윙!');
    const roll = Math.random();
    if (roll < 0.30) return foulOrWhiff('너무 빨랐다! 헛스윙!');
    if (roll < 0.60) return { outcome: 'foul', description: '파울! 살짝 걸렸다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.85) return { outcome: 'groundout', description: '땅볼... 타이밍이 빨랐다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'single', description: '안타! 운이 좋았다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // LATE timing → mostly foul, some weak groundout, rare lucky hit
  if (timing === 'late') {
    if (!perfectMatch && !adjacent) return foulOrWhiff('늦었다! 헛스윙!');
    const roll = Math.random();
    if (roll < 0.25) return foulOrWhiff('타이밍 늦었다! 헛스윙!');
    if (roll < 0.55) return { outcome: 'foul', description: '파울! 늦게 걸렸다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.80) return { outcome: 'groundout', description: '땅볼... 타이밍이 늦었다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'single', description: '안타! 밀어쳤다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === GOOD timing ===
  if (timing === 'good') {
    // Far zone = whiff
    if (!perfectMatch && !adjacent) {
      return { outcome: 'swinging_strike', description: '헛스윙! 코스가 안 맞았다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }

    // Adjacent zone + good timing → decent contact
    if (!perfectMatch && adjacent) {
      const roll = Math.random();
      if (roll < 0.10) return { outcome: 'foul', description: '파울!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.30) return { outcome: 'groundout', description: '땅볼... 맞긴 했는데', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.45) return { outcome: 'flyout', description: '뜬공 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.75) return { outcome: 'single', description: '안타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      if (roll < 0.93) return { outcome: 'double', description: '2루타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
      return { outcome: 'homerun', description: '홈런!!! 잘 걸렸다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    }

    // Perfect zone match + good timing → generous contact
    const roll = Math.random();
    if (roll < 0.05) return { outcome: 'foul', description: '파울! 아깝다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.18) return { outcome: 'groundout', description: '땅볼... 타이밍이 살짝', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.28) return { outcome: 'flyout', description: '뜬공 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.55) return { outcome: 'single', description: '안타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.75) return { outcome: 'double', description: '2루타! 좋은 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.85) return { outcome: 'triple', description: '3루타! 통쾌하다!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'homerun', description: '홈런!!! 시원하게 날렸다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === PERFECT timing ===

  // Far zone = whiff/foul
  if (!perfectMatch && !adjacent) {
    const roll = Math.random();
    if (roll < 0.50) return { outcome: 'swinging_strike', description: '헛스윙! 코스 판단이 빗나갔다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'foul', description: '파울! 간신히 닿았다', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // Adjacent zone + perfect timing → solid contact
  if (!perfectMatch && adjacent) {
    const roll = Math.random();
    if (roll < 0.05) return { outcome: 'foul', description: '파울!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.18) return { outcome: 'groundout', description: '땅볼 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.28) return { outcome: 'flyout', description: '뜬공 아웃...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.50) return { outcome: 'single', description: '안타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.70) return { outcome: 'double', description: '2루타! 좋은 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    if (roll < 0.82) return { outcome: 'triple', description: '3루타!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
    return { outcome: 'homerun', description: '홈런!!! 잘 걸렸다!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  }

  // === PERFECT timing + PERFECT zone match ===
  // Very generous: 30% HR, 35% hit, 25% out, 10% foul
  const roll = Math.random();
  if (roll < 0.30) return { outcome: 'homerun', description: '홈런!!! 완벽한 타격!!!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  if (roll < 0.50) return { outcome: 'single', description: '안타! 깔끔한 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  if (roll < 0.60) return { outcome: 'double', description: '2루타! 통쾌한 타격!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  if (roll < 0.65) return { outcome: 'triple', description: '3루타! 장타력 폭발!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  if (roll < 0.80) return { outcome: 'flyout', description: '깊은 외야 플라이... 아깝다!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  if (roll < 0.90) return { outcome: 'lineout', description: '라인드라이브! 하지만 정면...', timingQuality: timing, swingZoneAfterError: actualSwingZone };
  return { outcome: 'foul', description: '파울! 아깝다!', timingQuality: timing, swingZoneAfterError: actualSwingZone };
}
