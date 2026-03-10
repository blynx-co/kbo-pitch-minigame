import type { DomLineup } from './types';

export const DOM_LINEUPS: DomLineup[] = [
  {
    id: 'power',
    name: 'Power Lineup',
    nameKo: '파워 라인업',
    description: '장타력 중심. 소토-타티스-블라디-마차도-카미네로-훌리오-마르테-페냐-웰스',
    batterIds: ['soto', 'tatis', 'guerrero', 'machado', 'caminero', 'jrod', 'marte', 'pena', 'wells'],
  },
  {
    id: 'contact',
    name: 'Contact/Speed Lineup',
    nameKo: '컨택/스피드 라인업',
    description: '출루+주력 중심. 페르도모-소토-블라디-타티스-훌리오-마차도-크루즈-마르테-라미레즈',
    batterIds: ['perdomo', 'soto', 'guerrero', 'tatis', 'jrod', 'machado', 'cruz', 'marte', 'ramirez'],
  },
];
