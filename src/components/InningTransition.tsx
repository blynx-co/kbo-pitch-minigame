import { useLanguage } from '../i18n/LanguageContext';

interface InningTransitionProps {
  inning: number;
  hanwhaInningScores: number[];
  kiaInningScores: number[];
  hanwhaTotal: number;
  kiaTotal: number;
  hanwhaThisInning: number;
  kiaThisInning: number;
  isGameOver: boolean;
  onNext: () => void;
  onChangePitcher?: () => void;
  currentPitcherName?: string;
}

export default function InningTransition({
  inning,
  hanwhaInningScores,
  kiaInningScores,
  hanwhaTotal,
  kiaTotal,
  hanwhaThisInning,
  kiaThisInning,
  isGameOver,
  onNext,
  onChangePitcher,
  currentPitcherName,
}: InningTransitionProps) {
  const { lang } = useLanguage();

  const innings = Array.from({ length: 9 }, (_, i) => i + 1);
  const completedInnings = Math.min(inning, 9);

  return (
    <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
      {/* Inning header */}
      <div className="text-amber-400 text-lg font-bold mb-2">
        {isGameOver
          ? (lang === 'ko' ? '경기 종료' : 'Game Over')
          : (lang === 'ko' ? `${inning}회 종료` : `End of Inning ${inning}`)}
      </div>

      {/* This inning summary */}
      <div className="flex gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl mb-1">🦅</div>
          <div className="text-slate-400 text-xs mb-1">{lang === 'ko' ? '한화' : 'Hanwha'}</div>
          <div className="text-white text-2xl font-black">+{hanwhaThisInning}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl mb-1">🐯</div>
          <div className="text-slate-400 text-xs mb-1">{lang === 'ko' ? 'KIA' : 'KIA'}</div>
          <div className="text-white text-2xl font-black">+{kiaThisInning}</div>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 mb-6 w-full max-w-md overflow-x-auto">
        <table className="w-full text-center text-sm">
          <thead>
            <tr>
              <th className="text-slate-400 font-medium px-2 py-1 text-left"></th>
              {innings.map(i => (
                <th
                  key={i}
                  className={`px-2 py-1 font-mono ${
                    i === inning ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {i}
                </th>
              ))}
              <th className="text-white font-bold px-3 py-1 border-l border-slate-600">R</th>
            </tr>
          </thead>
          <tbody>
            {/* Hanwha */}
            <tr>
              <td className="text-left px-2 py-1 text-white font-semibold">🦅</td>
              {innings.map(i => (
                <td key={i} className={`px-2 py-1 font-mono ${
                  i <= completedInnings ? 'text-white' : 'text-slate-600'
                }`}>
                  {i <= completedInnings ? (hanwhaInningScores[i - 1] ?? 0) : '-'}
                </td>
              ))}
              <td className="px-3 py-1 font-mono font-bold text-white border-l border-slate-600">
                {hanwhaTotal}
              </td>
            </tr>
            {/* KIA */}
            <tr>
              <td className="text-left px-2 py-1 text-white font-semibold">🐯</td>
              {innings.map(i => (
                <td key={i} className={`px-2 py-1 font-mono ${
                  i <= completedInnings ? 'text-white' : 'text-slate-600'
                }`}>
                  {i <= completedInnings ? (kiaInningScores[i - 1] ?? 0) : '-'}
                </td>
              ))}
              <td className="px-3 py-1 font-mono font-bold text-white border-l border-slate-600">
                {kiaTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Score comparison */}
      <div className="text-3xl font-black mb-6">
        <span className={hanwhaTotal > kiaTotal ? 'text-blue-400' : hanwhaTotal < kiaTotal ? 'text-slate-400' : 'text-white'}>
          {hanwhaTotal}
        </span>
        <span className="text-slate-500 mx-3">-</span>
        <span className={kiaTotal > hanwhaTotal ? 'text-red-400' : kiaTotal < hanwhaTotal ? 'text-slate-400' : 'text-white'}>
          {kiaTotal}
        </span>
      </div>

      {/* Current pitcher */}
      {currentPitcherName && (
        <div className="text-slate-400 text-sm mb-4">
          {lang === 'ko' ? '현재 투수' : 'Current Pitcher'}: <span className="text-white font-semibold">{currentPitcherName}</span>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-col gap-3 items-center">
        <button
          onClick={onNext}
          className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          {isGameOver
            ? (lang === 'ko' ? '결과 보기' : 'See Results')
            : (lang === 'ko' ? `${inning + 1}회 시작` : `Start Inning ${inning + 1}`)}
        </button>

        {!isGameOver && onChangePitcher && (
          <button
            onClick={onChangePitcher}
            className="px-6 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 border border-slate-500 text-slate-200 font-medium text-sm transition-colors"
          >
            {lang === 'ko' ? '투수 교체' : 'Change Pitcher'}
          </button>
        )}
      </div>
    </div>
  );
}
