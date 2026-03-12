import type { DomLineup } from './types';

export const USA_LINEUPS: DomLineup[] = [
  {
    id: 'power',
    name: 'Full Power',
    nameKo: '풀파워 라인업',
    description: 'Power-focused. Witt-Harper-Judge-Schwarber-Bregman-Henderson-Anthony-Crow-Armstrong-Turang',
    batterIds: ['witt', 'harper', 'judge', 'schwarber', 'bregman', 'henderson', 'anthony', 'crow_armstrong', 'turang'],
  },
  {
    id: 'balanced',
    name: 'Balanced Lineup',
    nameKo: '밸런스 라인업',
    description: 'Balanced approach. Witt-Goldschmidt-Judge-Schwarber-Bregman-Raleigh-Anthony-Buxton-Turang',
    batterIds: ['witt', 'goldschmidt', 'judge', 'schwarber', 'bregman', 'raleigh', 'anthony', 'buxton', 'turang'],
  },
];
