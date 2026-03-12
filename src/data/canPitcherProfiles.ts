import type { KorPitcherProfile } from './types';

export const CAN_PITCHERS: KorPitcherProfile[] = [
  {
    id: 'taillon',
    name: 'Jameson Taillon',
    nameKo: '제임슨 테이런',
    hand: 'R',
    style: '정통파 선발',
    description: 'MLB 경험 풍부한 우완. 포심+싱커+커브+체인지업 조합.',
    pitches: [
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 94, movement: '직선 궤도' },
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 93, movement: '횡변화 + 하강' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 80, movement: '큰 낙차' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 86, movement: '속도 차 + 낙차' },
    ],
  },
  {
    id: 'paxton',
    name: 'James Paxton',
    nameKo: '제임스 팩스턴',
    hand: 'L',
    style: '파워 좌완',
    description: '빅 메이플. 빠른 포심+커터+커브. 좌타자 상대 강력.',
    pitches: [
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 95, movement: '직선 궤도' },
      { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 90, movement: '살짝 가로' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 79, movement: '큰 낙차' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 88, movement: '속도 차 + 낙차' },
    ],
  },
  {
    id: 'soroka',
    name: 'Mike Soroka',
    nameKo: '마이크 소로카',
    hand: 'R',
    style: '싱커볼러',
    description: '캐나다의 에이스. 싱커+슬라이더+체인지업으로 그라운드볼 양산.',
    pitches: [
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 92, movement: '횡변화 + 하강' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 84, movement: '가로 변화' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 83, movement: '속도 차 + 낙차' },
      { code: 'FF', name: 'Four-Seam Fastball', nameKo: '포심', avgSpeed: 93, movement: '직선 궤도' },
    ],
  },
  {
    id: 'quantrill',
    name: 'Cal Quantrill',
    nameKo: '칼 퀀트릴',
    hand: 'R',
    style: '제구형 우완',
    description: '아버지도 MLB. 다양한 구종과 제구력으로 승부.',
    pitches: [
      { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 93, movement: '횡변화 + 하강' },
      { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 88, movement: '살짝 가로' },
      { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 85, movement: '속도 차 + 낙차' },
      { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 79, movement: '큰 낙차' },
      { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 83, movement: '가로 변화' },
    ],
  },
];
