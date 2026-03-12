import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

export const USA_BATTER_PROFILES: Record<string, BatterProfile> = {
  witt: {
    id: 'witt',
    name: 'Bobby Witt Jr.',
    nameKo: '바비 윗 주니어',
    bats: 'R',
    team: 'USA',
    flavorText: '빠른 볼에 강하다. 낮은 바깥쪽(9번 존)에 약점. 체인지업과 스위퍼로 공략.',
    zones: {
      1: z(0.360, 0.74, 0.22, 0.78, 0.06),  // high inside
      2: z(0.420, 0.82, 0.16, 0.84, 0.10),  // high middle
      3: z(0.310, 0.68, 0.28, 0.72, 0.05),  // high outside
      4: z(0.400, 0.80, 0.14, 0.86, 0.09),  // middle inside
      5: z(0.460, 0.88, 0.10, 0.90, 0.13),  // dead center
      6: z(0.350, 0.74, 0.20, 0.80, 0.07),  // middle outside
      7: z(0.330, 0.70, 0.24, 0.76, 0.05),  // low inside
      8: z(0.370, 0.76, 0.18, 0.82, 0.07),  // low middle
      9: z(0.240, 0.58, 0.36, 0.64, 0.02),  // low outside
      11: z(0.190, 0.38, 0.44, 0.56, 0.02),  // 하이볼
      12: z(0.170, 0.34, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.180, 0.36, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.160, 0.32, 0.50, 0.50, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.290, whiffRate: 0.20 },
      SI: { ba: 0.275, whiffRate: 0.18 },
      FC: { ba: 0.255, whiffRate: 0.24 },
      CH: { ba: 0.210, whiffRate: 0.34 },
      SL: { ba: 0.225, whiffRate: 0.30 },
      ST: { ba: 0.205, whiffRate: 0.36 },
      CU: { ba: 0.200, whiffRate: 0.38 },
    },
  },

  henderson: {
    id: 'henderson',
    name: 'Gunnar Henderson',
    nameKo: '거너 헨더슨',
    bats: 'L',
    team: 'USA',
    flavorText: '파워 타자. 높은 존에 강하고 낮은 바깥쪽에 약하다. 스플리터 유효.',
    zones: {
      1: z(0.380, 0.78, 0.20, 0.80, 0.08),  // high inside
      2: z(0.440, 0.84, 0.14, 0.86, 0.12),  // high middle
      3: z(0.360, 0.74, 0.22, 0.78, 0.07),  // high outside
      4: z(0.410, 0.82, 0.12, 0.88, 0.10),  // middle inside
      5: z(0.470, 0.88, 0.09, 0.91, 0.14),  // dead center
      6: z(0.320, 0.70, 0.24, 0.76, 0.06),  // middle outside
      7: z(0.290, 0.66, 0.28, 0.72, 0.04),  // low inside
      8: z(0.350, 0.72, 0.22, 0.78, 0.06),  // low middle
      9: z(0.220, 0.56, 0.38, 0.62, 0.02),  // low outside
      11: z(0.200, 0.40, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.160, 0.32, 0.52, 0.48, 0.01),  // 로우볼
      13: z(0.175, 0.35, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.155, 0.30, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.285, whiffRate: 0.22 },
      SI: { ba: 0.265, whiffRate: 0.19 },
      FC: { ba: 0.245, whiffRate: 0.26 },
      CH: { ba: 0.215, whiffRate: 0.32 },
      SL: { ba: 0.220, whiffRate: 0.32 },
      ST: { ba: 0.200, whiffRate: 0.38 },
      CU: { ba: 0.195, whiffRate: 0.40 },
    },
  },

  judge: {
    id: 'judge',
    name: 'Aaron Judge',
    nameKo: '애런 저지',
    bats: 'R',
    team: 'USA',
    flavorText: '압도적인 파워. 높은 바깥쪽과 낮은 존에 약하다. 체인지업과 낮은 변화구가 열쇠.',
    zones: {
      1: z(0.340, 0.72, 0.24, 0.76, 0.07),  // high inside
      2: z(0.430, 0.84, 0.14, 0.86, 0.13),  // high middle
      3: z(0.290, 0.66, 0.30, 0.70, 0.05),  // high outside
      4: z(0.420, 0.82, 0.12, 0.88, 0.12),  // middle inside
      5: z(0.490, 0.90, 0.08, 0.92, 0.16),  // dead center
      6: z(0.310, 0.68, 0.26, 0.74, 0.06),  // middle outside
      7: z(0.280, 0.64, 0.30, 0.70, 0.04),  // low inside
      8: z(0.340, 0.70, 0.24, 0.76, 0.06),  // low middle
      9: z(0.210, 0.54, 0.40, 0.60, 0.02),  // low outside
      11: z(0.210, 0.42, 0.40, 0.60, 0.02),  // 하이볼
      12: z(0.165, 0.33, 0.54, 0.46, 0.01),  // 로우볼
      13: z(0.180, 0.37, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.31, 0.54, 0.46, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.24 },
      SI: { ba: 0.260, whiffRate: 0.20 },
      FC: { ba: 0.240, whiffRate: 0.28 },
      CH: { ba: 0.200, whiffRate: 0.36 },
      SL: { ba: 0.215, whiffRate: 0.34 },
      ST: { ba: 0.195, whiffRate: 0.40 },
      CU: { ba: 0.190, whiffRate: 0.42 },
    },
  },

  schwarber: {
    id: 'schwarber',
    name: 'Kyle Schwarber',
    nameKo: '카일 슈워버',
    bats: 'L',
    team: 'USA',
    flavorText: '좌타자 거포. 높은 안쪽에 강하고 바깥쪽 낮은 곳에 약하다. 슬라이더 유효.',
    zones: {
      1: z(0.420, 0.82, 0.18, 0.82, 0.11),  // high inside
      2: z(0.460, 0.86, 0.14, 0.86, 0.14),  // high middle
      3: z(0.310, 0.68, 0.28, 0.72, 0.05),  // high outside
      4: z(0.390, 0.80, 0.16, 0.84, 0.10),  // middle inside
      5: z(0.480, 0.90, 0.09, 0.91, 0.15),  // dead center
      6: z(0.300, 0.66, 0.28, 0.72, 0.05),  // middle outside
      7: z(0.270, 0.62, 0.32, 0.68, 0.03),  // low inside
      8: z(0.330, 0.70, 0.26, 0.74, 0.05),  // low middle
      9: z(0.200, 0.52, 0.44, 0.56, 0.02),  // low outside
      11: z(0.215, 0.44, 0.38, 0.62, 0.02),  // 하이볼
      12: z(0.160, 0.30, 0.56, 0.44, 0.01),  // 로우볼
      13: z(0.185, 0.38, 0.44, 0.56, 0.01),  // 왼쪽 유인구
      14: z(0.145, 0.28, 0.58, 0.42, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.275, whiffRate: 0.24 },
      SI: { ba: 0.255, whiffRate: 0.21 },
      FC: { ba: 0.230, whiffRate: 0.30 },
      CH: { ba: 0.205, whiffRate: 0.34 },
      SL: { ba: 0.195, whiffRate: 0.38 },
      ST: { ba: 0.185, whiffRate: 0.42 },
      CU: { ba: 0.190, whiffRate: 0.40 },
    },
  },

  w_smith: {
    id: 'w_smith',
    name: 'Will Smith',
    nameKo: '윌 스미스',
    bats: 'R',
    team: 'USA',
    flavorText: '다저스 포수 출신. 컨택 능력 우수. 낮은 구종과 체인지업이 효과적.',
    zones: {
      1: z(0.330, 0.72, 0.22, 0.78, 0.06),  // high inside
      2: z(0.400, 0.80, 0.16, 0.84, 0.09),  // high middle
      3: z(0.320, 0.70, 0.24, 0.76, 0.05),  // high outside
      4: z(0.380, 0.78, 0.14, 0.86, 0.08),  // middle inside
      5: z(0.440, 0.86, 0.10, 0.90, 0.11),  // dead center
      6: z(0.330, 0.72, 0.20, 0.80, 0.06),  // middle outside
      7: z(0.300, 0.66, 0.26, 0.74, 0.04),  // low inside
      8: z(0.340, 0.72, 0.22, 0.78, 0.06),  // low middle
      9: z(0.250, 0.60, 0.34, 0.66, 0.02),  // low outside
      11: z(0.185, 0.37, 0.44, 0.56, 0.01),  // 하이볼
      12: z(0.165, 0.33, 0.50, 0.50, 0.01),  // 로우볼
      13: z(0.175, 0.35, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.155, 0.31, 0.50, 0.50, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.20 },
      SI: { ba: 0.265, whiffRate: 0.17 },
      FC: { ba: 0.245, whiffRate: 0.24 },
      CH: { ba: 0.215, whiffRate: 0.32 },
      SL: { ba: 0.225, whiffRate: 0.30 },
      ST: { ba: 0.205, whiffRate: 0.35 },
      CU: { ba: 0.200, whiffRate: 0.36 },
    },
  },

  anthony: {
    id: 'anthony',
    name: 'Roman Anthony',
    nameKo: '로만 앤소니',
    bats: 'L',
    team: 'USA',
    flavorText: '레드삭스 유망주. 아직 MLB 경험이 적다. 빠른 볼과 낮은 변화구로 공략.',
    zones: {
      1: z(0.320, 0.70, 0.24, 0.76, 0.05),  // high inside
      2: z(0.380, 0.78, 0.18, 0.82, 0.08),  // high middle
      3: z(0.300, 0.66, 0.28, 0.72, 0.04),  // high outside
      4: z(0.360, 0.76, 0.16, 0.84, 0.07),  // middle inside
      5: z(0.420, 0.84, 0.12, 0.88, 0.10),  // dead center
      6: z(0.310, 0.68, 0.24, 0.76, 0.05),  // middle outside
      7: z(0.275, 0.62, 0.30, 0.70, 0.03),  // low inside
      8: z(0.320, 0.68, 0.26, 0.74, 0.05),  // low middle
      9: z(0.230, 0.56, 0.38, 0.62, 0.02),  // low outside
      11: z(0.180, 0.36, 0.46, 0.54, 0.01),  // 하이볼
      12: z(0.155, 0.30, 0.54, 0.46, 0.01),  // 로우볼
      13: z(0.165, 0.32, 0.50, 0.50, 0.01),  // 왼쪽 유인구
      14: z(0.145, 0.28, 0.54, 0.46, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.270, whiffRate: 0.24 },
      SI: { ba: 0.255, whiffRate: 0.21 },
      FC: { ba: 0.235, whiffRate: 0.28 },
      CH: { ba: 0.205, whiffRate: 0.34 },
      SL: { ba: 0.215, whiffRate: 0.32 },
      ST: { ba: 0.195, whiffRate: 0.38 },
      CU: { ba: 0.190, whiffRate: 0.40 },
    },
  },

  goldschmidt: {
    id: 'goldschmidt',
    name: 'Paul Goldschmidt',
    nameKo: '폴 골드슈미트',
    bats: 'R',
    team: 'USA',
    flavorText: '베테랑 1루수. 낮은 구종에 강하고 높은 바깥쪽에 약하다. 스위퍼 효과적.',
    zones: {
      1: z(0.310, 0.70, 0.24, 0.76, 0.05),  // high inside
      2: z(0.390, 0.80, 0.16, 0.84, 0.09),  // high middle
      3: z(0.260, 0.64, 0.32, 0.68, 0.03),  // high outside
      4: z(0.370, 0.78, 0.14, 0.86, 0.08),  // middle inside
      5: z(0.440, 0.86, 0.10, 0.90, 0.11),  // dead center
      6: z(0.320, 0.70, 0.22, 0.78, 0.06),  // middle outside
      7: z(0.350, 0.74, 0.18, 0.82, 0.07),  // low inside
      8: z(0.380, 0.78, 0.16, 0.84, 0.08),  // low middle
      9: z(0.270, 0.62, 0.30, 0.70, 0.04),  // low outside
      11: z(0.175, 0.35, 0.46, 0.54, 0.01),  // 하이볼
      12: z(0.170, 0.34, 0.46, 0.54, 0.01),  // 로우볼
      13: z(0.170, 0.34, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.30, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.275, whiffRate: 0.20 },
      SI: { ba: 0.260, whiffRate: 0.18 },
      FC: { ba: 0.240, whiffRate: 0.26 },
      CH: { ba: 0.210, whiffRate: 0.32 },
      SL: { ba: 0.220, whiffRate: 0.30 },
      ST: { ba: 0.195, whiffRate: 0.38 },
      CU: { ba: 0.195, whiffRate: 0.38 },
    },
  },

  clement: {
    id: 'clement',
    name: 'Ernie Clement',
    nameKo: '어니 클레멘트',
    bats: 'R',
    team: 'USA',
    flavorText: '컨택 위주의 하단 타자. 파워는 적지만 컨택률이 높다. 낮은 변화구 유효.',
    zones: {
      1: z(0.280, 0.68, 0.26, 0.74, 0.02),  // high inside
      2: z(0.330, 0.74, 0.20, 0.80, 0.04),  // high middle
      3: z(0.290, 0.70, 0.22, 0.78, 0.03),  // high outside
      4: z(0.310, 0.72, 0.18, 0.82, 0.03),  // middle inside
      5: z(0.360, 0.78, 0.14, 0.86, 0.05),  // dead center
      6: z(0.300, 0.70, 0.20, 0.80, 0.03),  // middle outside
      7: z(0.270, 0.64, 0.26, 0.74, 0.02),  // low inside
      8: z(0.300, 0.68, 0.22, 0.78, 0.03),  // low middle
      9: z(0.240, 0.58, 0.30, 0.70, 0.02),  // low outside
      11: z(0.165, 0.33, 0.44, 0.56, 0.01),  // 하이볼
      12: z(0.150, 0.29, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.160, 0.31, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.145, 0.28, 0.48, 0.52, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.18 },
      SI: { ba: 0.255, whiffRate: 0.16 },
      FC: { ba: 0.240, whiffRate: 0.22 },
      CH: { ba: 0.220, whiffRate: 0.28 },
      SL: { ba: 0.225, whiffRate: 0.28 },
      ST: { ba: 0.205, whiffRate: 0.34 },
      CU: { ba: 0.200, whiffRate: 0.36 },
    },
  },

  crow_armstrong: {
    id: 'crow_armstrong',
    name: 'Pete Crow-Armstrong',
    nameKo: '피트 크로우-암스트롱',
    bats: 'L',
    team: 'USA',
    flavorText: '컵스 유망주 중견수. 스피드 위주. 낮은 변화구와 바깥쪽 공략이 효과적.',
    zones: {
      1: z(0.300, 0.70, 0.26, 0.74, 0.04),  // high inside
      2: z(0.360, 0.76, 0.20, 0.80, 0.07),  // high middle
      3: z(0.280, 0.66, 0.28, 0.72, 0.04),  // high outside
      4: z(0.340, 0.74, 0.18, 0.82, 0.06),  // middle inside
      5: z(0.400, 0.82, 0.14, 0.86, 0.09),  // dead center
      6: z(0.290, 0.66, 0.26, 0.74, 0.04),  // middle outside
      7: z(0.260, 0.62, 0.30, 0.70, 0.03),  // low inside
      8: z(0.310, 0.68, 0.24, 0.76, 0.05),  // low middle
      9: z(0.220, 0.54, 0.38, 0.62, 0.02),  // low outside
      11: z(0.175, 0.36, 0.44, 0.56, 0.01),  // 하이볼
      12: z(0.155, 0.30, 0.50, 0.50, 0.01),  // 로우볼
      13: z(0.165, 0.33, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.145, 0.28, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.22 },
      SI: { ba: 0.250, whiffRate: 0.20 },
      FC: { ba: 0.230, whiffRate: 0.26 },
      CH: { ba: 0.205, whiffRate: 0.34 },
      SL: { ba: 0.210, whiffRate: 0.34 },
      ST: { ba: 0.190, whiffRate: 0.40 },
      CU: { ba: 0.188, whiffRate: 0.42 },
    },
  },

  harper: {
    id: 'harper',
    name: 'Bryce Harper',
    nameKo: '브라이스 하퍼',
    bats: 'L',
    team: 'USA',
    flavorText: '내셔널리그 MVP. 높은 존에 강하고 낮은 바깥쪽에 약하다. 체인지업과 낮은 슬라이더가 열쇠.',
    zones: {
      1: z(0.390, 0.80, 0.18, 0.82, 0.09),  // high inside
      2: z(0.450, 0.86, 0.13, 0.87, 0.13),  // high middle
      3: z(0.350, 0.74, 0.22, 0.78, 0.07),  // high outside
      4: z(0.430, 0.84, 0.12, 0.88, 0.11),  // middle inside
      5: z(0.480, 0.90, 0.09, 0.91, 0.15),  // dead center
      6: z(0.340, 0.72, 0.20, 0.80, 0.07),  // middle outside
      7: z(0.290, 0.66, 0.28, 0.72, 0.04),  // low inside
      8: z(0.350, 0.74, 0.22, 0.78, 0.06),  // low middle
      9: z(0.210, 0.52, 0.40, 0.60, 0.02),  // low outside
      11: z(0.205, 0.42, 0.38, 0.62, 0.02),  // 하이볼
      12: z(0.160, 0.32, 0.52, 0.48, 0.01),  // 로우볼
      13: z(0.175, 0.36, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.30, 0.54, 0.46, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.290, whiffRate: 0.20 },
      SI: { ba: 0.270, whiffRate: 0.18 },
      FC: { ba: 0.250, whiffRate: 0.26 },
      CH: { ba: 0.200, whiffRate: 0.36 },
      SL: { ba: 0.210, whiffRate: 0.34 },
      ST: { ba: 0.195, whiffRate: 0.38 },
      CU: { ba: 0.205, whiffRate: 0.36 },
    },
  },

  bregman: {
    id: 'bregman',
    name: 'Alex Bregman',
    nameKo: '알렉스 브레그먼',
    bats: 'R',
    team: 'USA',
    flavorText: '지능형 타자. 존 전체에 고른 타격. 높은 존과 바깥 체인지업으로 공략.',
    zones: {
      1: z(0.350, 0.74, 0.20, 0.80, 0.07),  // high inside
      2: z(0.410, 0.82, 0.14, 0.86, 0.10),  // high middle
      3: z(0.330, 0.72, 0.22, 0.78, 0.06),  // high outside
      4: z(0.390, 0.80, 0.13, 0.87, 0.09),  // middle inside
      5: z(0.450, 0.87, 0.10, 0.90, 0.12),  // dead center
      6: z(0.340, 0.74, 0.18, 0.82, 0.07),  // middle outside
      7: z(0.310, 0.68, 0.24, 0.76, 0.05),  // low inside
      8: z(0.360, 0.76, 0.18, 0.82, 0.07),  // low middle
      9: z(0.255, 0.60, 0.32, 0.68, 0.03),  // low outside
      11: z(0.190, 0.38, 0.42, 0.58, 0.01),  // 하이볼
      12: z(0.165, 0.33, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.170, 0.34, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.30, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.275, whiffRate: 0.18 },
      SI: { ba: 0.260, whiffRate: 0.16 },
      FC: { ba: 0.245, whiffRate: 0.24 },
      CH: { ba: 0.210, whiffRate: 0.30 },
      SL: { ba: 0.220, whiffRate: 0.28 },
      ST: { ba: 0.190, whiffRate: 0.36 },
      CU: { ba: 0.195, whiffRate: 0.34 },
    },
  },

  raleigh: {
    id: 'raleigh',
    name: 'Cal Raleigh',
    nameKo: '칼 랄리',
    bats: 'S',
    team: 'USA',
    flavorText: '파워 포수. 안쪽 존에 강하고 바깥 변화구에 약하다. 슬라이더와 커브가 효과적.',
    zones: {
      1: z(0.370, 0.78, 0.22, 0.78, 0.08),  // high inside
      2: z(0.400, 0.82, 0.16, 0.84, 0.10),  // high middle
      3: z(0.300, 0.66, 0.28, 0.72, 0.05),  // high outside
      4: z(0.410, 0.82, 0.14, 0.86, 0.11),  // middle inside
      5: z(0.440, 0.86, 0.12, 0.88, 0.12),  // dead center
      6: z(0.310, 0.68, 0.26, 0.74, 0.05),  // middle outside
      7: z(0.290, 0.64, 0.28, 0.72, 0.04),  // low inside
      8: z(0.330, 0.70, 0.24, 0.76, 0.06),  // low middle
      9: z(0.235, 0.56, 0.38, 0.62, 0.02),  // low outside
      11: z(0.195, 0.40, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.165, 0.32, 0.52, 0.48, 0.01),  // 로우볼
      13: z(0.175, 0.36, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.140, 0.28, 0.56, 0.44, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.270, whiffRate: 0.24 },
      SI: { ba: 0.255, whiffRate: 0.20 },
      FC: { ba: 0.235, whiffRate: 0.28 },
      CH: { ba: 0.215, whiffRate: 0.32 },
      SL: { ba: 0.200, whiffRate: 0.38 },
      ST: { ba: 0.210, whiffRate: 0.34 },
      CU: { ba: 0.185, whiffRate: 0.40 },
    },
  },

  turang: {
    id: 'turang',
    name: 'Brice Turang',
    nameKo: '브라이스 투랭',
    bats: 'L',
    team: 'USA',
    flavorText: '스피드 유격수. 컨택률이 높지만 파워는 적다. 낮은 변화구와 체인지업이 효과적.',
    zones: {
      1: z(0.300, 0.70, 0.22, 0.78, 0.02),  // high inside
      2: z(0.350, 0.76, 0.18, 0.82, 0.04),  // high middle
      3: z(0.290, 0.68, 0.22, 0.78, 0.02),  // high outside
      4: z(0.330, 0.74, 0.16, 0.84, 0.03),  // middle inside
      5: z(0.390, 0.80, 0.14, 0.86, 0.04),  // dead center
      6: z(0.305, 0.70, 0.18, 0.82, 0.02),  // middle outside
      7: z(0.270, 0.64, 0.24, 0.76, 0.01),  // low inside
      8: z(0.310, 0.70, 0.20, 0.80, 0.02),  // low middle
      9: z(0.230, 0.56, 0.32, 0.68, 0.01),  // low outside
      11: z(0.170, 0.34, 0.44, 0.56, 0.01),  // 하이볼
      12: z(0.150, 0.29, 0.50, 0.50, 0.01),  // 로우볼
      13: z(0.160, 0.31, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.140, 0.27, 0.52, 0.48, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.250, whiffRate: 0.18 },
      SI: { ba: 0.240, whiffRate: 0.16 },
      FC: { ba: 0.230, whiffRate: 0.22 },
      CH: { ba: 0.210, whiffRate: 0.30 },
      SL: { ba: 0.215, whiffRate: 0.28 },
      ST: { ba: 0.195, whiffRate: 0.36 },
      CU: { ba: 0.200, whiffRate: 0.34 },
    },
  },

  buxton: {
    id: 'buxton',
    name: 'Byron Buxton',
    nameKo: '바이런 벅스턴',
    bats: 'R',
    team: 'USA',
    flavorText: '5툴 플레이어. 빠른 공에 강하지만 변화구에 약하다. 스위퍼와 체인지업이 효과적.',
    zones: {
      1: z(0.350, 0.74, 0.24, 0.76, 0.07),  // high inside
      2: z(0.420, 0.82, 0.18, 0.82, 0.11),  // high middle
      3: z(0.310, 0.68, 0.28, 0.72, 0.05),  // high outside
      4: z(0.390, 0.80, 0.16, 0.84, 0.09),  // middle inside
      5: z(0.460, 0.88, 0.11, 0.89, 0.13),  // dead center
      6: z(0.320, 0.70, 0.24, 0.76, 0.06),  // middle outside
      7: z(0.275, 0.64, 0.30, 0.70, 0.04),  // low inside
      8: z(0.340, 0.72, 0.26, 0.74, 0.06),  // low middle
      9: z(0.200, 0.52, 0.42, 0.58, 0.02),  // low outside
      11: z(0.195, 0.40, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.160, 0.32, 0.52, 0.48, 0.01),  // 로우볼
      13: z(0.170, 0.34, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.30, 0.54, 0.46, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.285, whiffRate: 0.22 },
      SI: { ba: 0.265, whiffRate: 0.20 },
      FC: { ba: 0.245, whiffRate: 0.28 },
      CH: { ba: 0.195, whiffRate: 0.38 },
      SL: { ba: 0.210, whiffRate: 0.34 },
      ST: { ba: 0.185, whiffRate: 0.40 },
      CU: { ba: 0.200, whiffRate: 0.36 },
    },
  },
};
