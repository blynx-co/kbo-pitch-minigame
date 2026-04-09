import { useState, useCallback, useRef, useEffect } from 'react';
import type { Zone } from './data/types';
import { YAMAMOTO_PROFILE } from './data/yamamotoProfile';
import { NOH_SIHWAN } from './data/nohSihwanProfile';
import { yamamotoSelectPitch } from './engine/pitcherAIEngine';
import { determineBattingOutcome, getTimingQuality, type BattingResult } from './engine/battingOutcomeEngine';
import { generatePitchTrajectory } from './engine/outcomeEngine';
import { gameAudio } from './audio/gameAudio';
import BatterViewScene from './components/BatterViewScene';
import type { SwingEffect } from './components/BatterViewScene';

type BattingPhase =
  | 'intro'
  | 'waiting'
  | 'windup'
  | 'pitch_flying'
  | 'impact'         // brief effect animation (1s)
  | 'outcome'
  | 'at_bat_result'
  | 'game_result';

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

  const [currentPitch, setCurrentPitch] = useState<{ pitchCode: string; zone: Zone } | null>(null);
  const [trajectory, setTrajectory] = useState<ReturnType<typeof generatePitchTrajectory> | null>(null);
  const [lastResult, setLastResult] = useState<BattingResult | null>(null);
  const [showNextBtn, setShowNextBtn] = useState(false);
  const [ballLaunched, setBallLaunched] = useState(false);
  const [swingEffect, setSwingEffect] = useState<SwingEffect | null>(null);

  const pitchStartTime = useRef(0);
  const plateTime = useRef(0.5);
  const [soundStarted, setSoundStarted] = useState(false);

  // Delayed "next" button in outcome
  useEffect(() => {
    if (phase === 'outcome') {
      setShowNextBtn(false);
      const timer = setTimeout(() => setShowNextBtn(true), 1800);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  // Impact effect → auto-advance to outcome after delay
  useEffect(() => {
    if (phase === 'impact') {
      const isHR = lastResult?.outcome === 'homerun';
      const delay = isHR ? 1500 : 800; // HR gets longer effect
      const timer = setTimeout(() => {
        setSwingEffect(null);
        setPhase('outcome');
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [phase, lastResult]);

  // Windup → after 3s, launch ball
  useEffect(() => {
    if (phase === 'windup') {
      const timer = setTimeout(() => {
        pitchStartTime.current = Date.now();
        setBallLaunched(true);
        setPhase('pitch_flying');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [phase]);

  const startSound = useCallback(() => {
    if (!soundStarted) {
      gameAudio.preload();
      gameAudio.startAmbient();
      setSoundStarted(true);
    }
  }, [soundStarted]);

  const handleStart = useCallback(() => {
    startSound();
    setPhase('waiting');
  }, [startSound]);

  const handleReady = useCallback(() => {
    // Generate pitch synchronously BEFORE phase change
    const pitch = yamamotoSelectPitch(balls, strikes);
    setCurrentPitch(pitch);
    setBallLaunched(false);

    const traj = generatePitchTrajectory(
      pitch.pitchCode,
      pitch.zone,
      YAMAMOTO_PROFILE.pitches.find(p => p.code === pitch.pitchCode)?.avgSpeed ?? 95,
      'R', 'L',
    );
    setTrajectory(traj);
    plateTime.current = traj.plateTime;
    setPitchesThisAB(prev => prev + 1);
    setLastResult(null);
    setPhase('windup');
  }, [balls, strikes]);

  // Player swings
  const handleSwing = useCallback((zone: Zone) => {
    if (!currentPitch) return;

    let timing: ReturnType<typeof getTimingQuality>;
    if (!ballLaunched) {
      // Swung during windup = too early
      timing = 'early';
    } else {
      const elapsed = (Date.now() - pitchStartTime.current) / 1000;
      const animDuration = plateTime.current * (1 / 0.8); // must match BatterViewScene
      const ratio = elapsed / animDuration;
      timing = getTimingQuality(ratio);
    }

    const result = determineBattingOutcome('swing', zone, currentPitch.zone, currentPitch.pitchCode, timing, strikes);
    setLastResult(result);

    // Set effect for visual impact
    setSwingEffect({ outcome: result.outcome, zone, actualZone: currentPitch.zone });

    // Swing sound
    gameAudio.onPitchOutcome('swinging_strike'); // bat whoosh
    if (result.outcome !== 'swinging_strike') {
      setTimeout(() => gameAudio.onPitchOutcome(result.outcome), 150);
    }

    setPhase('impact');
  }, [phase, currentPitch, ballLaunched]);

  // Ball arrives without swing → take
  const handleAnimationEnd = useCallback(() => {
    if (phase !== 'pitch_flying' || !currentPitch) return;
    const result = determineBattingOutcome('take', null, currentPitch.zone, currentPitch.pitchCode, 'way_off');
    setLastResult(result);
    setSwingEffect(null);
    setPhase('outcome');
  }, [phase, currentPitch]);

  // Process outcome
  const handleOutcomeNext = useCallback(() => {
    if (!lastResult) return;
    const outcome = lastResult.outcome;

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
      if (abResult === 'walk') newAtBatsLeft += 1;
      if (abResult === 'hit') newAtBatsLeft += 2;
      if (abResult === 'homerun') {
        setHomerunCount(prev => prev + 1);
        setHitCount(prev => prev + 1);
        // Homerun = instant victory!
        setRecords(newRecords);
        setAtBatsLeft(newAtBatsLeft);
        gameAudio.stopAmbient();
        gameAudio.onVictory();
        setPhase('game_result');
        return;
      }
      if (abResult === 'hit') setHitCount(prev => prev + 1);
      setAtBatsLeft(newAtBatsLeft);

      if (newAtBatsLeft <= 0) {
        gameAudio.stopAmbient();
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

  const handleNextAtBat = useCallback(() => {
    setBalls(0); setStrikes(0); setPitchesThisAB(0);
    setCurrentAtBat(prev => prev + 1);
    setCurrentPitch(null); setTrajectory(null);
    setLastResult(null); setBallLaunched(false); setSwingEffect(null);
    setPhase('waiting');
  }, []);

  const handleRestart = useCallback(() => {
    gameAudio.stopAmbient();
    setBalls(0); setStrikes(0); setAtBatsLeft(5); setCurrentAtBat(1);
    setPitchesThisAB(0); setHomerunCount(0); setHitCount(0);
    setRecords([]); setCurrentPitch(null); setTrajectory(null);
    setLastResult(null); setSoundStarted(false); setBallLaunched(false); setSwingEffect(null);
    setPhase('intro');
  }, []);

  // === Reusable ===
  const CountDots = ({ label, count, max, color }: { label: string; count: number; max: number; color: string }) => (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-400 font-mono w-3">{label}</span>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${i < count ? color : 'bg-slate-700'}`} />
      ))}
    </div>
  );

  const HUD = () => (
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
  );

  // ===== RENDER =====

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
            <div className="text-slate-400 text-xs">한화 / 우타</div>
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
          <p className="text-slate-300 mb-1">• 야마모토가 와인드업하는 동안 <span className="text-amber-400 font-bold">스윙할 존을 선택</span></p>
          <p className="text-slate-300">• 공이 날아오면 <span className="text-amber-400 font-bold">타이밍에 맞춰 탭!</span></p>
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

  // --- Waiting ---
  if (phase === 'waiting') {
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <HUD />
        <p className="text-slate-400 text-sm mb-6">야마모토가 사인을 확인합니다...</p>
        <button
          onClick={handleReady}
          className="px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          준비 완료
        </button>
      </div>
    );
  }

  // --- Windup + Pitch flying + Impact ---
  if ((phase === 'windup' || phase === 'pitch_flying' || phase === 'impact') && trajectory) {
    return (
      <div className="fixed inset-0 bg-slate-950">
        <HUD />

        {/* Full-screen 3D catcher view — zone grid is inside the 3D scene */}
        <div className="w-full h-full">
          <BatterViewScene
            pitch={trajectory}
            isAnimating={ballLaunched && phase !== 'impact'}
            onAnimationComplete={handleAnimationEnd}
            onSwing={phase !== 'impact' ? handleSwing : undefined}
            effect={swingEffect}
          />
        </div>

        {/* Status + Take button at bottom (z-index below zone grid) */}
        <div className="absolute bottom-[18vh] left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-[5]">
          <div>
            {phase === 'impact' ? (
              <p className="text-white text-lg font-black drop-shadow-lg">
                {lastResult?.description ?? ''}
              </p>
            ) : phase === 'windup' ? (
              <p className="text-amber-400 text-sm font-bold animate-pulse drop-shadow-lg">
                스트라이크 존을 클릭하여 스윙!
              </p>
            ) : (
              <p className="text-red-400 text-sm font-black animate-pulse drop-shadow-lg">
                공이 온다! 존을 클릭!
              </p>
            )}
          </div>
          {phase !== 'impact' && (
            <button
              onClick={handleAnimationEnd}
              className="pointer-events-auto px-4 py-1.5 text-slate-400 text-xs border border-slate-600 rounded-lg hover:text-white bg-slate-900/60 backdrop-blur"
            >
              보내기 (Take)
            </button>
          )}
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
        <HUD />

        {isHR && <div className="text-6xl mb-4 animate-bounce">💥</div>}

        <div className={`text-3xl sm:text-4xl font-black mb-3 ${
          isHR ? 'text-red-400' : isGood ? 'text-green-400' : 'text-slate-300'
        }`}>
          {lastResult.description}
        </div>

        {lastResult.timingQuality !== 'way_off' && (
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
               lastResult.timingQuality === 'late' ? 'LATE' : ''}
            </span>
          </div>
        )}

        <div className="text-slate-500 text-xs mb-6">
          야마모토: {YAMAMOTO_PROFILE.pitches.find(p => p.code === currentPitch?.pitchCode)?.nameKo ?? '?'}
          {' '}{YAMAMOTO_PROFILE.pitches.find(p => p.code === currentPitch?.pitchCode)?.avgSpeed ?? '?'}mph
        </div>

        {showNextBtn ? (
          <button
            onClick={handleOutcomeNext}
            className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all"
          >
            다음
          </button>
        ) : (
          <div className="h-12" />
        )}
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
        <div className={`text-3xl font-black mb-2 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {resultText}
        </div>
        <div className="text-slate-400 text-sm mb-2">{lastRec?.pitchCount}구 승부</div>
        <div className="bg-slate-800/60 rounded-xl border border-slate-700 p-4 mb-6 max-w-xs">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">남은 타석</span>
            <span className="text-white font-bold">{atBatsLeft}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-400">홈런</span>
            <span className="text-red-400 font-bold">{homerunCount}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-slate-400">안타</span>
            <span className="text-green-400 font-bold">{hitCount}</span>
          </div>
        </div>
        <button
          onClick={handleNextAtBat}
          className="px-8 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg transition-all"
        >
          다음 타석으로
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
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8 text-center pb-[20vh]">
        <h2 className="text-slate-400 text-lg mb-1">애국지사 노시환, 야마모토를 이겨라</h2>
        <div className={`text-7xl font-black ${gradeColor} mb-1`}>{grade}</div>
        <div className="text-slate-300 font-medium text-lg mb-6">{gradeLabel}</div>

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
          <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition-all">
            다시 도전
          </button>
          <button onClick={onBack} className="px-6 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold transition-all">
            메인으로
          </button>
        </div>
      </div>
    );
  }

  return null;
}
