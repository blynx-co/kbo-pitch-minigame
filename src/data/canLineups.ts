import type { DomLineup } from './types';

export const CAN_LINEUPS: DomLineup[] = [
  {
    id: 'starters',
    name: 'Starting Lineup',
    nameKo: '주전 라인업',
    description: 'Main starters. Julien-J.Naylor-O\'Neill-Black-Lopez-Toro-Bo Naylor-Caissie-Clarke',
    batterIds: ['julien', 'j_naylor', 'oneill', 'black', 'lopez', 'toro', 'bo_naylor', 'caissie', 'clarke'],
  },
  {
    id: 'alternate',
    name: 'Alternate Lineup',
    nameKo: '후보 라인업',
    description: 'Alternate configuration. Julien-J.Naylor-O\'Neill-Davidson-Lopez-Caissie-Toro-Hicks-Clarke',
    batterIds: ['julien', 'j_naylor', 'oneill', 'davidson', 'lopez', 'caissie', 'toro', 'hicks', 'clarke'],
  },
];
