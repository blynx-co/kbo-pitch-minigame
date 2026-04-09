import { useState, useCallback, useRef } from 'react';
import type { Zone, PitchTrajectory } from './data/types';
import { YAMAMOTO_PROFILE } from './data/yamamotoProfile';
import { NOH_SIHWAN } from './data/nohSihwanProfile';
import { yamamotoSelectPitch } from './engine/pitcherAIEngine';
import { determineBattingOutcome, getTimingQuality, type BattingResult } from './engine/battingOutcomeEngine';
import { generatePitchTrajectory } from './engine/outcomeEngine';
import { gameAudio } from './audio/gameAudio';
import PitchScene from './components/PitchScene';

type BattingPhase =
  | 'intro'
  | 'waiting'        // waiting for Yamamoto to pitch
  | 'pitch_flying'   // ball is in the air — player must tap zone to swing
  | 'outcome'        // show result
  | 'at_bat_result'  // at-bat summary
  | 'game_result';   // final screen

interface AtBatRecord {
  result: 'strikeout' | 'walk' | 'hit' | 'homerun' | 'out';
  pitchCount: number;
}

export default function BattingApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<BattingPhase>('intro');
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [atBatsLeft, setAtBatsLeft] = useState(5);
  const [currentAtBat, setCurrentAtBat] = useState(1);
  const [pitchesThisAB, setPitchesThisAB] = useState(0);
  const [homerunCount, setHomerunCount] = useState(0);
  const [hitCount, setHitCount] = useState(0);
  const [records, setRecords] = useState<AtBatRecord[]>([]);

  // Current pitch state
  const [currentPitch, setCurrentPitch] = useState<{ pitchCode: string; zone: Zone } | null>(null);
  const [trajectory, setTrajectory] = useState<PitchTrajectory | null>(null);
  const [lastResult, setLastResult] = useState<BattingResult | null>(null);
  const [, setSwingZone] = useState<Zone | null>(null);

  // Timing
  const pitchStartTime = useRef(0);
  const plateTime = useRef(0.5);

  // Sound
  const [soundStarted, setSoundStarted] = useState(false);

  const startSound = useCallback(() => {
    if (!soundStarted) {
      gameAudio.preload();
      gameAudio.startAmbient();
      setSoundStarted(true);
    }
  }, [soundStarted]);

  // === Start game ===
  const handleStart = useCallback(() => {
    startSound();
    setPhase('waiting');
  }, [startSound]);

  // === Yamamoto pitches ===
  const handlePitch = useCallback(() => {
    const pitch = yamamotoSelectPitch(balls, strikes);
    setCurrentPitch(pitch);
    setSwingZone(null);
    setLastResult(null);

    // Generate trajectory from Yamamoto's perspective
    const traj = generatePitchTrajectory(
      pitch.pitchCode,
      pitch.zone,
      YAMAMOTO_PROFILE.pitches.find(p => p.code === pitch.pitchCode)?.avgSpeed ?? 95,
      'R',
      'L', // Noh Si-hwan bats left
    );
    setTrajectory(traj);
    plateTime.current = traj.plateTime;
    pitchStartTime.current = Date.now();
    setPitchesThisAB(prev => prev + 1);
    setPhase('pitch_flying');
  }, [balls, strikes]);

  // === Player swings at a zone ===
  const handleSwing = useCallback((zone: Zone) => {
    if (phase !== 'pitch_flying' || !currentPitch) return;

    const elapsed = (Date.now() - pitchStartTime.current) / 1000;
    const ratio = elapsed / (plateTime.current * 2.5); // animation is slowed for gameplay
    const timing = getTimingQuality(ratio);

    const result = determineBattingOutcome('swing', zone, currentPitch.zone, currentPitch.pitchCode, timing);
    setSwingZone(zone);
    setLastResult(result);

    // Play sound
    gameAudio.onPitchOutcome(result.outcome);

    setPhase('outcome');
  }, [phase, currentPitch]);

  // === Player takes (doesn't swing) — called when animation ends without click ===
  const handleAnimationEnd = useCallback(() => {
    if (phase !== 'pitch_flying' || !currentPitch) return;

    const result = determineBattingOutcome('take', null, currentPitch.zone, currentPitch.pitchCode, 'way_off');
    setLastResult(result);
    setPhase('outcome');
  }, [phase, currentPitch]);

  // === Process outcome ===
  const handleOutcomeNext = useCallback(() => {
    if (!lastResult) return;
    const outcome = lastResult.outcome;

    // Update count
    let newBalls = balls;
    let newStrikes = strikes;
    let abOver = false;
    let abResult: AtBatRecord['result'] | null = null;

    if (outcome === 'called_strike' || outcome === 'swinging_strike') {
      newStrikes = strikes + 1;
      if (newStrikes >= 3) { abOver = true; abResult = 'strikeout'; }
    } else if (outcome === 'foul') {
      if (strikes < 2) newStrikes = strikes + 1;
    } else if (outcome === 'ball') {
      newBalls = balls + 1;
      if (newBalls >= 4) { abOver = true; abResult = 'walk'; }
    } else if (outcome === 'homerun') {
      abOver = true; abResult = 'homerun';
    } else if (['single', 'double', 'triple'].includes(outcome)) {
      abOver = true; abResult = 'hit';
    } else if (['groundout', 'flyout', 'lineout'].includes(outcome)) {
      abOver = true; abResult = 'out';
    }

    if (abOver && abResult) {
      const rec: AtBatRecord = { result: abResult, pitchCount: pitchesThisAB };
      const newRecords = [...records, rec];
      setRecords(newRecords);

      let newAtBatsLeft = atBatsLeft - 1;
      if (abResult === 'walk') newAtBatsLeft += 1;     // +1 bonus
      if (abResult === 'hit') newAtBatsLeft += 2;       // +2 bonus
      if (abResult === 'homerun') {
        setHomerunCount(prev => prev + 1);
        newAtBatsLeft += 2; // homerun = hit + bonus
      }
      if (abResult === 'hit' || abResult === 'homerun') {
        setHitCount(prev => prev + 1);
      }

      setAtBatsLeft(newAtBatsLeft);

      if (newAtBatsLeft <= 0) {
        gameAudio.stopAmbient();
        if (homerunCount + (abResult === 'homerun' ? 1 : 0) > 0) {
          gameAudio.onVictory();
        }
        setPhase('game_result');
      } else {
        setPhase('at_bat_result');
      }
    } else {
      setBalls(newBalls);
      setStrikes(newStrikes);
      setPhase('waiting');
    }
  }, [lastResult, balls, strikes, atBatsLeft, records, pitchesThisAB, homerunCount]);

  // === Next at-bat ===
  const handleNextAtBat = useCallback(() => {
    setBalls(0);
    setStrikes(0);
    setPitchesThisAB(0);
    setCurrentAtBat(prev => prev + 1);
    setCurrentPitch(null);
    setTrajectory(null);
    setLastResult(null);
    setPhase('waiting');
  }, []);

  // === Restart ===
  const handleRestart = useCallback(() => {
    gameAudio.stopAmbient();
    setBalls(0);
    setStrikes(0);
    setAtBatsLeft(5);
    setCurrentAtBat(1);
    setPitchesThisAB(0);
    setHomerunCount(0);
    setHitCount(0);
    setRecords([]);
    setCurrentPitch(null);
    setTrajectory(null);
    setLastResult(null);
    setSwingZone(null);
    setSoundStarted(false);
    setPhase('intro');
  }, []);

  // === Count dots ===
  const CountDots = ({ label, count, max, color }: { label: string; count: number; max: number; color: string }) => (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-400 font-mono w-3">{label}</span>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${i < count ? color : 'bg-slate-700'}`} />
      ))}
    </div>
  );

  // === Zone grid (batter's view) ===
  const ZoneGrid = ({ onSelect, disabled }: { onSelect: (z: Zone) => void; disabled: boolean }) => {
    const zones: Zone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    return (
      <div className="grid grid-cols-3 gap-1 w-36 h-36 sm:w-44 sm:h-44">
        {zones.map(z => (
          <button
            key={z}
            disabled={disabled}
            onClick={() => onSelect(z)}
            className={`rounded border transition-all ${
              disabled
                ? 'border-slate-700 bg-slate-800/30'
                : 'border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/30 active:bg-amber-500/50 active:scale-95'
            }`}
          />
        ))}
      </div>
    );
  };

  // ===== RENDER =====

  // --- Intro ---
  if (phase === 'intro') {
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-0.5 bg-red-500 mb-6 rounded-full" />
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">애국지사 노시환</h1>
        <h2 className="text-xl sm:text-2xl font-black text-red-400 mb-4">야마모토를 이겨라</h2>
        <div className="flex gap-8 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-1">🇰🇷</div>
            <div className="text-white font-bold">{NOH_SIHWAN.nameKo}</div>
            <div className="text-slate-400 text-xs">한화 / 좌타</div>
          </div>
          <div className="text-slate-500 text-2xl font-black self-center">VS</div>
          <div className="text-center">
            <div className="text-4xl mb-1">🇯🇵</div>
            <div className="text-white font-bold">{YAMAMOTO_PROFILE.nameKo}</div>
            <div className="text-slate-400 text-xs">다저스 / 우투</div>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 mb-6 max-w-xs text-left text-sm">
          <p className="text-slate-300 mb-2">• 기본 <span className="text-amber-400 font-bold">5타석</span></p>
          <p className="text-slate-300 mb-2">• 볼넷 → 기회 <span className="text-green-400">+1</span></p>
          <p className="text-slate-300 mb-2">• 안타 → 기회 <span className="text-green-400">+2</span></p>
          <p className="text-slate-300">• 공이 날아오면 <span className="text-amber-400 font-bold">존을 탭</span>하여 스윙!</p>
        </div>
        <button
          onClick={handleStart}
          className="px-8 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          타석에 들어서기
        </button>
        <button onClick={onBack} className="mt-4 text-slate-500 text-sm hover:text-slate-300">← 뒤로</button>
      </div>
    );
  }

  // --- Waiting (before pitch) ---
  if (phase === 'waiting') {
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        {/* HUD */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2">
          <div className="max-w-lg mx-auto flex items-center justify-between text-sm">
            <div className="text-slate-300 text-xs">
              <span className="text-amber-400 font-bold">{currentAtBat}</span>번째 타석
              <span className="text-slate-500 ml-2">잔여 {atBatsLeft}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <CountDots label="B" count={balls} max={4} color="bg-green-500" />
              <CountDots label="S" count={strikes} max={3} color="bg-yellow-500" />
            </div>
            <div className="text-right">
              <span className="text-red-400 text-xs font-bold">HR {homerunCount}</span>
              <span className="text-slate-500 text-xs ml-2">H {hitCount}</span>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-4">야마모토가 투구 준비 중...</p>
        <button
          onClick={handlePitch}
          className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xl transition-all hover:scale-[1.02] active:scale-[0.98] animate-pulse"
        >
          준비 완료
        </button>
      </div>
    );
  }

  // --- Pitch flying (swing zone selection) ---
  if (phase === 'pitch_flying' && trajectory) {
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-slate-950 flex flex-col items-center justify-center relative">
        {/* HUD */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 px-4 py-2">
          <div className="max-w-lg mx-auto flex items-center justify-between text-sm">
            <div className="flex flex-col gap-0.5">
              <CountDots label="B" count={balls} max={4} color="bg-green-500" />
              <CountDots label="S" count={strikes} max={3} color="bg-yellow-500" />
            </div>
            <div className="text-amber-400 font-bold text-xs animate-pulse">스윙 존을 탭!</div>
            <div className="text-red-400 text-xs font-bold">HR {homerunCount}</div>
          </div>
        </div>

        {/* 3D pitch scene */}
        <div className="w-full h-[45vh] sm:h-[50vh]">
          <PitchScene
            pitch={trajectory}
            isAnimating={true}
            onAnimationComplete={handleAnimationEnd}
          />
        </div>

        {/* Strike zone overlay — tap to swing */}
        <div className="flex flex-col items-center mt-2">
          <p className="text-amber-400 text-xs font-bold mb-2 animate-pulse">↓ 스윙할 존을 탭하세요 ↓</p>
          <ZoneGrid onSelect={handleSwing} disabled={false} />
          <button
            onClick={handleAnimationEnd}
            className="mt-3 px-4 py-1.5 text-slate-500 text-xs border border-slate-700 rounded-lg hover:text-slate-300"
          >
            보내기 (Take)
          </button>
        </div>
      </div>
    );
  }

  // --- Outcome ---
  if (phase === 'outcome' && lastResult) {
    const isGood = ['single', 'double', 'triple', 'homerun', 'ball'].includes(lastResult.outcome);
    const isHR = lastResult.outcome === 'homerun';
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        {isHR && (
          <div className="text-6xl mb-4 animate-bounce">💥</div>
        )}
        <div className={`text-3xl sm:text-4xl font-black mb-3 ${
          isHR ? 'text-red-400' : isGood ? 'text-green-400' : 'text-slate-300'
        }`}>
          {lastResult.description}
        </div>

        {/* Timing feedback */}
        <div className="text-sm mb-2">
          <span className="text-slate-500">타이밍: </span>
          <span className={
            lastResult.timingQuality === 'perfect' ? 'text-amber-400 font-bold'
            : lastResult.timingQuality === 'good' ? 'text-green-400'
            : 'text-slate-400'
          }>
            {lastResult.timingQuality === 'perfect' ? 'PERFECT!' :
             lastResult.timingQuality === 'good' ? 'GOOD' :
             lastResult.timingQuality === 'early' ? 'EARLY' :
             lastResult.timingQuality === 'late' ? 'LATE' : '-'}
          </span>
        </div>

        {/* Pitch info */}
        <div className="text-slate-500 text-xs mb-6">
          야마모토: {YAMAMOTO_PROFILE.pitches.find(p => p.code === currentPitch?.pitchCode)?.nameKo ?? '?'}
          {currentPitch?.zone && ` (${currentPitch.zone}번 존)`}
        </div>

        <button
          onClick={handleOutcomeNext}
          className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
        >
          다음
        </button>
      </div>
    );
  }

  // --- At-bat result ---
  if (phase === 'at_bat_result') {
    const lastRec = records[records.length - 1];
    const resultText = lastRec?.result === 'strikeout' ? '삼진...'
      : lastRec?.result === 'walk' ? '볼넷! 기회 +1'
      : lastRec?.result === 'homerun' ? '홈런!!! 기회 +2'
      : lastRec?.result === 'hit' ? '안타! 기회 +2'
      : '아웃...';
    const isPositive = lastRec?.result === 'walk' || lastRec?.result === 'hit' || lastRec?.result === 'homerun';
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className={`text-2xl font-black mb-4 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {resultText}
        </div>
        <div className="text-slate-400 text-sm mb-6">
          남은 타석: <span className="text-white font-bold">{atBatsLeft}</span>
          <span className="text-slate-600 mx-2">|</span>
          홈런: <span className="text-red-400 font-bold">{homerunCount}</span>
        </div>
        <button
          onClick={handleNextAtBat}
          className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition-all"
        >
          다음 타석
        </button>
      </div>
    );
  }

  // --- Game result ---
  if (phase === 'game_result') {
    const totalHR = homerunCount;
    const grade = totalHR >= 3 ? 'S' : totalHR >= 2 ? 'A' : totalHR >= 1 ? 'B' : hitCount >= 2 ? 'C' : 'F';
    const gradeLabel = grade === 'S' ? '전설의 타자' : grade === 'A' ? '메이저리그급' : grade === 'B' ? '한방이 있다' : grade === 'C' ? '선방했다' : '야마모토의 완승';
    const gradeColor = grade === 'S' ? 'text-amber-400' : grade === 'A' ? 'text-blue-400' : grade === 'B' ? 'text-green-400' : grade === 'C' ? 'text-slate-300' : 'text-red-400';

    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8 text-center">
        <h2 className="text-slate-400 text-lg mb-1">애국지사 노시환, 야마모토를 이겨라</h2>

        <div className={`text-7xl font-black ${gradeColor} mb-1`}>{grade}</div>
        <div className="text-slate-300 font-medium text-lg mb-6">{gradeLabel}</div>

        {/* Stats */}
        <div className="bg-slate-800/80 rounded-xl border border-slate-700 p-4 mb-6 w-full max-w-xs">
          <div className="grid grid-cols-2 gap-3 text-center">
            <div>
              <div className="text-3xl font-black text-red-400">{totalHR}</div>
              <div className="text-slate-400 text-xs">홈런</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">{hitCount}</div>
              <div className="text-slate-400 text-xs">안타</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{records.length}</div>
              <div className="text-slate-400 text-xs">타석</div>
            </div>
            <div>
              <div className="text-xl font-bold text-white">{records.filter(r => r.result === 'strikeout').length}</div>
              <div className="text-slate-400 text-xs">삼진</div>
            </div>
          </div>
        </div>

        {/* At-bat history */}
        <div className="w-full max-w-xs mb-6">
          {records.map((r, i) => {
            const emoji = r.result === 'homerun' ? '💥' : r.result === 'hit' ? '🟢' : r.result === 'walk' ? '🟡' : r.result === 'strikeout' ? '❌' : '🔴';
            const label = r.result === 'homerun' ? '홈런' : r.result === 'hit' ? '안타' : r.result === 'walk' ? '볼넷' : r.result === 'strikeout' ? '삼진' : '아웃';
            return (
              <div key={i} className="flex items-center justify-between text-sm py-1 border-b border-slate-800">
                <span className="text-slate-500">{i + 1}타석</span>
                <span>{emoji} {label}</span>
                <span className="text-slate-600 text-xs">{r.pitchCount}구</span>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRestart}
            className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-all"
          >
            다시 도전
          </button>
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
          >
            메인으로
          </button>
        </div>
      </div>
    );
  }

  return null;
}
