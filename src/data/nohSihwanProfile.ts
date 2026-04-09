import type { BatterProfile, Zone, ZoneStats } from './types';

function z(wOBA: number, swingRate: number, whiffRate: number, contactRate: number, hrRate: number): ZoneStats {
  return { wOBA, swingRate, whiffRate, contactRate, hrRate };
}

// 노시환: 한화 좌타 장타자 — KBO .250대 타자지만 파워는 최상급
// MLB 에이스 상대로는 훨씬 어려움 → 전체적으로 stat 하향 조정
export const NOH_SIHWAN: BatterProfile = {
  id: 'noh-si-hwan',
  name: 'Si-Hwan Noh',
  nameKo: '노시환',
  bats: 'R',
  team: 'Hanwha',
  flavorText: '한화의 4번 타자. 당겨치기 파워는 KBO 최상급이지만 MLB 급 변화구에는 약하다.',
  zones: {
    // Left-handed power hitter: strong inside-middle, weak low-outside
    1: z(0.280, 0.55, 0.28, 0.72, 0.020),  // high inside — can pull
    2: z(0.320, 0.65, 0.22, 0.78, 0.035),  // high middle
    3: z(0.240, 0.50, 0.32, 0.68, 0.015),  // high outside
    4: z(0.380, 0.70, 0.18, 0.82, 0.060),  // middle inside — POWER ZONE
    5: z(0.400, 0.75, 0.15, 0.85, 0.070),  // dead center — POWER ZONE
    6: z(0.280, 0.60, 0.25, 0.75, 0.025),  // middle outside
    7: z(0.300, 0.58, 0.22, 0.78, 0.035),  // low inside
    8: z(0.310, 0.62, 0.20, 0.80, 0.040),  // low middle
    9: z(0.200, 0.45, 0.35, 0.65, 0.010),  // low outside — weak spot
    11: z(0.150, 0.25, 0.40, 0.60, 0.008), // high ball
    12: z(0.120, 0.30, 0.45, 0.55, 0.005), // low ball — chase zone
    13: z(0.100, 0.35, 0.50, 0.50, 0.003), // left chase — splitter trap
    14: z(0.080, 0.20, 0.55, 0.45, 0.002), // right chase
  } as Record<Zone, ZoneStats>,
  pitchTypeStats: {
    FF: { ba: 0.260, whiffRate: 0.22 },  // can handle fastballs
    CU: { ba: 0.180, whiffRate: 0.38 },  // struggles vs curve
    FS: { ba: 0.160, whiffRate: 0.42 },  // very weak vs splitter
    FC: { ba: 0.220, whiffRate: 0.28 },  // moderate vs cutter
  },
};
