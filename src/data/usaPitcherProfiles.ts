import type { KorPitcherProfile } from './types';

export const USA_PITCHERS: KorPitcherProfile[] = [
  {
    id: 'skenes',
    name: 'Paul Skenes',
    nameKo: '폴 스킨스',
    hand: 'R',
    style: '파워 에이스',
    description: 'MLB 최고 신인. 포심 100mph+스위퍼+체인지업. 압도적인 구위.',
    pitches: [
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 100, movement: '직선 궤도' },
      { code: 'ST', name: 'Sweeper', nameKo: '스위퍼', avgSpeed: 88, movement: '날카로운 횡변화' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 90, movement: '속도 차 + 낙차' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 85, movement: '가로 변화' },
    ],
  },
  {
    id: 'skubal',
    name: 'Tarik Skubal',
    nameKo: '태릭 스쿠벌',
    hand: 'L',
    style: '사이영 좌완',
    description: '2025 사이영 수상. 포심+슬라이더+체인지업. 좌타자 킬러.',
    pitches: [
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 95, movement: '직선 궤도' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 85, movement: '날카로운 횡변화' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 87, movement: '속도 차 + 낙차' },
      { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 90, movement: '살짝 가로' },
    ],
  },
  {
    id: 'webb',
    name: 'Logan Webb',
    nameKo: '로건 웹',
    hand: 'R',
    style: '싱커볼러',
    description: '그라운드볼 유도 전문. 싱커+체인지업+슬라이더. 타자를 땅에 묶는다.',
    pitches: [
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 92, movement: '횡변화 + 하강' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 84, movement: '속도 차 + 낙차' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 83, movement: '가로 변화' },
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 93, movement: '직선 궤도' },
    ],
  },
  {
    id: 'kershaw',
    name: 'Clayton Kershaw',
    nameKo: '클레이튼 커쇼',
    hand: 'L',
    style: '레전드 좌완',
    description: '역대 최고 좌완 투수. 커브의 전설. 속도는 줄었지만 제구와 경험이 살아있다.',
    pitches: [
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 90, movement: '직선 궤도' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 84, movement: '가로 변화' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 73, movement: '큰 낙차' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 85, movement: '속도 차 + 낙차' },
    ],
  },
  {
    id: 'wacha',
    name: 'Michael Wacha',
    nameKo: '마이클 와카',
    hand: 'R',
    style: '안정적 선발',
    description: '제구력 중심의 우완. 싱커+체인지업으로 그라운드볼 유도.',
    pitches: [
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 92, movement: '횡변화 + 하강' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 85, movement: '속도 차 + 낙차' },
      { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 89, movement: '살짝 가로' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 78, movement: '큰 낙차' },
    ],
  },
];
