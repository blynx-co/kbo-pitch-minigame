import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

export const KBO_BATTER_PROFILES: Record<string, BatterProfile> = {
  dale: {
    id: 'dale',
    name: 'Dale',
    nameKo: '데일',
    bats: 'R',
    team: 'KIA',
    flavorText: '낮은 바깥쪽(9번 존)과 높은 바깥쪽(3번 존)에 약하다. 중앙(5번 존)은 위험 존. 체인지업에 헛스윙이 많다.',
    zones: {
      1: z(0.310, 0.60, 0.20, 0.80, 0.010),  // high inside
      2: z(0.380, 0.72, 0.14, 0.86, 0.015),  // high middle
      3: z(0.280, 0.56, 0.24, 0.76, 0.008),  // high outside
      4: z(0.350, 0.68, 0.12, 0.88, 0.012),  // middle inside
      5: z(0.420, 0.78, 0.09, 0.91, 0.018),  // dead center
      6: z(0.330, 0.65, 0.16, 0.84, 0.010),  // middle outside
      7: z(0.290, 0.55, 0.18, 0.82, 0.008),  // low inside
      8: z(0.340, 0.62, 0.15, 0.85, 0.012),  // low middle
      9: z(0.260, 0.48, 0.26, 0.74, 0.005),  // low outside
      11: z(0.180, 0.22, 0.34, 0.66, 0.003),  // high ball
      12: z(0.160, 0.28, 0.38, 0.62, 0.002),  // low ball
      13: z(0.120, 0.16, 0.45, 0.55, 0.001),  // left chase
      14: z(0.100, 0.14, 0.50, 0.50, 0.001),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.310, whiffRate: 0.16 },
      SI: { ba: 0.300, whiffRate: 0.14 },
      FC: { ba: 0.280, whiffRate: 0.20 },
      SL: { ba: 0.250, whiffRate: 0.28 },
      CU: { ba: 0.240, whiffRate: 0.26 },
      CH: { ba: 0.230, whiffRate: 0.30 },
      FS: { ba: 0.220, whiffRate: 0.32 },
    },
  },

  'kim-ho-ryeong': {
    id: 'kim-ho-ryeong',
    name: 'Ho-Ryeong Kim',
    nameKo: '김호령',
    bats: 'L',
    team: 'KIA',
    flavorText: '높은 안쪽(1번 존)과 낮은 바깥쪽(9번 존)에 약하다. 높은 가운데(2번 존)은 위험 존. 슬라이더에 헛스윙이 많다.',
    zones: {
      1: z(0.270, 0.58, 0.22, 0.78, 0.008),  // high inside
      2: z(0.380, 0.72, 0.13, 0.87, 0.012),  // high middle
      3: z(0.320, 0.62, 0.18, 0.82, 0.010),  // high outside
      4: z(0.340, 0.68, 0.14, 0.86, 0.010),  // middle inside
      5: z(0.400, 0.76, 0.10, 0.90, 0.015),  // dead center
      6: z(0.350, 0.66, 0.15, 0.85, 0.012),  // middle outside
      7: z(0.280, 0.54, 0.20, 0.80, 0.006),  // low inside
      8: z(0.330, 0.60, 0.16, 0.84, 0.010),  // low middle
      9: z(0.250, 0.46, 0.28, 0.72, 0.004),  // low outside
      11: z(0.170, 0.20, 0.36, 0.64, 0.002),  // high ball
      12: z(0.150, 0.26, 0.40, 0.60, 0.002),  // low ball
      13: z(0.130, 0.18, 0.44, 0.56, 0.001),  // left chase
      14: z(0.110, 0.15, 0.48, 0.52, 0.001),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.300, whiffRate: 0.15 },
      SI: { ba: 0.290, whiffRate: 0.14 },
      FC: { ba: 0.270, whiffRate: 0.22 },
      SL: { ba: 0.230, whiffRate: 0.32 },
      CU: { ba: 0.240, whiffRate: 0.28 },
      CH: { ba: 0.260, whiffRate: 0.26 },
      FS: { ba: 0.210, whiffRate: 0.34 },
    },
  },

  'kim-sun-bin': {
    id: 'kim-sun-bin',
    name: 'Sun-Bin Kim',
    nameKo: '김선빈',
    bats: 'R',
    team: 'KIA',
    flavorText: '높은 안쪽(1번 존)과 높은 바깥쪽(3번 존)에 약하다. 중앙(5번 존)은 위험 존. 선구안이 뛰어나 유인구 조심.',
    zones: {
      1: z(0.260, 0.52, 0.14, 0.86, 0.002),  // high inside
      2: z(0.350, 0.68, 0.08, 0.92, 0.004),  // high middle
      3: z(0.250, 0.50, 0.16, 0.84, 0.002),  // high outside
      4: z(0.330, 0.64, 0.07, 0.93, 0.003),  // middle inside
      5: z(0.390, 0.74, 0.05, 0.95, 0.005),  // dead center
      6: z(0.340, 0.62, 0.09, 0.91, 0.003),  // middle outside
      7: z(0.290, 0.56, 0.12, 0.88, 0.002),  // low inside
      8: z(0.360, 0.64, 0.08, 0.92, 0.004),  // low middle
      9: z(0.280, 0.48, 0.18, 0.82, 0.002),  // low outside
      11: z(0.140, 0.12, 0.30, 0.70, 0.001),  // high ball - excellent eye
      12: z(0.130, 0.15, 0.32, 0.68, 0.001),  // low ball
      13: z(0.090, 0.08, 0.40, 0.60, 0.000),  // left chase - rarely chases
      14: z(0.080, 0.07, 0.42, 0.58, 0.000),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.310, whiffRate: 0.10 },
      SI: { ba: 0.300, whiffRate: 0.09 },
      FC: { ba: 0.290, whiffRate: 0.14 },
      SL: { ba: 0.270, whiffRate: 0.18 },
      CU: { ba: 0.260, whiffRate: 0.16 },
      CH: { ba: 0.250, whiffRate: 0.20 },
      FS: { ba: 0.240, whiffRate: 0.22 },
    },
  },

  'kim-do-young': {
    id: 'kim-do-young',
    name: 'Do-Young Kim',
    nameKo: '김도영',
    bats: 'R',
    team: 'KIA',
    flavorText: '낮은 안쪽(7번 존)과 높은 바깥쪽(3번 존)에 약하다. 중앙(5번 존)은 위험 존. 포크볼에 헛스윙이 많다.',
    zones: {
      1: z(0.360, 0.64, 0.22, 0.78, 0.050),  // high inside
      2: z(0.440, 0.76, 0.16, 0.84, 0.080),  // high middle
      3: z(0.300, 0.58, 0.26, 0.74, 0.035),  // high outside
      4: z(0.420, 0.74, 0.14, 0.86, 0.065),  // middle inside
      5: z(0.500, 0.82, 0.10, 0.90, 0.095),  // dead center
      6: z(0.380, 0.68, 0.18, 0.82, 0.050),  // middle outside
      7: z(0.290, 0.56, 0.24, 0.76, 0.030),  // low inside
      8: z(0.390, 0.66, 0.18, 0.82, 0.060),  // low middle
      9: z(0.310, 0.52, 0.28, 0.72, 0.025),  // low outside
      11: z(0.250, 0.24, 0.34, 0.66, 0.020),  // high ball
      12: z(0.220, 0.30, 0.38, 0.62, 0.015),  // low ball
      13: z(0.180, 0.22, 0.44, 0.56, 0.008),  // left chase
      14: z(0.150, 0.20, 0.48, 0.52, 0.005),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.290, whiffRate: 0.20 },
      SI: { ba: 0.280, whiffRate: 0.18 },
      FC: { ba: 0.260, whiffRate: 0.24 },
      SL: { ba: 0.240, whiffRate: 0.30 },
      CU: { ba: 0.230, whiffRate: 0.28 },
      CH: { ba: 0.250, whiffRate: 0.26 },
      FS: { ba: 0.210, whiffRate: 0.35 },
    },
  },

  castro: {
    id: 'castro',
    name: 'Castro',
    nameKo: '카스트로',
    bats: 'R',
    team: 'KIA',
    flavorText: '높은 바깥쪽(3번 존)과 낮은 바깥쪽(9번 존)에 약하다. 중간 안쪽(4번 존)은 위험 존. 체인지업에 헛스윙이 많다.',
    zones: {
      1: z(0.340, 0.66, 0.24, 0.76, 0.045),  // high inside
      2: z(0.400, 0.74, 0.18, 0.82, 0.065),  // high middle
      3: z(0.270, 0.56, 0.30, 0.70, 0.030),  // high outside
      4: z(0.420, 0.76, 0.15, 0.85, 0.070),  // middle inside
      5: z(0.470, 0.80, 0.12, 0.88, 0.085),  // dead center
      6: z(0.340, 0.64, 0.22, 0.78, 0.040),  // middle outside
      7: z(0.320, 0.60, 0.20, 0.80, 0.035),  // low inside
      8: z(0.380, 0.68, 0.16, 0.84, 0.055),  // low middle
      9: z(0.260, 0.48, 0.32, 0.68, 0.020),  // low outside
      11: z(0.230, 0.28, 0.36, 0.64, 0.018),  // high ball
      12: z(0.200, 0.32, 0.40, 0.60, 0.012),  // low ball
      13: z(0.180, 0.26, 0.46, 0.54, 0.008),  // left chase
      14: z(0.160, 0.24, 0.50, 0.50, 0.005),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.22 },
      SI: { ba: 0.270, whiffRate: 0.20 },
      FC: { ba: 0.250, whiffRate: 0.26 },
      SL: { ba: 0.230, whiffRate: 0.32 },
      CU: { ba: 0.220, whiffRate: 0.30 },
      CH: { ba: 0.210, whiffRate: 0.36 },
      FS: { ba: 0.200, whiffRate: 0.38 },
    },
  },

  'na-sung-bum': {
    id: 'na-sung-bum',
    name: 'Sung-Bum Na',
    nameKo: '나성범',
    bats: 'L',
    team: 'KIA',
    flavorText: '높은 안쪽(1번 존)과 낮은 바깥쪽(9번 존)에 약하다. 높은 가운데(2번 존)은 위험 존. 커브에 헛스윙이 많다.',
    zones: {
      1: z(0.280, 0.58, 0.24, 0.76, 0.030),  // high inside
      2: z(0.400, 0.74, 0.14, 0.86, 0.055),  // high middle
      3: z(0.330, 0.62, 0.18, 0.82, 0.035),  // high outside
      4: z(0.360, 0.70, 0.16, 0.84, 0.045),  // middle inside
      5: z(0.440, 0.78, 0.10, 0.90, 0.065),  // dead center
      6: z(0.370, 0.66, 0.14, 0.86, 0.040),  // middle outside
      7: z(0.300, 0.56, 0.20, 0.80, 0.025),  // low inside
      8: z(0.360, 0.64, 0.15, 0.85, 0.040),  // low middle
      9: z(0.270, 0.46, 0.28, 0.72, 0.015),  // low outside
      11: z(0.200, 0.20, 0.34, 0.66, 0.012),  // high ball
      12: z(0.180, 0.26, 0.38, 0.62, 0.008),  // low ball
      13: z(0.140, 0.16, 0.44, 0.56, 0.004),  // left chase
      14: z(0.120, 0.14, 0.48, 0.52, 0.003),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.18 },
      SI: { ba: 0.270, whiffRate: 0.16 },
      FC: { ba: 0.260, whiffRate: 0.22 },
      SL: { ba: 0.240, whiffRate: 0.28 },
      CU: { ba: 0.220, whiffRate: 0.32 },
      CH: { ba: 0.250, whiffRate: 0.26 },
      FS: { ba: 0.210, whiffRate: 0.34 },
    },
  },

  'han-jun-su': {
    id: 'han-jun-su',
    name: 'Jun-Su Han',
    nameKo: '한준수',
    bats: 'L',
    team: 'KIA',
    flavorText: '높은 안쪽(1번 존)과 낮은 안쪽(7번 존)에 약하다. 낮은 가운데(8번 존)은 위험 존. 슬라이더에 헛스윙이 많다.',
    zones: {
      1: z(0.250, 0.56, 0.24, 0.76, 0.015),  // high inside
      2: z(0.340, 0.70, 0.16, 0.84, 0.025),  // high middle
      3: z(0.300, 0.60, 0.20, 0.80, 0.018),  // high outside
      4: z(0.310, 0.66, 0.18, 0.82, 0.020),  // middle inside
      5: z(0.380, 0.76, 0.12, 0.88, 0.035),  // dead center
      6: z(0.330, 0.64, 0.16, 0.84, 0.022),  // middle outside
      7: z(0.250, 0.52, 0.22, 0.78, 0.012),  // low inside
      8: z(0.350, 0.62, 0.14, 0.86, 0.028),  // low middle
      9: z(0.270, 0.46, 0.26, 0.74, 0.010),  // low outside
      11: z(0.160, 0.20, 0.36, 0.64, 0.006),  // high ball
      12: z(0.150, 0.24, 0.40, 0.60, 0.004),  // low ball
      13: z(0.110, 0.16, 0.46, 0.54, 0.002),  // left chase
      14: z(0.100, 0.14, 0.50, 0.50, 0.002),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.270, whiffRate: 0.20 },
      SI: { ba: 0.260, whiffRate: 0.18 },
      FC: { ba: 0.250, whiffRate: 0.24 },
      SL: { ba: 0.220, whiffRate: 0.34 },
      CU: { ba: 0.230, whiffRate: 0.30 },
      CH: { ba: 0.240, whiffRate: 0.28 },
      FS: { ba: 0.210, whiffRate: 0.36 },
    },
  },

  'park-sang-jun': {
    id: 'park-sang-jun',
    name: 'Sang-Jun Park',
    nameKo: '박상준',
    bats: 'R',
    team: 'KIA',
    flavorText: '높은 바깥쪽(3번 존)과 낮은 바깥쪽(9번 존)에 약하다. 낮은 가운데(8번 존)은 위험 존. 포크볼에 헛스윙이 많다.',
    zones: {
      1: z(0.260, 0.56, 0.22, 0.78, 0.012),  // high inside
      2: z(0.320, 0.68, 0.16, 0.84, 0.020),  // high middle
      3: z(0.230, 0.50, 0.28, 0.72, 0.008),  // high outside
      4: z(0.300, 0.64, 0.18, 0.82, 0.018),  // middle inside
      5: z(0.370, 0.74, 0.12, 0.88, 0.030),  // dead center
      6: z(0.280, 0.60, 0.20, 0.80, 0.015),  // middle outside
      7: z(0.270, 0.54, 0.20, 0.80, 0.012),  // low inside
      8: z(0.340, 0.64, 0.14, 0.86, 0.025),  // low middle
      9: z(0.220, 0.44, 0.30, 0.70, 0.006),  // low outside
      11: z(0.160, 0.22, 0.36, 0.64, 0.005),  // high ball
      12: z(0.140, 0.26, 0.40, 0.60, 0.004),  // low ball
      13: z(0.110, 0.18, 0.46, 0.54, 0.002),  // left chase
      14: z(0.090, 0.16, 0.50, 0.50, 0.001),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.260, whiffRate: 0.20 },
      SI: { ba: 0.250, whiffRate: 0.18 },
      FC: { ba: 0.240, whiffRate: 0.24 },
      SL: { ba: 0.220, whiffRate: 0.30 },
      CU: { ba: 0.210, whiffRate: 0.28 },
      CH: { ba: 0.230, whiffRate: 0.26 },
      FS: { ba: 0.200, whiffRate: 0.36 },
    },
  },

  'park-jae-hyun': {
    id: 'park-jae-hyun',
    name: 'Jae-Hyun Park',
    nameKo: '박재현',
    bats: 'R',
    team: 'KIA',
    flavorText: '높은 바깥쪽(3번 존)과 낮은 안쪽(7번 존)에 약하다. 중앙(5번 존)은 위험 존. 체인지업에 헛스윙이 많다.',
    zones: {
      1: z(0.250, 0.54, 0.24, 0.76, 0.010),  // high inside
      2: z(0.310, 0.68, 0.18, 0.82, 0.018),  // high middle
      3: z(0.220, 0.48, 0.30, 0.70, 0.006),  // high outside
      4: z(0.290, 0.62, 0.20, 0.80, 0.015),  // middle inside
      5: z(0.360, 0.74, 0.14, 0.86, 0.028),  // dead center
      6: z(0.270, 0.58, 0.22, 0.78, 0.012),  // middle outside
      7: z(0.230, 0.50, 0.26, 0.74, 0.008),  // low inside
      8: z(0.310, 0.60, 0.18, 0.82, 0.020),  // low middle
      9: z(0.210, 0.42, 0.32, 0.68, 0.005),  // low outside
      11: z(0.150, 0.20, 0.38, 0.62, 0.004),  // high ball
      12: z(0.140, 0.24, 0.42, 0.58, 0.003),  // low ball
      13: z(0.100, 0.16, 0.48, 0.52, 0.001),  // left chase
      14: z(0.090, 0.14, 0.52, 0.48, 0.001),  // right chase
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.250, whiffRate: 0.22 },
      SI: { ba: 0.240, whiffRate: 0.20 },
      FC: { ba: 0.230, whiffRate: 0.26 },
      SL: { ba: 0.210, whiffRate: 0.32 },
      CU: { ba: 0.200, whiffRate: 0.30 },
      CH: { ba: 0.220, whiffRate: 0.34 },
      FS: { ba: 0.190, whiffRate: 0.38 },
    },
  },
};
