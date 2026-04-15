import { useLanguage } from '../i18n/LanguageContext';
import type { GameMode } from '../data/types';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
}

export default function ModeSelect({ onSelectMode }: ModeSelectProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 text-center">
      <div className="w-24 h-0.5 bg-orange-500 mb-8 rounded-full" />

      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3 leading-tight">
        KBO 미니게임
      </h1>

      <p className="text-lg text-orange-400 font-semibold mb-8">
        모드를 선택하세요
      </p>

      <div className="flex flex-col gap-4 w-full max-w-sm mb-10">
        {/* KBO Pitching Mode */}
        <button
          onClick={() => onSelectMode('kbo')}
          className="w-full p-5 rounded-2xl border-2 border-orange-500 bg-slate-800/80 hover:bg-slate-800 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          <div className="text-4xl mb-3">{t('mode.kbo.flags')}</div>
          <div className="text-white font-black text-xl mb-1">{t('mode.kbo.title')}</div>
          <div className="text-slate-300 text-sm font-semibold mb-2">
            {t('mode.kbo.desc')}
          </div>
          <div className="text-slate-500 text-xs">{t('mode.kbo.meta')}</div>
        </button>

        {/* Kim Seo-hyun Batting Mode */}
        <button
          onClick={() => onSelectMode('kim_batting')}
          className="w-full relative p-5 rounded-2xl border-2 border-orange-500 bg-slate-800/80 hover:bg-slate-800 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-black px-2 py-0.5 rounded-full">
            NEW
          </div>
          <div className="text-4xl mb-3">🏏 ⚾ 🔥</div>
          <div className="text-white font-black text-xl mb-1">김서현과 승부하기</div>
          <div className="text-orange-400 text-sm font-semibold mb-2">
            연속 출루 챌린지
          </div>
          <div className="text-slate-500 text-xs">아웃 없이 몇 번 출루?</div>
        </button>

        {/* Batting Mode */}
        <button
          onClick={() => onSelectMode('batting')}
          className="w-full relative p-5 rounded-2xl border-2 border-red-500 bg-slate-800/80 hover:bg-slate-800 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          <div className="text-4xl mb-3">🇰🇷 ⚾ 🇯🇵</div>
          <div className="text-white font-black text-xl mb-1">애국지사 노시환</div>
          <div className="text-red-400 text-sm font-semibold mb-2">
            야마모토를 이겨라!
          </div>
          <div className="text-slate-500 text-xs">5타석 | 홈런을 쳐라</div>
        </button>
      </div>

      <div className="text-slate-600 text-xs">
        KBO 2026 / MLB Statcast Data
      </div>
    </div>
  );
}
