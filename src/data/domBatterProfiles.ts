import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

export const DOM_BATTER_PROFILES: Record<string, BatterProfile> = {
  soto: {
    id: 'soto',
    name: 'Juan Soto',
    nameKo: '후안 소토',
    bats: 'L',
    team: 'Dominican Republic',
    flavorText: '역대급 선구안. 볼 존 밖에서는 거의 안 휘두른다. 스트라이크 존에 집중하라.',
    zones: {
      // Soto: elite eye, high wOBA in middle, patient on shadow zones
      1: z(0.310, 0.74, 0.20, 0.80, 0.06),  // high inside
      2: z(0.400, 0.80, 0.14, 0.86, 0.10),  // high middle
      3: z(0.360, 0.76, 0.18, 0.82, 0.08),  // high outside
      4: z(0.450, 0.86, 0.10, 0.90, 0.13),  // middle inside
      5: z(0.510, 0.90, 0.07, 0.93, 0.18),  // dead center - elite
      6: z(0.420, 0.82, 0.12, 0.88, 0.11),  // middle outside
      7: z(0.350, 0.72, 0.22, 0.78, 0.07),  // low inside
      8: z(0.390, 0.78, 0.16, 0.84, 0.09),  // low middle
      9: z(0.310, 0.68, 0.26, 0.74, 0.05),  // low outside
      // Shadow zones - elite patience, very low chase rate
      11: z(0.170, 0.22, 0.45, 0.55, 0.01), // 하이볼
      12: z(0.140, 0.18, 0.52, 0.48, 0.01), // 로우볼
      13: z(0.160, 0.20, 0.48, 0.52, 0.01), // 왼쪽 유인구
      14: z(0.150, 0.19, 0.50, 0.50, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.290, whiffRate: 0.18 },
      SI: { ba: 0.275, whiffRate: 0.16 },
      SL: { ba: 0.225, whiffRate: 0.32 },
      CU: { ba: 0.200, whiffRate: 0.36 },
      CH: { ba: 0.215, whiffRate: 0.30 },
      FC: { ba: 0.250, whiffRate: 0.22 },
      ST: { ba: 0.210, whiffRate: 0.34 },
      FS: { ba: 0.205, whiffRate: 0.33 },
    },
  },

  tatis: {
    id: 'tatis',
    name: 'Fernando Tatis Jr.',
    nameKo: '페르난도 타티스 주니어',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '빠른 공에 강하고 공격적인 스타일. 변화구와 유인구로 흔들어야.',
    zones: {
      // Tatis: athletic, aggressive, pull power (zones 4,7 for RHB = left side hot)
      1: z(0.320, 0.78, 0.24, 0.76, 0.07),  // high inside
      2: z(0.390, 0.82, 0.18, 0.82, 0.10),  // high middle
      3: z(0.270, 0.68, 0.28, 0.72, 0.04),  // high outside - weaker away
      4: z(0.430, 0.84, 0.14, 0.86, 0.13),  // middle inside - pull power
      5: z(0.470, 0.88, 0.10, 0.90, 0.15),  // dead center
      6: z(0.310, 0.72, 0.24, 0.76, 0.06),  // middle outside
      7: z(0.380, 0.80, 0.18, 0.82, 0.11),  // low inside - pull power
      8: z(0.340, 0.74, 0.22, 0.78, 0.07),  // low middle
      9: z(0.240, 0.60, 0.34, 0.66, 0.03),  // low outside - weakness
      // Shadow zones - aggressive, higher chase rate
      11: z(0.210, 0.44, 0.40, 0.60, 0.03), // 하이볼
      12: z(0.180, 0.38, 0.46, 0.54, 0.02), // 로우볼
      13: z(0.200, 0.42, 0.42, 0.58, 0.02), // 왼쪽 유인구
      14: z(0.180, 0.40, 0.44, 0.56, 0.02), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.22 },
      SI: { ba: 0.265, whiffRate: 0.20 },
      SL: { ba: 0.220, whiffRate: 0.36 },
      CU: { ba: 0.210, whiffRate: 0.38 },
      CH: { ba: 0.225, whiffRate: 0.34 },
      FC: { ba: 0.245, whiffRate: 0.26 },
      ST: { ba: 0.215, whiffRate: 0.37 },
      FS: { ba: 0.210, whiffRate: 0.36 },
    },
  },

  guerrero: {
    id: 'guerrero',
    name: 'Vladimir Guerrero Jr.',
    nameKo: '블라디미르 게레로 주니어',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '존 안에서 컨택 장인. 코너를 공략하라. 중간 존은 금물.',
    zones: {
      // Guerrero: elite contact, patient, spray hitter, high wOBA across zones
      1: z(0.340, 0.80, 0.14, 0.86, 0.06),  // high inside
      2: z(0.420, 0.86, 0.08, 0.92, 0.10),  // high middle
      3: z(0.380, 0.82, 0.11, 0.89, 0.08),  // high outside
      4: z(0.450, 0.88, 0.07, 0.93, 0.12),  // middle inside
      5: z(0.490, 0.90, 0.05, 0.95, 0.14),  // dead center - elite contact
      6: z(0.420, 0.85, 0.09, 0.91, 0.10),  // middle outside
      7: z(0.360, 0.78, 0.15, 0.85, 0.07),  // low inside
      8: z(0.390, 0.82, 0.12, 0.88, 0.08),  // low middle
      9: z(0.310, 0.70, 0.22, 0.78, 0.05),  // low outside
      // Patient hitter - low chase rates
      11: z(0.180, 0.28, 0.38, 0.62, 0.01), // 하이볼
      12: z(0.150, 0.24, 0.45, 0.55, 0.01), // 로우볼
      13: z(0.170, 0.26, 0.42, 0.58, 0.01), // 왼쪽 유인구
      14: z(0.160, 0.25, 0.44, 0.56, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.305, whiffRate: 0.14 },
      SI: { ba: 0.290, whiffRate: 0.13 },
      SL: { ba: 0.240, whiffRate: 0.26 },
      CU: { ba: 0.220, whiffRate: 0.30 },
      CH: { ba: 0.235, whiffRate: 0.27 },
      FC: { ba: 0.265, whiffRate: 0.18 },
      ST: { ba: 0.225, whiffRate: 0.29 },
      FS: { ba: 0.215, whiffRate: 0.32 },
    },
  },

  machado: {
    id: 'machado',
    name: 'Manny Machado',
    nameKo: '매니 마차도',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '밸런스형 타자. 존 전체를 균일하게 공략. 약점이 없다.',
    zones: {
      // Machado: balanced, good contact, solid power across zones
      1: z(0.320, 0.76, 0.20, 0.80, 0.07),  // high inside
      2: z(0.390, 0.82, 0.15, 0.85, 0.10),  // high middle
      3: z(0.340, 0.74, 0.20, 0.80, 0.07),  // high outside
      4: z(0.420, 0.84, 0.12, 0.88, 0.12),  // middle inside
      5: z(0.460, 0.87, 0.09, 0.91, 0.14),  // dead center
      6: z(0.380, 0.78, 0.16, 0.84, 0.09),  // middle outside
      7: z(0.340, 0.74, 0.20, 0.80, 0.07),  // low inside
      8: z(0.360, 0.76, 0.18, 0.82, 0.08),  // low middle
      9: z(0.290, 0.66, 0.28, 0.72, 0.04),  // low outside
      11: z(0.200, 0.38, 0.40, 0.60, 0.02), // 하이볼
      12: z(0.170, 0.32, 0.48, 0.52, 0.01), // 로우볼
      13: z(0.190, 0.36, 0.44, 0.56, 0.02), // 왼쪽 유인구
      14: z(0.175, 0.34, 0.46, 0.54, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.290, whiffRate: 0.20 },
      SI: { ba: 0.275, whiffRate: 0.18 },
      SL: { ba: 0.235, whiffRate: 0.30 },
      CU: { ba: 0.215, whiffRate: 0.33 },
      CH: { ba: 0.225, whiffRate: 0.31 },
      FC: { ba: 0.255, whiffRate: 0.23 },
      ST: { ba: 0.220, whiffRate: 0.32 },
      FS: { ba: 0.210, whiffRate: 0.34 },
    },
  },

  caminero: {
    id: 'caminero',
    name: 'Junior Caminero',
    nameKo: '주니어 카미네로',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '파워는 최강이지만 삼진도 최다. 변화구로 흔들어라. 바깥쪽 낮은 공이 약점.',
    zones: {
      // Caminero: raw power king, high strikeout, big holes outside/low
      1: z(0.290, 0.76, 0.30, 0.70, 0.08),  // high inside
      2: z(0.380, 0.82, 0.22, 0.78, 0.14),  // high middle
      3: z(0.250, 0.66, 0.36, 0.64, 0.05),  // high outside - weakness
      4: z(0.450, 0.86, 0.16, 0.84, 0.18),  // middle inside - pull power zone
      5: z(0.490, 0.88, 0.14, 0.86, 0.20),  // dead center - max power
      6: z(0.290, 0.68, 0.32, 0.68, 0.06),  // middle outside - weakness
      7: z(0.380, 0.80, 0.20, 0.80, 0.14),  // low inside
      8: z(0.340, 0.74, 0.26, 0.74, 0.10),  // low middle
      9: z(0.210, 0.56, 0.44, 0.56, 0.03),  // low outside - big weakness
      // Aggressive chaser
      11: z(0.220, 0.48, 0.44, 0.56, 0.03), // 하이볼
      12: z(0.180, 0.40, 0.52, 0.48, 0.02), // 로우볼
      13: z(0.200, 0.44, 0.48, 0.52, 0.02), // 왼쪽 유인구
      14: z(0.175, 0.42, 0.50, 0.50, 0.02), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.270, whiffRate: 0.28 },
      SI: { ba: 0.255, whiffRate: 0.26 },
      SL: { ba: 0.200, whiffRate: 0.42 },
      CU: { ba: 0.185, whiffRate: 0.46 },
      CH: { ba: 0.195, whiffRate: 0.44 },
      FC: { ba: 0.230, whiffRate: 0.32 },
      ST: { ba: 0.190, whiffRate: 0.45 },
      FS: { ba: 0.180, whiffRate: 0.48 },
    },
  },

  jrod: {
    id: 'jrod',
    name: 'Julio Rodriguez',
    nameKo: '훌리오 로드리게스',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '플러스 스피드에 공격적 타격. 풀 히터 성향. 바깥쪽에 약하다.',
    zones: {
      // Julio: aggressive, pull-heavy, struggles away
      1: z(0.310, 0.78, 0.24, 0.76, 0.08),  // high inside
      2: z(0.380, 0.82, 0.18, 0.82, 0.11),  // high middle
      3: z(0.260, 0.64, 0.30, 0.70, 0.04),  // high outside - weaker
      4: z(0.420, 0.84, 0.15, 0.85, 0.14),  // middle inside - pull power
      5: z(0.460, 0.87, 0.11, 0.89, 0.16),  // dead center
      6: z(0.280, 0.66, 0.28, 0.72, 0.05),  // middle outside - weakness
      7: z(0.370, 0.78, 0.20, 0.80, 0.11),  // low inside
      8: z(0.330, 0.72, 0.24, 0.76, 0.08),  // low middle
      9: z(0.220, 0.56, 0.38, 0.62, 0.03),  // low outside - weakness
      // Aggressive chaser
      11: z(0.215, 0.46, 0.42, 0.58, 0.03), // 하이볼
      12: z(0.180, 0.38, 0.48, 0.52, 0.02), // 로우볼
      13: z(0.195, 0.42, 0.44, 0.56, 0.02), // 왼쪽 유인구
      14: z(0.185, 0.40, 0.46, 0.54, 0.02), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.22 },
      SI: { ba: 0.268, whiffRate: 0.20 },
      SL: { ba: 0.215, whiffRate: 0.36 },
      CU: { ba: 0.200, whiffRate: 0.40 },
      CH: { ba: 0.210, whiffRate: 0.38 },
      FC: { ba: 0.242, whiffRate: 0.26 },
      ST: { ba: 0.205, whiffRate: 0.39 },
      FS: { ba: 0.198, whiffRate: 0.40 },
    },
  },

  marte: {
    id: 'marte',
    name: 'Ketel Marte',
    nameKo: '케텔 마르테',
    bats: 'S',
    team: 'Dominican Republic',
    flavorText: '스위치 히터. 인내심 있고 배트 컨트롤 우수. 전 존에 고르게 위협.',
    zones: {
      // Marte: switch hitter, patient, good bat control
      1: z(0.330, 0.78, 0.16, 0.84, 0.07),  // high inside
      2: z(0.400, 0.84, 0.11, 0.89, 0.11),  // high middle
      3: z(0.360, 0.80, 0.14, 0.86, 0.08),  // high outside
      4: z(0.430, 0.86, 0.09, 0.91, 0.13),  // middle inside
      5: z(0.470, 0.88, 0.07, 0.93, 0.15),  // dead center
      6: z(0.400, 0.83, 0.11, 0.89, 0.10),  // middle outside
      7: z(0.360, 0.76, 0.18, 0.82, 0.08),  // low inside
      8: z(0.380, 0.80, 0.14, 0.86, 0.09),  // low middle
      9: z(0.320, 0.70, 0.24, 0.76, 0.06),  // low outside
      // Patient, lower chase rates
      11: z(0.190, 0.32, 0.38, 0.62, 0.02), // 하이볼
      12: z(0.160, 0.28, 0.46, 0.54, 0.01), // 로우볼
      13: z(0.175, 0.30, 0.42, 0.58, 0.01), // 왼쪽 유인구
      14: z(0.165, 0.29, 0.44, 0.56, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.295, whiffRate: 0.16 },
      SI: { ba: 0.280, whiffRate: 0.15 },
      SL: { ba: 0.240, whiffRate: 0.28 },
      CU: { ba: 0.220, whiffRate: 0.32 },
      CH: { ba: 0.230, whiffRate: 0.30 },
      FC: { ba: 0.260, whiffRate: 0.21 },
      ST: { ba: 0.225, whiffRate: 0.31 },
      FS: { ba: 0.215, whiffRate: 0.33 },
    },
  },

  pena: {
    id: 'pena',
    name: 'Jeremy Pena',
    nameKo: '제레미 페냐',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '컨택 우선. 라인드라이브 타자. 가끔 장타도 있다.',
    zones: {
      // Pena: contact-first, line drives, occasional pop
      1: z(0.320, 0.78, 0.18, 0.82, 0.05),  // high inside
      2: z(0.380, 0.82, 0.14, 0.86, 0.07),  // high middle
      3: z(0.350, 0.76, 0.16, 0.84, 0.06),  // high outside
      4: z(0.400, 0.84, 0.12, 0.88, 0.08),  // middle inside
      5: z(0.430, 0.86, 0.10, 0.90, 0.09),  // dead center
      6: z(0.380, 0.80, 0.14, 0.86, 0.07),  // middle outside
      7: z(0.340, 0.74, 0.20, 0.80, 0.05),  // low inside
      8: z(0.360, 0.78, 0.17, 0.83, 0.06),  // low middle
      9: z(0.300, 0.68, 0.26, 0.74, 0.03),  // low outside
      11: z(0.195, 0.36, 0.40, 0.60, 0.02), // 하이볼
      12: z(0.165, 0.30, 0.48, 0.52, 0.01), // 로우볼
      13: z(0.180, 0.34, 0.44, 0.56, 0.01), // 왼쪽 유인구
      14: z(0.170, 0.32, 0.46, 0.54, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.310, whiffRate: 0.16 },
      SI: { ba: 0.295, whiffRate: 0.14 },
      SL: { ba: 0.250, whiffRate: 0.28 },
      CU: { ba: 0.230, whiffRate: 0.32 },
      CH: { ba: 0.240, whiffRate: 0.29 },
      FC: { ba: 0.270, whiffRate: 0.20 },
      ST: { ba: 0.235, whiffRate: 0.31 },
      FS: { ba: 0.225, whiffRate: 0.33 },
    },
  },

  wells: {
    id: 'wells',
    name: 'Austin Wells',
    nameKo: '오스틴 웰스',
    bats: 'L',
    team: 'Dominican Republic',
    flavorText: '원시적인 파워. 컨택은 나쁘고 헛스윙이 많다. 변화구는 천적.',
    zones: {
      // Wells: raw power, poor contact, big swing-and-miss
      1: z(0.270, 0.72, 0.34, 0.66, 0.08),  // high inside
      2: z(0.350, 0.78, 0.26, 0.74, 0.13),  // high middle
      3: z(0.220, 0.60, 0.40, 0.60, 0.04),  // high outside - weakness
      4: z(0.400, 0.82, 0.22, 0.78, 0.16),  // middle inside
      5: z(0.450, 0.85, 0.18, 0.82, 0.18),  // dead center - power zone
      6: z(0.250, 0.62, 0.38, 0.62, 0.05),  // middle outside - weakness
      7: z(0.320, 0.74, 0.30, 0.70, 0.10),  // low inside
      8: z(0.300, 0.70, 0.32, 0.68, 0.09),  // low middle
      9: z(0.190, 0.54, 0.46, 0.54, 0.03),  // low outside - big weakness
      // Aggressive chaser
      11: z(0.210, 0.46, 0.48, 0.52, 0.03), // 하이볼
      12: z(0.175, 0.40, 0.56, 0.44, 0.02), // 로우볼
      13: z(0.200, 0.44, 0.52, 0.48, 0.02), // 왼쪽 유인구
      14: z(0.185, 0.42, 0.54, 0.46, 0.02), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.240, whiffRate: 0.30 },
      SI: { ba: 0.225, whiffRate: 0.28 },
      SL: { ba: 0.185, whiffRate: 0.46 },
      CU: { ba: 0.170, whiffRate: 0.50 },
      CH: { ba: 0.180, whiffRate: 0.48 },
      FC: { ba: 0.210, whiffRate: 0.35 },
      ST: { ba: 0.175, whiffRate: 0.49 },
      FS: { ba: 0.165, whiffRate: 0.52 },
    },
  },

  perdomo: {
    id: 'perdomo',
    name: 'Geraldo Perdomo',
    nameKo: '헤랄도 페르도모',
    bats: 'S',
    team: 'Dominican Republic',
    flavorText: '최고 수준의 선구안. 볼넷을 많이 골라낸다. 스피드 위협도 있다.',
    zones: {
      // Perdomo: elite eye, walks, speed threat, patient
      1: z(0.310, 0.74, 0.18, 0.82, 0.05),  // high inside
      2: z(0.380, 0.80, 0.13, 0.87, 0.08),  // high middle
      3: z(0.350, 0.76, 0.15, 0.85, 0.06),  // high outside
      4: z(0.410, 0.83, 0.11, 0.89, 0.09),  // middle inside
      5: z(0.450, 0.86, 0.09, 0.91, 0.11),  // dead center
      6: z(0.380, 0.80, 0.13, 0.87, 0.08),  // middle outside
      7: z(0.330, 0.72, 0.20, 0.80, 0.05),  // low inside
      8: z(0.360, 0.76, 0.16, 0.84, 0.07),  // low middle
      9: z(0.290, 0.66, 0.26, 0.74, 0.04),  // low outside
      // Very patient - very low chase rates
      11: z(0.175, 0.20, 0.40, 0.60, 0.01), // 하이볼
      12: z(0.145, 0.16, 0.48, 0.52, 0.01), // 로우볼
      13: z(0.160, 0.18, 0.44, 0.56, 0.01), // 왼쪽 유인구
      14: z(0.150, 0.17, 0.46, 0.54, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.295, whiffRate: 0.15 },
      SI: { ba: 0.282, whiffRate: 0.14 },
      SL: { ba: 0.245, whiffRate: 0.27 },
      CU: { ba: 0.225, whiffRate: 0.31 },
      CH: { ba: 0.235, whiffRate: 0.29 },
      FC: { ba: 0.262, whiffRate: 0.20 },
      ST: { ba: 0.230, whiffRate: 0.30 },
      FS: { ba: 0.220, whiffRate: 0.32 },
    },
  },

  cruz: {
    id: 'cruz',
    name: 'Oneil Cruz',
    nameKo: '오닐 크루즈',
    bats: 'L',
    team: 'Dominican Republic',
    flavorText: '극단적인 헛스윙. 스피드와 원시 파워는 있으나 컨택이 매우 약하다.',
    zones: {
      // Cruz: extreme swing-and-miss, speed, raw power but very poor contact
      1: z(0.250, 0.72, 0.36, 0.64, 0.07),  // high inside
      2: z(0.330, 0.78, 0.28, 0.72, 0.12),  // high middle
      3: z(0.210, 0.60, 0.44, 0.56, 0.04),  // high outside
      4: z(0.380, 0.80, 0.24, 0.76, 0.14),  // middle inside
      5: z(0.420, 0.84, 0.20, 0.80, 0.16),  // dead center
      6: z(0.240, 0.62, 0.40, 0.60, 0.05),  // middle outside
      7: z(0.300, 0.72, 0.32, 0.68, 0.10),  // low inside
      8: z(0.280, 0.68, 0.36, 0.64, 0.09),  // low middle
      9: z(0.180, 0.52, 0.50, 0.50, 0.03),  // low outside - extreme weakness
      // Very aggressive chaser
      11: z(0.200, 0.48, 0.52, 0.48, 0.03), // 하이볼
      12: z(0.165, 0.42, 0.60, 0.40, 0.02), // 로우볼
      13: z(0.185, 0.46, 0.56, 0.44, 0.02), // 왼쪽 유인구
      14: z(0.170, 0.44, 0.58, 0.42, 0.02), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.225, whiffRate: 0.34 },
      SI: { ba: 0.210, whiffRate: 0.32 },
      SL: { ba: 0.170, whiffRate: 0.50 },
      CU: { ba: 0.155, whiffRate: 0.54 },
      CH: { ba: 0.165, whiffRate: 0.52 },
      FC: { ba: 0.195, whiffRate: 0.40 },
      ST: { ba: 0.160, whiffRate: 0.53 },
      FS: { ba: 0.150, whiffRate: 0.56 },
    },
  },

  ramirez: {
    id: 'ramirez',
    name: 'Agustin Ramirez',
    nameKo: '아구스틴 라미레스',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '성장 중인 파워 히터. 컨택 평균 이하. 구종에 흔들리기 쉽다.',
    zones: {
      // Ramirez: developing power, below-avg contact
      1: z(0.270, 0.72, 0.28, 0.72, 0.07),  // high inside
      2: z(0.340, 0.76, 0.22, 0.78, 0.10),  // high middle
      3: z(0.230, 0.62, 0.34, 0.66, 0.04),  // high outside
      4: z(0.380, 0.78, 0.18, 0.82, 0.12),  // middle inside
      5: z(0.420, 0.82, 0.15, 0.85, 0.14),  // dead center
      6: z(0.260, 0.64, 0.30, 0.70, 0.05),  // middle outside
      7: z(0.310, 0.70, 0.26, 0.74, 0.08),  // low inside
      8: z(0.290, 0.68, 0.28, 0.72, 0.07),  // low middle
      9: z(0.200, 0.54, 0.42, 0.58, 0.03),  // low outside
      11: z(0.205, 0.44, 0.46, 0.54, 0.02), // 하이볼
      12: z(0.172, 0.38, 0.52, 0.48, 0.02), // 로우볼
      13: z(0.190, 0.42, 0.48, 0.52, 0.02), // 왼쪽 유인구
      14: z(0.178, 0.40, 0.50, 0.50, 0.02), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.252, whiffRate: 0.26 },
      SI: { ba: 0.238, whiffRate: 0.24 },
      SL: { ba: 0.198, whiffRate: 0.40 },
      CU: { ba: 0.182, whiffRate: 0.44 },
      CH: { ba: 0.192, whiffRate: 0.42 },
      FC: { ba: 0.222, whiffRate: 0.30 },
      ST: { ba: 0.185, whiffRate: 0.43 },
      FS: { ba: 0.175, whiffRate: 0.46 },
    },
  },

  rosario: {
    id: 'rosario',
    name: 'Amed Rosario',
    nameKo: '아메드 로사리오',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '자유로운 스윙어. 컨택은 있지만 볼넷이 적다. 적극적으로 유인구를 노려라.',
    zones: {
      // Rosario: free swinger, contact, low walks
      1: z(0.310, 0.80, 0.22, 0.78, 0.05),  // high inside
      2: z(0.370, 0.84, 0.16, 0.84, 0.08),  // high middle
      3: z(0.320, 0.76, 0.22, 0.78, 0.05),  // high outside
      4: z(0.390, 0.84, 0.14, 0.86, 0.09),  // middle inside
      5: z(0.420, 0.86, 0.12, 0.88, 0.10),  // dead center
      6: z(0.350, 0.78, 0.18, 0.82, 0.06),  // middle outside
      7: z(0.300, 0.72, 0.26, 0.74, 0.04),  // low inside
      8: z(0.320, 0.74, 0.22, 0.78, 0.05),  // low middle
      9: z(0.270, 0.66, 0.30, 0.70, 0.03),  // low outside
      // Free swinger - higher chase rates
      11: z(0.215, 0.48, 0.38, 0.62, 0.02), // 하이볼
      12: z(0.180, 0.42, 0.44, 0.56, 0.01), // 로우볼
      13: z(0.200, 0.46, 0.40, 0.60, 0.02), // 왼쪽 유인구
      14: z(0.185, 0.44, 0.42, 0.58, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.288, whiffRate: 0.20 },
      SI: { ba: 0.275, whiffRate: 0.18 },
      SL: { ba: 0.230, whiffRate: 0.32 },
      CU: { ba: 0.210, whiffRate: 0.36 },
      CH: { ba: 0.220, whiffRate: 0.34 },
      FC: { ba: 0.252, whiffRate: 0.24 },
      ST: { ba: 0.215, whiffRate: 0.35 },
      FS: { ba: 0.205, whiffRate: 0.37 },
    },
  },

  santana: {
    id: 'santana',
    name: 'Carlos Santana',
    nameKo: '카를로스 산타나',
    bats: 'S',
    team: 'Dominican Republic',
    flavorText: '인내심 있는 베테랑. 파워는 줄었지만 볼넷을 잘 고른다.',
    zones: {
      // Santana: patient veteran, declining power, good eye
      1: z(0.260, 0.68, 0.22, 0.78, 0.03),  // high inside
      2: z(0.320, 0.74, 0.18, 0.82, 0.05),  // high middle
      3: z(0.290, 0.70, 0.20, 0.80, 0.04),  // high outside
      4: z(0.350, 0.76, 0.16, 0.84, 0.06),  // middle inside
      5: z(0.380, 0.80, 0.14, 0.86, 0.07),  // dead center
      6: z(0.330, 0.72, 0.18, 0.82, 0.05),  // middle outside
      7: z(0.290, 0.66, 0.24, 0.76, 0.03),  // low inside
      8: z(0.310, 0.70, 0.20, 0.80, 0.04),  // low middle
      9: z(0.260, 0.60, 0.28, 0.72, 0.02),  // low outside
      // Patient - low chase rates
      11: z(0.175, 0.26, 0.40, 0.60, 0.01), // 하이볼
      12: z(0.145, 0.22, 0.48, 0.52, 0.01), // 로우볼
      13: z(0.162, 0.24, 0.44, 0.56, 0.01), // 왼쪽 유인구
      14: z(0.152, 0.23, 0.46, 0.54, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.235, whiffRate: 0.20 },
      SI: { ba: 0.222, whiffRate: 0.18 },
      SL: { ba: 0.195, whiffRate: 0.34 },
      CU: { ba: 0.178, whiffRate: 0.38 },
      CH: { ba: 0.185, whiffRate: 0.36 },
      FC: { ba: 0.210, whiffRate: 0.26 },
      ST: { ba: 0.180, whiffRate: 0.37 },
      FS: { ba: 0.172, whiffRate: 0.40 },
    },
  },

  lake: {
    id: 'lake',
    name: 'Junior Lake',
    nameKo: '주니어 레이크',
    bats: 'R',
    team: 'Dominican Republic',
    flavorText: '공격적인 자유 스윙어. 유인구를 적극 활용하면 쉽게 잡을 수 있다.',
    zones: {
      // Lake: aggressive free swinger
      1: z(0.280, 0.78, 0.28, 0.72, 0.05),  // high inside
      2: z(0.340, 0.82, 0.22, 0.78, 0.08),  // high middle
      3: z(0.260, 0.70, 0.30, 0.70, 0.04),  // high outside
      4: z(0.360, 0.80, 0.20, 0.80, 0.09),  // middle inside
      5: z(0.400, 0.83, 0.17, 0.83, 0.10),  // dead center
      6: z(0.290, 0.70, 0.28, 0.72, 0.05),  // middle outside
      7: z(0.300, 0.72, 0.26, 0.74, 0.06),  // low inside
      8: z(0.310, 0.74, 0.24, 0.76, 0.06),  // low middle
      9: z(0.240, 0.62, 0.36, 0.64, 0.03),  // low outside
      // Very aggressive chaser
      11: z(0.220, 0.52, 0.42, 0.58, 0.02), // 하이볼
      12: z(0.185, 0.46, 0.48, 0.52, 0.02), // 로우볼
      13: z(0.205, 0.50, 0.44, 0.56, 0.02), // 왼쪽 유인구
      14: z(0.190, 0.48, 0.46, 0.54, 0.01), // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.26 },
      SI: { ba: 0.252, whiffRate: 0.24 },
      SL: { ba: 0.210, whiffRate: 0.40 },
      CU: { ba: 0.195, whiffRate: 0.44 },
      CH: { ba: 0.205, whiffRate: 0.42 },
      FC: { ba: 0.235, whiffRate: 0.30 },
      ST: { ba: 0.200, whiffRate: 0.43 },
      FS: { ba: 0.190, whiffRate: 0.45 },
    },
  },
};
