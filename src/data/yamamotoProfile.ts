import type { KorPitcherProfile, Zone } from './types';

export const YAMAMOTO_PROFILE: KorPitcherProfile = {
  id: 'yamamoto',
  name: 'Yoshinobu Yamamoto',
  nameKo: '야마모토 요시노부',
  hand: 'R',
  style: 'MLB 에이스',
  description: '다저스 에이스. 95mph 포심 + 78mph 커브 + 90mph 스플리터. 구속 차이 17mph의 마구.',
  pitches: [
    { code: 'FF', name: 'Four-Seam', nameKo: '포심', avgSpeed: 95, movement: '직선 궤도' },
    { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 78, movement: '큰 낙차' },
    { code: 'FS', name: 'Splitter', nameKo: '스플리터', avgSpeed: 90, movement: '급격한 낙차' },
    { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 91, movement: '살짝 가로' },
  ],
};

// Pitch selection weights by count (from Statcast 650 pitches)
// Format: { pitchCode: probability }
export const YAMAMOTO_PITCH_WEIGHTS: Record<string, Record<string, number>> = {
  '0-0': { FF: 0.45, CU: 0.25, FS: 0.25, FC: 0.05 },
  '0-1': { FF: 0.30, CU: 0.30, FS: 0.30, FC: 0.10 },
  '0-2': { FF: 0.20, CU: 0.25, FS: 0.45, FC: 0.10 }, // waste pitch / chase
  '1-0': { FF: 0.50, CU: 0.20, FS: 0.25, FC: 0.05 },
  '1-1': { FF: 0.40, CU: 0.25, FS: 0.25, FC: 0.10 },
  '1-2': { FF: 0.25, CU: 0.30, FS: 0.35, FC: 0.10 },
  '2-0': { FF: 0.60, CU: 0.15, FS: 0.20, FC: 0.05 },
  '2-1': { FF: 0.50, CU: 0.20, FS: 0.25, FC: 0.05 },
  '2-2': { FF: 0.35, CU: 0.25, FS: 0.30, FC: 0.10 },
  '3-0': { FF: 0.75, CU: 0.05, FS: 0.15, FC: 0.05 },
  '3-1': { FF: 0.60, CU: 0.15, FS: 0.20, FC: 0.05 },
  '3-2': { FF: 0.45, CU: 0.20, FS: 0.30, FC: 0.05 },
};

// Zone distribution per pitch type (from Statcast data, normalized)
// Higher number = more likely to throw there
export const YAMAMOTO_ZONE_WEIGHTS: Record<string, Partial<Record<Zone, number>>> = {
  FF: {
    1: 5, 2: 5, 3: 4, 4: 6, 5: 13, 6: 9,
    7: 10, 8: 6, 9: 6, 11: 10, 12: 5, 13: 9, 14: 12,
  },
  CU: {
    1: 6, 2: 2, 3: 1, 4: 9, 5: 8, 6: 1,
    7: 8, 8: 14, 9: 6, 11: 10, 12: 1, 13: 6, 14: 28,
  },
  FS: {
    1: 2, 4: 7, 5: 3, 7: 7, 8: 8, 9: 2,
    11: 9, 13: 38, 14: 24,
  },
  FC: {
    2: 5, 4: 5, 5: 2, 6: 14, 8: 10, 9: 10,
    12: 14, 14: 40,
  },
};
