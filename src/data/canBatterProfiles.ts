import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

export const CAN_BATTER_PROFILES: Record<string, BatterProfile> = {
  julien: {
    id: 'julien',
    name: 'Edouard Julien',
    nameKo: '에두아르 줄리앙',
    bats: 'L',
    team: 'Canada',
    flavorText: '트윈스 2루수. 선구안이 뛰어난 좌타자. 높은 패스트볼과 낮은 변화구에 취약.',
    zones: {
      1: z(0.290, 0.66, 0.28, 0.72, 0.04),  // high inside - weak on high FB
      2: z(0.370, 0.76, 0.20, 0.80, 0.07),  // high middle
      3: z(0.280, 0.64, 0.30, 0.70, 0.03),  // high outside
      4: z(0.380, 0.80, 0.14, 0.86, 0.08),  // middle inside
      5: z(0.420, 0.86, 0.11, 0.89, 0.10),  // dead center
      6: z(0.340, 0.74, 0.18, 0.82, 0.06),  // middle outside
      7: z(0.310, 0.70, 0.22, 0.78, 0.05),  // low inside
      8: z(0.350, 0.74, 0.18, 0.82, 0.06),  // low middle
      9: z(0.240, 0.58, 0.34, 0.66, 0.02),  // low outside
      11: z(0.200, 0.42, 0.40, 0.60, 0.02),  // 하이볼
      12: z(0.170, 0.34, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.180, 0.36, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.160, 0.32, 0.50, 0.50, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.275, whiffRate: 0.20 },
      SI: { ba: 0.260, whiffRate: 0.17 },
      FC: { ba: 0.240, whiffRate: 0.24 },
      CH: { ba: 0.215, whiffRate: 0.32 },
      SL: { ba: 0.210, whiffRate: 0.34 },
      ST: { ba: 0.195, whiffRate: 0.38 },
      CU: { ba: 0.190, whiffRate: 0.40 },
    },
  },

  j_naylor: {
    id: 'j_naylor',
    name: 'Josh Naylor',
    nameKo: '조시 네일러',
    bats: 'L',
    team: 'Canada',
    flavorText: '가디언스 1루수. 당겨치기 파워가 강하다. 바깥쪽 슬라이더에 취약.',
    zones: {
      1: z(0.380, 0.80, 0.18, 0.82, 0.09),  // high inside - pull-side power
      2: z(0.430, 0.84, 0.14, 0.86, 0.12),  // high middle
      3: z(0.290, 0.66, 0.28, 0.72, 0.04),  // high outside - weak away
      4: z(0.420, 0.84, 0.12, 0.88, 0.11),  // middle inside
      5: z(0.460, 0.88, 0.10, 0.90, 0.13),  // dead center
      6: z(0.300, 0.66, 0.26, 0.74, 0.05),  // middle outside
      7: z(0.340, 0.72, 0.20, 0.80, 0.07),  // low inside
      8: z(0.360, 0.74, 0.18, 0.82, 0.07),  // low middle
      9: z(0.220, 0.56, 0.38, 0.62, 0.02),  // low outside - weak
      11: z(0.195, 0.40, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.165, 0.32, 0.50, 0.50, 0.01),  // 로우볼
      13: z(0.178, 0.36, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.29, 0.54, 0.46, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.285, whiffRate: 0.19 },
      SI: { ba: 0.275, whiffRate: 0.17 },
      FC: { ba: 0.250, whiffRate: 0.24 },
      CH: { ba: 0.225, whiffRate: 0.30 },
      SL: { ba: 0.195, whiffRate: 0.36 },
      ST: { ba: 0.185, whiffRate: 0.40 },
      CU: { ba: 0.200, whiffRate: 0.36 },
    },
  },

  oneill: {
    id: 'oneill',
    name: "Tyler O'Neill",
    nameKo: '타일러 오닐',
    bats: 'R',
    team: 'Canada',
    flavorText: '레드삭스 외야수. 폭발적인 파워. 삼진이 많고 낮은 바깥쪽 변화구에 극도로 취약.',
    zones: {
      1: z(0.360, 0.76, 0.24, 0.76, 0.09),  // high inside
      2: z(0.440, 0.86, 0.16, 0.84, 0.14),  // high middle
      3: z(0.300, 0.68, 0.30, 0.70, 0.06),  // high outside
      4: z(0.410, 0.84, 0.14, 0.86, 0.12),  // middle inside
      5: z(0.490, 0.90, 0.10, 0.90, 0.16),  // dead center - elite power
      6: z(0.290, 0.66, 0.30, 0.70, 0.05),  // middle outside
      7: z(0.280, 0.64, 0.32, 0.68, 0.04),  // low inside
      8: z(0.330, 0.70, 0.26, 0.74, 0.06),  // low middle
      9: z(0.195, 0.52, 0.44, 0.56, 0.02),  // low outside - very weak
      11: z(0.210, 0.44, 0.40, 0.60, 0.02),  // 하이볼
      12: z(0.155, 0.30, 0.58, 0.42, 0.01),  // 로우볼
      13: z(0.175, 0.36, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.145, 0.28, 0.56, 0.44, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.280, whiffRate: 0.24 },
      SI: { ba: 0.260, whiffRate: 0.21 },
      FC: { ba: 0.235, whiffRate: 0.28 },
      CH: { ba: 0.195, whiffRate: 0.38 },
      SL: { ba: 0.200, whiffRate: 0.38 },
      ST: { ba: 0.180, whiffRate: 0.44 },
      CU: { ba: 0.185, whiffRate: 0.42 },
    },
  },

  black: {
    id: 'black',
    name: 'Tyler Black',
    nameKo: '타일러 블랙',
    bats: 'L',
    team: 'Canada',
    flavorText: '브루어스 내야수. 젊은 선수로 컨택 위주 타격. 파워는 부족하나 선구안이 좋다.',
    zones: {
      1: z(0.290, 0.68, 0.26, 0.74, 0.03),  // high inside
      2: z(0.350, 0.76, 0.20, 0.80, 0.05),  // high middle
      3: z(0.275, 0.66, 0.26, 0.74, 0.03),  // high outside
      4: z(0.350, 0.76, 0.16, 0.84, 0.05),  // middle inside
      5: z(0.390, 0.82, 0.13, 0.87, 0.07),  // dead center
      6: z(0.320, 0.72, 0.18, 0.82, 0.04),  // middle outside
      7: z(0.285, 0.66, 0.22, 0.78, 0.03),  // low inside
      8: z(0.310, 0.70, 0.20, 0.80, 0.04),  // low middle
      9: z(0.240, 0.58, 0.30, 0.70, 0.02),  // low outside
      11: z(0.175, 0.36, 0.42, 0.58, 0.01),  // 하이볼
      12: z(0.158, 0.31, 0.46, 0.54, 0.01),  // 로우볼
      13: z(0.168, 0.33, 0.44, 0.56, 0.01),  // 왼쪽 유인구
      14: z(0.150, 0.29, 0.48, 0.52, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.20 },
      SI: { ba: 0.255, whiffRate: 0.18 },
      FC: { ba: 0.240, whiffRate: 0.24 },
      CH: { ba: 0.220, whiffRate: 0.30 },
      SL: { ba: 0.215, whiffRate: 0.32 },
      ST: { ba: 0.200, whiffRate: 0.36 },
      CU: { ba: 0.195, whiffRate: 0.38 },
    },
  },

  lopez: {
    id: 'lopez',
    name: 'Otto Lopez',
    nameKo: '오토 로페즈',
    bats: 'R',
    team: 'Canada',
    flavorText: '가디언스 내야수. 뛰어난 배트 컨트롤. 파워는 낮지만 빠른 볼에 취약.',
    zones: {
      1: z(0.290, 0.70, 0.22, 0.78, 0.02),  // high inside
      2: z(0.340, 0.76, 0.18, 0.82, 0.03),  // high middle
      3: z(0.300, 0.72, 0.20, 0.80, 0.02),  // high outside
      4: z(0.330, 0.74, 0.16, 0.84, 0.03),  // middle inside
      5: z(0.370, 0.80, 0.13, 0.87, 0.04),  // dead center
      6: z(0.315, 0.72, 0.18, 0.82, 0.02),  // middle outside
      7: z(0.280, 0.66, 0.22, 0.78, 0.02),  // low inside
      8: z(0.310, 0.70, 0.20, 0.80, 0.02),  // low middle
      9: z(0.255, 0.62, 0.28, 0.72, 0.01),  // low outside
      11: z(0.170, 0.35, 0.40, 0.60, 0.01),  // 하이볼
      12: z(0.155, 0.30, 0.44, 0.56, 0.01),  // 로우볼
      13: z(0.162, 0.32, 0.42, 0.58, 0.01),  // 왼쪽 유인구
      14: z(0.148, 0.28, 0.46, 0.54, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.250, whiffRate: 0.22 },
      SI: { ba: 0.260, whiffRate: 0.18 },
      FC: { ba: 0.245, whiffRate: 0.22 },
      CH: { ba: 0.230, whiffRate: 0.28 },
      SL: { ba: 0.225, whiffRate: 0.28 },
      ST: { ba: 0.210, whiffRate: 0.32 },
      CU: { ba: 0.215, whiffRate: 0.32 },
    },
  },

  toro: {
    id: 'toro',
    name: 'Abraham Toro',
    nameKo: '아브라함 토로',
    bats: 'S',
    team: 'Canada',
    flavorText: "어슬레틱스 내야수. 스위치 히터. 평균적인 능력치. 오프스피드에 쉽게 흔들린다.",
    zones: {
      1: z(0.300, 0.70, 0.24, 0.76, 0.04),  // high inside
      2: z(0.360, 0.76, 0.18, 0.82, 0.07),  // high middle
      3: z(0.295, 0.68, 0.24, 0.76, 0.04),  // high outside
      4: z(0.355, 0.76, 0.16, 0.84, 0.06),  // middle inside
      5: z(0.400, 0.82, 0.12, 0.88, 0.08),  // dead center
      6: z(0.310, 0.70, 0.20, 0.80, 0.05),  // middle outside
      7: z(0.275, 0.64, 0.26, 0.74, 0.03),  // low inside
      8: z(0.320, 0.70, 0.22, 0.78, 0.05),  // low middle
      9: z(0.235, 0.56, 0.34, 0.66, 0.02),  // low outside
      11: z(0.180, 0.37, 0.42, 0.58, 0.01),  // 하이볼
      12: z(0.160, 0.32, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.170, 0.34, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.152, 0.30, 0.50, 0.50, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.21 },
      SI: { ba: 0.258, whiffRate: 0.19 },
      FC: { ba: 0.240, whiffRate: 0.25 },
      CH: { ba: 0.205, whiffRate: 0.34 },
      SL: { ba: 0.210, whiffRate: 0.34 },
      ST: { ba: 0.192, whiffRate: 0.40 },
      CU: { ba: 0.195, whiffRate: 0.38 },
    },
  },

  bo_naylor: {
    id: 'bo_naylor',
    name: 'Bo Naylor',
    nameKo: '보 네일러',
    bats: 'L',
    team: 'Canada',
    flavorText: '가디언스 포수. 파워 잠재력이 있으나 삼진이 많다. 낮은 변화구에 특히 취약.',
    zones: {
      1: z(0.330, 0.72, 0.26, 0.74, 0.07),  // high inside
      2: z(0.400, 0.80, 0.18, 0.82, 0.10),  // high middle
      3: z(0.280, 0.64, 0.30, 0.70, 0.04),  // high outside
      4: z(0.380, 0.80, 0.16, 0.84, 0.09),  // middle inside
      5: z(0.440, 0.86, 0.12, 0.88, 0.12),  // dead center
      6: z(0.290, 0.66, 0.28, 0.72, 0.04),  // middle outside
      7: z(0.255, 0.60, 0.34, 0.66, 0.03),  // low inside - weak low
      8: z(0.310, 0.68, 0.28, 0.72, 0.05),  // low middle
      9: z(0.205, 0.52, 0.42, 0.58, 0.02),  // low outside - very weak
      11: z(0.190, 0.40, 0.42, 0.58, 0.02),  // 하이볼
      12: z(0.155, 0.30, 0.56, 0.44, 0.01),  // 로우볼
      13: z(0.170, 0.34, 0.50, 0.50, 0.01),  // 왼쪽 유인구
      14: z(0.148, 0.28, 0.56, 0.44, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.270, whiffRate: 0.22 },
      SI: { ba: 0.255, whiffRate: 0.20 },
      FC: { ba: 0.235, whiffRate: 0.26 },
      CH: { ba: 0.200, whiffRate: 0.36 },
      SL: { ba: 0.205, whiffRate: 0.36 },
      ST: { ba: 0.185, whiffRate: 0.42 },
      CU: { ba: 0.188, whiffRate: 0.42 },
    },
  },

  caissie: {
    id: 'caissie',
    name: 'Owen Caissie',
    nameKo: '오웬 케이시',
    bats: 'L',
    team: 'Canada',
    flavorText: '컵스 외야 유망주. 원시 파워를 갖췄지만 플레이트 디시플린이 미성숙. 오프스피드에 취약.',
    zones: {
      1: z(0.310, 0.70, 0.28, 0.72, 0.06),  // high inside
      2: z(0.390, 0.80, 0.20, 0.80, 0.10),  // high middle
      3: z(0.270, 0.64, 0.32, 0.68, 0.04),  // high outside
      4: z(0.370, 0.78, 0.18, 0.82, 0.09),  // middle inside
      5: z(0.430, 0.86, 0.13, 0.87, 0.12),  // dead center
      6: z(0.275, 0.64, 0.28, 0.72, 0.04),  // middle outside
      7: z(0.265, 0.62, 0.30, 0.70, 0.03),  // low inside
      8: z(0.315, 0.68, 0.26, 0.74, 0.05),  // low middle
      9: z(0.210, 0.54, 0.40, 0.60, 0.02),  // low outside
      11: z(0.195, 0.42, 0.40, 0.60, 0.02),  // 하이볼
      12: z(0.160, 0.32, 0.54, 0.46, 0.01),  // 로우볼
      13: z(0.172, 0.35, 0.50, 0.50, 0.01),  // 왼쪽 유인구
      14: z(0.148, 0.29, 0.56, 0.44, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.265, whiffRate: 0.24 },
      SI: { ba: 0.250, whiffRate: 0.21 },
      FC: { ba: 0.230, whiffRate: 0.28 },
      CH: { ba: 0.195, whiffRate: 0.38 },
      SL: { ba: 0.200, whiffRate: 0.38 },
      ST: { ba: 0.178, whiffRate: 0.44 },
      CU: { ba: 0.182, whiffRate: 0.42 },
    },
  },

  clarke: {
    id: 'clarke',
    name: 'Cade Clarke',
    nameKo: '케이드 클라크',
    bats: 'L',
    team: 'Canada',
    flavorText: '마이너리그 내야수. MLB 경험이 거의 없다. 전반적으로 평균 이하의 능력치.',
    zones: {
      1: z(0.255, 0.62, 0.30, 0.70, 0.02),  // high inside
      2: z(0.310, 0.70, 0.24, 0.76, 0.03),  // high middle
      3: z(0.245, 0.60, 0.30, 0.70, 0.02),  // high outside
      4: z(0.300, 0.68, 0.22, 0.78, 0.03),  // middle inside
      5: z(0.345, 0.74, 0.18, 0.82, 0.05),  // dead center
      6: z(0.275, 0.64, 0.24, 0.76, 0.02),  // middle outside
      7: z(0.250, 0.60, 0.28, 0.72, 0.02),  // low inside
      8: z(0.275, 0.64, 0.26, 0.74, 0.02),  // low middle
      9: z(0.215, 0.54, 0.34, 0.66, 0.01),  // low outside
      11: z(0.160, 0.32, 0.46, 0.54, 0.01),  // 하이볼
      12: z(0.145, 0.28, 0.50, 0.50, 0.01),  // 로우볼
      13: z(0.152, 0.30, 0.48, 0.52, 0.01),  // 왼쪽 유인구
      14: z(0.138, 0.26, 0.52, 0.48, 0.00),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.245, whiffRate: 0.24 },
      SI: { ba: 0.238, whiffRate: 0.21 },
      FC: { ba: 0.220, whiffRate: 0.28 },
      CH: { ba: 0.195, whiffRate: 0.36 },
      SL: { ba: 0.198, whiffRate: 0.36 },
      ST: { ba: 0.178, whiffRate: 0.42 },
      CU: { ba: 0.180, whiffRate: 0.40 },
    },
  },

  davidson: {
    id: 'davidson',
    name: 'Matt Davidson',
    nameKo: '맷 데이비슨',
    bats: 'R',
    team: 'Canada',
    flavorText: '베테랑 파워 히터. 삼진-볼넷-홈런의 극단적 3TTO 타자. 슬라이더에 크게 취약.',
    zones: {
      1: z(0.330, 0.72, 0.26, 0.74, 0.08),  // high inside
      2: z(0.420, 0.84, 0.18, 0.82, 0.13),  // high middle
      3: z(0.270, 0.64, 0.32, 0.68, 0.05),  // high outside
      4: z(0.400, 0.82, 0.16, 0.84, 0.11),  // middle inside
      5: z(0.470, 0.88, 0.12, 0.88, 0.15),  // dead center - big power
      6: z(0.275, 0.64, 0.30, 0.70, 0.04),  // middle outside
      7: z(0.265, 0.62, 0.32, 0.68, 0.03),  // low inside
      8: z(0.330, 0.70, 0.26, 0.74, 0.06),  // low middle
      9: z(0.195, 0.52, 0.44, 0.56, 0.02),  // low outside - very weak
      11: z(0.205, 0.44, 0.40, 0.60, 0.02),  // 하이볼
      12: z(0.158, 0.30, 0.56, 0.44, 0.01),  // 로우볼
      13: z(0.172, 0.36, 0.50, 0.50, 0.01),  // 왼쪽 유인구
      14: z(0.142, 0.28, 0.58, 0.42, 0.01),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.268, whiffRate: 0.26 },
      SI: { ba: 0.255, whiffRate: 0.22 },
      FC: { ba: 0.230, whiffRate: 0.30 },
      CH: { ba: 0.195, whiffRate: 0.38 },
      SL: { ba: 0.185, whiffRate: 0.42 },
      ST: { ba: 0.175, whiffRate: 0.46 },
      CU: { ba: 0.188, whiffRate: 0.42 },
    },
  },

  hicks: {
    id: 'hicks',
    name: 'Jordan Hicks',
    nameKo: '조던 힉스',
    bats: 'R',
    team: 'Canada',
    flavorText: '내야 유망주. 컨택 위주 스타일. 파워가 부족하나 방망이가 잘 맞는다.',
    zones: {
      1: z(0.265, 0.64, 0.26, 0.74, 0.02),  // high inside
      2: z(0.320, 0.72, 0.20, 0.80, 0.03),  // high middle
      3: z(0.260, 0.62, 0.26, 0.74, 0.02),  // high outside
      4: z(0.315, 0.70, 0.18, 0.82, 0.03),  // middle inside
      5: z(0.355, 0.76, 0.15, 0.85, 0.04),  // dead center
      6: z(0.285, 0.66, 0.22, 0.78, 0.02),  // middle outside
      7: z(0.255, 0.62, 0.26, 0.74, 0.02),  // low inside
      8: z(0.285, 0.66, 0.24, 0.76, 0.02),  // low middle
      9: z(0.225, 0.56, 0.32, 0.68, 0.01),  // low outside
      11: z(0.162, 0.33, 0.44, 0.56, 0.01),  // 하이볼
      12: z(0.148, 0.29, 0.48, 0.52, 0.01),  // 로우볼
      13: z(0.155, 0.31, 0.46, 0.54, 0.01),  // 왼쪽 유인구
      14: z(0.140, 0.27, 0.50, 0.50, 0.00),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.250, whiffRate: 0.21 },
      SI: { ba: 0.255, whiffRate: 0.18 },
      FC: { ba: 0.235, whiffRate: 0.24 },
      CH: { ba: 0.215, whiffRate: 0.30 },
      SL: { ba: 0.210, whiffRate: 0.32 },
      ST: { ba: 0.195, whiffRate: 0.36 },
      CU: { ba: 0.198, whiffRate: 0.36 },
    },
  },

  young: {
    id: 'young',
    name: 'Josh Young',
    nameKo: '조시 영',
    bats: 'R',
    team: 'Canada',
    flavorText: '내야 유망주. 파워는 평균 이하지만 컨택 능력이 나쁘지 않다.',
    zones: {
      1: z(0.260, 0.62, 0.28, 0.72, 0.02),  // high inside
      2: z(0.315, 0.70, 0.22, 0.78, 0.03),  // high middle
      3: z(0.255, 0.60, 0.28, 0.72, 0.02),  // high outside
      4: z(0.310, 0.68, 0.20, 0.80, 0.03),  // middle inside
      5: z(0.350, 0.74, 0.16, 0.84, 0.04),  // dead center
      6: z(0.280, 0.64, 0.24, 0.76, 0.02),  // middle outside
      7: z(0.252, 0.60, 0.28, 0.72, 0.02),  // low inside
      8: z(0.280, 0.64, 0.26, 0.74, 0.02),  // low middle
      9: z(0.220, 0.54, 0.34, 0.66, 0.01),  // low outside
      11: z(0.158, 0.32, 0.46, 0.54, 0.01),  // 하이볼
      12: z(0.143, 0.27, 0.50, 0.50, 0.01),  // 로우볼
      13: z(0.150, 0.29, 0.48, 0.52, 0.00),  // 왼쪽 유인구
      14: z(0.138, 0.25, 0.52, 0.48, 0.00),  // 오른쪽 유인구
    } as Record<Zone, ZoneStats>,
    pitchTypeStats: {
      FF: { ba: 0.248, whiffRate: 0.22 },
      SI: { ba: 0.252, whiffRate: 0.19 },
      FC: { ba: 0.230, whiffRate: 0.26 },
      CH: { ba: 0.210, whiffRate: 0.32 },
      SL: { ba: 0.208, whiffRate: 0.34 },
      ST: { ba: 0.190, whiffRate: 0.38 },
      CU: { ba: 0.192, whiffRate: 0.38 },
    },
  },
};
