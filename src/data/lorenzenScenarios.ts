import type { AtBatOutcome } from './types';

export interface ScenarioAtBat {
  id: string;
  inning: number;
  batterId: string;        // key into USA_BATTER_PROFILES
  actualResult: string;    // Korean description of what actually happened
  actualOutcome: AtBatOutcome; // Structured outcome for scoring
  description: string;     // Context description
}

export interface ScenarioMode {
  id: string;
  name: string;
  nameKo: string;
  description: string;
  pitcherId: string;       // key to identify pitcher profile
  flag: string;            // emoji flag
  opponent: string;        // opponent team name
  opponentFlag: string;
  matchDate: string;
  matchResult: string;     // e.g., "이탈리아 8 - 6 미국"
  pitcherLine: string;     // e.g., "4.2IP 2H 0R 1BB 2K"
  totalAtBats: number;     // 18
  selectCount: number;     // 5 (random selection from total)
  atBats: ScenarioAtBat[];
}

export const SCENARIO_MODES: ScenarioMode[] = [
  {
    id: 'lorenzen',
    name: 'Beat Lorenzen!',
    nameKo: '로렌젠을 이겨라!',
    description: '이탈리아의 마이클 로렌젠이 미국 타선을 4.2이닝 무실점으로 막은 투구를 재현하세요!',
    pitcherId: 'lorenzen',
    flag: '🇮🇹',
    opponent: '미국',
    opponentFlag: '🇺🇸',
    matchDate: '2026.03.10',
    matchResult: '이탈리아 8 - 6 미국',
    pitcherLine: '4.2IP 2H 0R 1BB 2K 67구',
    totalAtBats: 18,
    selectCount: 5,
    atBats: [
      // Inning 1
      {
        id: 'lor_1',
        inning: 1,
        batterId: 'witt',
        actualResult: '유격수 앞 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '1회 선두타자. 바비 윗 주니어.',
      },
      {
        id: 'lor_2',
        inning: 1,
        batterId: 'henderson',
        actualResult: '헛스윙 삼진',
        actualOutcome: { type: 'strikeout' },
        description: '1회 2번 타자. 거너 헨더슨.',
      },
      {
        id: 'lor_3',
        inning: 1,
        batterId: 'judge',
        actualResult: '볼넷 허용',
        actualOutcome: { type: 'walk' },
        description: '1회 3번 타자. 애런 저지.',
      },
      {
        id: 'lor_4',
        inning: 1,
        batterId: 'schwarber',
        actualResult: '파울 플라이 아웃',
        actualOutcome: { type: 'out', result: 'flyout' },
        description: '1회 4번 타자. 카일 슈워버.',
      },
      // Inning 2
      {
        id: 'lor_5',
        inning: 2,
        batterId: 'w_smith',
        actualResult: '우익수 뜬공 아웃',
        actualOutcome: { type: 'out', result: 'flyout' },
        description: '2회 선두타자. 윌 스미스.',
      },
      {
        id: 'lor_6',
        inning: 2,
        batterId: 'anthony',
        actualResult: '1루 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '2회 6번 타자. 로만 앤소니.',
      },
      {
        id: 'lor_7',
        inning: 2,
        batterId: 'goldschmidt',
        actualResult: '1루 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '2회 7번 타자. 폴 골드슈미트.',
      },
      // Inning 3
      {
        id: 'lor_8',
        inning: 3,
        batterId: 'clement',
        actualResult: '3루 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '3회 선두타자. 어니 클레멘트.',
      },
      {
        id: 'lor_9',
        inning: 3,
        batterId: 'crow_armstrong',
        actualResult: '중견수 뜬공 아웃',
        actualOutcome: { type: 'out', result: 'flyout' },
        description: '3회 9번 타자. 피트 크로우-암스트롱.',
      },
      {
        id: 'lor_10',
        inning: 3,
        batterId: 'witt',
        actualResult: '좌전 안타',
        actualOutcome: { type: 'hit', result: 'single' },
        description: '3회 1번 타자 (2순째). 바비 윗 주니어.',
      },
      {
        id: 'lor_11',
        inning: 3,
        batterId: 'henderson',
        actualResult: '2루 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '3회 2번 타자 (2순째). 거너 헨더슨.',
      },
      // Inning 4
      {
        id: 'lor_12',
        inning: 4,
        batterId: 'judge',
        actualResult: '3루 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '4회 3번 타자 (2순째). 애런 저지.',
      },
      {
        id: 'lor_13',
        inning: 4,
        batterId: 'schwarber',
        actualResult: '중견수 뜬공 아웃',
        actualOutcome: { type: 'out', result: 'flyout' },
        description: '4회 4번 타자 (2순째). 카일 슈워버.',
      },
      {
        id: 'lor_14',
        inning: 4,
        batterId: 'w_smith',
        actualResult: '좌측 2루타',
        actualOutcome: { type: 'hit', result: 'double' },
        description: '4회 5번 타자 (2순째). 윌 스미스.',
      },
      {
        id: 'lor_15',
        inning: 4,
        batterId: 'anthony',
        actualResult: '2루 땅볼 아웃',
        actualOutcome: { type: 'out', result: 'groundout' },
        description: '4회 6번 타자 (2순째). 로만 앤소니.',
      },
      // Inning 5 (partial - 4.2 IP)
      {
        id: 'lor_16',
        inning: 5,
        batterId: 'goldschmidt',
        actualResult: '헛스윙 삼진',
        actualOutcome: { type: 'strikeout' },
        description: '5회 7번 타자 (2순째). 폴 골드슈미트.',
      },
      {
        id: 'lor_17',
        inning: 5,
        batterId: 'clement',
        actualResult: '3루 라인드라이브 아웃',
        actualOutcome: { type: 'out', result: 'lineout' },
        description: '5회 8번 타자 (2순째). 어니 클레멘트.',
      },
      {
        id: 'lor_18',
        inning: 5,
        batterId: 'crow_armstrong',
        actualResult: '루킹 삼진',
        actualOutcome: { type: 'strikeout' },
        description: '5회 마지막 타자. 피트 크로우-암스트롱.',
      },
    ],
  },
];
