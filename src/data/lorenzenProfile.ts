import type { KorPitcherProfile } from './types';

export const LORENZEN_PROFILE: KorPitcherProfile = {
  id: 'lorenzen',
  name: 'Michael Lorenzen',
  nameKo: '마이클 로렌젠',
  hand: 'R',
  style: '7구종 마술사',
  description: 'WBC 2026 이탈리아 에이스. 7가지 구종을 구사하여 미국 타선을 4.2이닝 무실점으로 막았다.',
  pitches: [
    { code: 'FF', name: 'Four-Seam', nameKo: '포심', avgSpeed: 94, movement: '싱킹 액션' },
    { code: 'SI', name: 'Sinker', nameKo: '싱커', avgSpeed: 93, movement: '횡변화 + 하강' },
    { code: 'FC', name: 'Cutter', nameKo: '커터', avgSpeed: 90, movement: '살짝 가로' },
    { code: 'CH', name: 'Changeup', nameKo: '체인지업', avgSpeed: 84, movement: '속도 차 + 페이드' },
    { code: 'SL', name: 'Slider', nameKo: '슬라이더', avgSpeed: 85, movement: '투 플레인 변화' },
    { code: 'ST', name: 'Sweeper', nameKo: '스위퍼', avgSpeed: 82, movement: '넓은 수평 변화' },
    { code: 'CU', name: 'Curveball', nameKo: '커브', avgSpeed: 82, movement: '12-6 드롭' },
  ],
};
