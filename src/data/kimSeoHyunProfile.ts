import type { KorPitcherProfile } from './types';

export const KIM_SEOHYUN_PROFILE: KorPitcherProfile = {
  id: 'kim-seohyun',
  name: 'Seo-Hyun Kim',
  nameKo: '김서현',
  hand: 'R',
  style: '제구 난조형',
  description: '직구가 우타자 몸쪽으로 크게 휘는 투수. 제구가 매우 불안정하지만 직구 구위는 있다.',
  pitches: [
    { code: 'FF', name: 'Four-Seam', nameKo: '직구', avgSpeed: 90, movement: '우타자 몸쪽으로 크게 휨' },
    { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 81, movement: '바깥쪽 스위핑' },
    { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 83, movement: '팔쪽 빠짐' },
  ],
};
