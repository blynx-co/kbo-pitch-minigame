import { useLanguage } from '../i18n/LanguageContext';
import type { GameMode } from '../data/types';

interface ModeSelectProps {
  onSelectMode: (mode: GameMode) => void;
}

export default function ModeSelect({ onSelectMode }: ModeSelectProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-6 text-center">
      {/* Top decorative line */}
      <div className="w-24 h-0.5 bg-orange-500 mb-8 rounded-full" />

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 leading-tight">
        {t('mode.kbo.title')}
      </h1>

      {/* Subtitle */}
      <p className="text-lg sm:text-xl text-orange-400 font-semibold mb-10">
        {t('mode.kbo.desc')}
      </p>

      {/* KBO Mode - single card */}
      <div className="w-full max-w-sm mb-10">
        <button
          onClick={() => onSelectMode('kbo')}
          className="w-full p-6 rounded-2xl border-2 border-orange-500 bg-slate-800/80 hover:bg-slate-800 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-center"
        >
          <div className="text-5xl mb-4">{t('mode.kbo.flags')}</div>
          <div className="text-white font-black text-2xl mb-2">{t('mode.kbo.title')}</div>
          <div className="text-slate-300 text-sm font-semibold mb-3">
            {t('mode.kbo.desc')}
          </div>
          <div className="text-slate-500 text-xs">{t('mode.kbo.meta')}</div>
        </button>
      </div>

      {/* Bottom note */}
      <div className="text-slate-600 text-xs">
        KBO 2026 Data
      </div>
    </div>
  );
}
