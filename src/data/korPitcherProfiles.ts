import type { KorPitcherProfile } from './types';

export const KOR_PITCHERS: KorPitcherProfile[] = [
  {
    id: 'dunning',
    name: 'Dane Dunning',
    nameKo: '데인 더닝',
    hand: 'R',
    style: 'MLB 정통파',
    description: '다양한 구종 보유. 체인지업과 싱커의 조합이 핵심.',
    pitches: [
      { code: 'FF', name: 'Four-Seam', nameKo: '포심', avgSpeed: 93, movement: '직선 궤도' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 84, movement: '가로 변화' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 86, movement: '속도 차 + 낙차' },
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 92, movement: '횡변화 + 하강' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 79, movement: '큰 낙차' },
    ],
  },
  {
    id: 'ryu',
    name: 'Hyun-Jin Ryu',
    nameKo: '류현진',
    hand: 'L',
    style: '베테랑 좌완',
    description: '체인지업 장인. 느린 공으로 타이밍을 흔든다.',
    pitches: [
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 77, movement: '급격한 낙차' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 72, movement: '큰 종 변화' },
      { code: 'FF', name: 'Four-Seam', nameKo: '포심', avgSpeed: 89, movement: '직선 궤도' },
      { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 86, movement: '살짝 가로' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 80, movement: '횡변화' },
    ],
  },
  {
    id: 'ko',
    name: 'Young-Pyo Ko',
    nameKo: '고영표',
    hand: 'R',
    style: '잠수함',
    description: '독특한 언더핸드 투구. 낮은 릴리스 포인트로 타자 혼란.',
    pitches: [
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 84, movement: '횡변화 + 하강' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 74, movement: '속도 차 + 낙차' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 78, movement: '가로 변화' },
    ],
  },
  {
    id: 'go',
    name: 'Woo-Suk Go',
    nameKo: '고우석',
    hand: 'R',
    style: '마무리',
    description: '화력 투구. 빠른 직구와 날카로운 슬라이더.',
    pitches: [
      { code: 'FF', name: 'Four-Seam', nameKo: '포심', avgSpeed: 96, movement: '직선 궤도' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 88, movement: '날카로운 횡변화' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 87, movement: '속도 차' },
    ],
  },
  {
    id: 'obrien',
    name: "Riley O'Brien",
    nameKo: '라일리 오브라이언',
    hand: 'R',
    style: '파워',
    description: '빠른 직구+커브 조합. 탈삼진 능력 우수.',
    pitches: [
      { code: 'FF', name: 'Four-Seam', nameKo: '포심', avgSpeed: 95, movement: '직선 궤도' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 85, movement: '가로 변화' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 80, movement: '큰 낙차' },
    ],
  },
];
