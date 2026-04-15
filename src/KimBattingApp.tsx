import { useState, useCallback, useRef, useEffect } from 'react';
import type { Zone } from './data/types';
import { KIM_SEOHYUN_PROFILE } from './data/kimSeoHyunProfile';
import { kimSelectPitch, generateKimPitchTrajectory } from './engine/kimSeoHyunAIEngine';
import type { KimPitch } from './engine/kimSeoHyunAIEngine';
import { determineKimBattingOutcome, getTimingQuality } from './engine/kimBattingOutcomeEngine';
import type { KimBattingResult } from './engine/kimBattingOutcomeEngine';
import { gameAudio } from './audio/gameAudio';
import BatterViewScene from './components/BatterViewScene';
import type { SwingEffect } from './components/BatterViewScene';

type BattingPhase =
  | 'intro'
  | 'waiting'
  | 'windup'
  | 'pitch_flying'
  | 'impact'
  | 'outcome'
  | 'at_bat_result'
  | 'game_result';

interface PARecord {
  result: 'strikeout' | 'walk' | 'hit' | 'homerun' | 'out' | 'hbp' | 'injury';
  pitchCount: number;
}

export default function KimBattingApp({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<BattingPhase>('intro');
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentPA, setCurrentPA] = useState(1);
  const [pitchesThisAB, setPitchesThisAB] = useState(0);
  const [records, setRecords] = useState<PARecord[]>([]);

  const [currentPitch, setCurrentPitch] = useState<KimPitch | null>(null);
  const [trajectory, setTrajectory] = useState<ReturnType<typeof generateKimPitchTrajectory> | null>(null);
  const [lastResult, setLastResult] = useState<KimBattingResult | null>(null);
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

  // Impact effect → auto-advance to outcome
  useEffect(() => {
    if (phase === 'impact') {
      const isHR = lastResult?.outcome === 'homerun';
      const isHBP = lastResult?.outcome === 'hit_by_pitch';
      const delay = isHR ? 1500 : isHBP ? 1200 : 800;
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

  // Z key listener for dodge
  const handleDodgeRef = useRef<(() => void) | null>(null);

  const handleDodge = useCallback(() => {
    if (phase !== 'pitch_flying' || !currentPitch) return;
    const result = determineKimBattingOutcome(
      'dodge', null, currentPitch.zone, currentPitch.pitchCode,
      'way_off', strikes, currentPitch.isAtBatter,
    );
    setLastResult(result);
    setSwingEffect(null);
    setPhase('outcome');
  }, [phase, currentPitch, strikes]);

  handleDodgeRef.current = handleDodge;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'z' || e.key === 'Z' || e.code === 'KeyZ') && handleDodgeRef.current) {
        handleDodgeRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    const pitch = kimSelectPitch(balls, strikes);
    setCurrentPitch(pitch);
    setBallLaunched(false);

    const traj = generateKimPitchTrajectory(
      pitch.pitchCode,
      pitch.zone,
      pitch.speedKmh / 1.609, // km/h → mph for physics
      pitch.isAtBatter,
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
      timing = 'early';
    } else {
      const elapsed = (Date.now() - pitchStartTime.current) / 1000;
      const animDuration = plateTime.current * (1 / 0.8);
      const ratio = elapsed / animDuration;
      timing = getTimingQuality(ratio);
    }

    const result = determineKimBattingOutcome(
      'swing', zone, currentPitch.zone, currentPitch.pitchCode,
      timing, strikes, currentPitch.isAtBatter,
    );
    setLastResult(result);
    setSwingEffect({ outcome: result.outcome, zone, actualZone: currentPitch.zone });

    gameAudio.onPitchOutcome('swinging_strike');
    if (result.outcome !== 'swinging_strike') {
      setTimeout(() => gameAudio.onPitchOutcome(result.outcome), 150);
    }
    setPhase('impact');
  }, [currentPitch, ballLaunched, strikes]);

  // Ball arrives without swing → take (or HBP)
  const handleAnimationEnd = useCallback(() => {
    if (phase !== 'pitch_flying' || !currentPitch) return;

    if (currentPitch.isAtBatter) {
      // HBP!
      const result = determineKimBattingOutcome(
        'take', null, currentPitch.zone, currentPitch.pitchCode,
        'way_off', strikes, true,
      );
      setLastResult(result);
      setSwingEffect({ outcome: 'hit_by_pitch', zone: currentPitch.zone, actualZone: currentPitch.zone });
      setPhase('impact');
    } else {
      // Normal take
      const result = determineKimBattingOutcome(
        'take', null, currentPitch.zone, currentPitch.pitchCode,
        'way_off', strikes, false,
      );
      setLastResult(result);
      setSwingEffect(null);
      setPhase('outcome');
    }
  }, [phase, currentPitch, strikes]);

  // Process outcome
  const handleOutcomeNext = useCallback(() => {
    if (!lastResult) return;
    const outcome = lastResult.outcome;

    let newBalls = balls;
    let newStrikes = strikes;
    let abOver = false;
    let abResult: PARecord['result'] | null = null;

    if (outcome === 'called_strike' || outcome === 'swinging_strike') {
      newStrikes = strikes + 1;
      if (newStrikes >= 3) { abOver = true; abResult = 'strikeout'; }
    } else if (outcome === 'foul') {
      if (strikes < 2) newStrikes = strikes + 1;
    } else if (outcome === 'ball') {
      newBalls = balls + 1;
      if (newBalls >= 4) { abOver = true; abResult = 'walk'; }
    } else if (outcome === 'hit_by_pitch') {
      abOver = true;
      // 30% chance of injury → game over
      abResult = Math.random() < 0.30 ? 'injury' : 'hbp';
    } else if (outcome === 'homerun') {
      abOver = true; abResult = 'homerun';
    } else if (['single', 'double', 'triple'].includes(outcome)) {
      abOver = true; abResult = 'hit';
    } else if (['groundout', 'flyout', 'lineout'].includes(outcome)) {
      abOver = true; abResult = 'out';
    }

    if (abOver && abResult) {
      const rec: PARecord = { result: abResult, pitchCount: pitchesThisAB };
      const newRecords = [...records, rec];
      setRecords(newRecords);

      const isOnBase = ['walk', 'hit', 'homerun', 'hbp'].includes(abResult);

      if (abResult === 'injury') {
        // HBP + injury: streak counts (got on base) but game ends
        setStreak(prev => prev + 1);
        gameAudio.stopAmbient();
        setPhase('game_result');
      } else if (isOnBase) {
        setStreak(prev => prev + 1);
        if (abResult === 'homerun') {
          gameAudio.onPitchOutcome('homerun');
        }
        setPhase('at_bat_result');
      } else {
        // Out! Game over
        gameAudio.stopAmbient();
        setPhase('game_result');
      }
    } else {
      setBalls(newBalls);
      setStrikes(newStrikes);
      setPhase('waiting');
    }
  }, [lastResult, balls, strikes, records, pitchesThisAB]);

  const handleNextAtBat = useCallback(() => {
    setBalls(0); setStrikes(0); setPitchesThisAB(0);
    setCurrentPA(prev => prev + 1);
    setCurrentPitch(null); setTrajectory(null);
    setLastResult(null); setBallLaunched(false); setSwingEffect(null);
    setPhase('waiting');
  }, []);

  const handleRestart = useCallback(() => {
    gameAudio.stopAmbient();
    setBalls(0); setStrikes(0); setStreak(0); setCurrentPA(1);
    setPitchesThisAB(0); setRecords([]);
    setCurrentPitch(null); setTrajectory(null);
    setLastResult(null); setSoundStarted(false); setBallLaunched(false); setSwingEffect(null);
    setPhase('intro');
  }, []);

  // === Reusable HUD components ===
  const CountDots = ({ label, count, max, color }: { label: string; count: number; max: number; color: string }) => (
    <div className="flex items-center gap-1">
      <span className="text-[10px] text-slate-400 font-mono w-3">{label}</span>
      {Array.from({ length: max }, (_, i) => (
        <div key={i} className={`w-3 h-3 rounded-full ${i < count ? color : 'bg-slate-700'}`} />
      ))}
    </div>
  );

  const HUD = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-orange-700/50 px-4 py-2">
      <div className="max-w-lg mx-auto flex items-center justify-between text-sm">
        <div className="text-slate-300 text-xs">
          <span className="text-orange-400 font-bold">{currentPA}</span>번째 타석
        </div>
        <div className="flex flex-col gap-0.5">
          <CountDots label="B" count={balls} max={4} color="bg-green-500" />
          <CountDots label="S" count={strikes} max={3} color="bg-yellow-500" />
        </div>
        <div className="text-right">
          <span className="text-orange-400 text-xs font-bold">연속 출루 {streak}</span>
        </div>
      </div>
    </div>
  );

  // ===== RENDER =====

  if (phase === 'intro') {
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="w-20 h-0.5 bg-orange-500 mb-6 rounded-full" />
        <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">김서현과 승부하기</h1>
        <h2 className="text-xl sm:text-2xl font-black text-orange-400 mb-4">연속 출루 챌린지</h2>
        <div className="flex gap-8 mb-6">
          <div className="text-center">
            <div className="text-4xl mb-1">🏏</div>
            <div className="text-white font-bold">타자</div>
            <div className="text-slate-400 text-xs">우타</div>
          </div>
          <div className="text-slate-500 text-2xl font-black self-center">VS</div>
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-orange-500/20 border-2 border-orange-500 flex items-center justify-center text-2xl mb-1">⚾</div>
            <div className="text-white font-bold">{KIM_SEOHYUN_PROFILE.nameKo}</div>
            <div className="text-orange-400 text-xs">우투 / 제구 난조</div>
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-xl border border-orange-700/50 p-4 mb-6 max-w-xs text-left text-sm">
          <p className="text-slate-300 mb-2">• 아웃 없이 <span className="text-orange-400 font-bold">연속 출루</span>하세요!</p>
          <p className="text-slate-300 mb-2">• 안타, 볼넷, 몸에 맞는 볼 = <span className="text-green-400">출루!</span></p>
          <p className="text-slate-300 mb-2">• 아웃되면 <span className="text-red-400 font-bold">게임 종료</span></p>
          <p className="text-slate-300 mb-2">• 몸에 맞으면 <span className="text-red-400 font-bold">30% 확률로 부상 → 게임 종료</span></p>
          <p className="text-slate-300 mb-2">• 와인드업 중 <span className="text-orange-400 font-bold">스윙할 존을 선택</span></p>
          <p className="text-slate-300 mb-1">• 공이 몸쪽으로 오면 <span className="text-orange-400 font-bold">Z키로 피하기!</span></p>
          <p className="text-slate-500 text-xs mt-2">⚠️ 김서현의 직구(145~158km/h)는 몸쪽으로 크게 휩니다</p>
        </div>
        <button
          onClick={handleStart}
          className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
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
        <p className="text-slate-400 text-sm mb-6">김서현이 사인을 확인합니다...</p>
        <button
          onClick={handleReady}
          className="px-8 py-4 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold text-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
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

        {/* Subtle orange tint for Kim's game */}
        <div className="absolute inset-0 bg-orange-900/5 pointer-events-none z-[2]" />

        {/* Full-screen batter view */}
        <div className="w-full h-full">
          <BatterViewScene
            pitch={trajectory}
            isAnimating={ballLaunched && phase !== 'impact'}
            onAnimationComplete={handleAnimationEnd}
            onSwing={phase !== 'impact' ? handleSwing : undefined}
            effect={swingEffect}
          />
        </div>

        {/* Danger warning when ball is at batter */}
        {phase === 'pitch_flying' && currentPitch?.isAtBatter && ballLaunched && (
          <div className="absolute top-16 left-0 right-0 flex justify-center z-[15] pointer-events-none">
            <div className="text-red-500 text-lg font-black animate-pulse bg-red-900/50 px-4 py-1 rounded-full">
              ⚠️ 위험! 몸쪽으로 온다!
            </div>
          </div>
        )}

        {/* Status + buttons at bottom */}
        <div className="absolute bottom-[18vh] left-0 right-0 flex flex-col items-center gap-2 pointer-events-none z-[5]">
          <div>
            {phase === 'impact' ? (
              <p className="text-white text-lg font-black drop-shadow-lg">
                {lastResult?.description ?? ''}
              </p>
            ) : phase === 'windup' ? (
              <p className="text-orange-400 text-sm font-bold animate-pulse drop-shadow-lg">
                스트라이크 존을 클릭하여 스윙!
              </p>
            ) : (
              <p className="text-red-400 text-sm font-black animate-pulse drop-shadow-lg">
                공이 온다! 존을 클릭!
              </p>
            )}
          </div>
          {phase !== 'impact' && (
            <div className="flex gap-2">
              <button
                onClick={handleAnimationEnd}
                className="pointer-events-auto px-4 py-1.5 text-slate-400 text-xs border border-slate-600 rounded-lg hover:text-white bg-slate-900/60 backdrop-blur"
              >
                보내기 (Take)
              </button>
              <button
                onClick={handleDodge}
                className="pointer-events-auto px-4 py-1.5 text-orange-400 text-xs border border-orange-600 rounded-lg hover:text-orange-200 bg-slate-900/60 backdrop-blur font-bold"
              >
                피하기 (Z)
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- Outcome ---
  if (phase === 'outcome' && lastResult) {
    const isGood = ['single', 'double', 'triple', 'homerun', 'ball', 'hit_by_pitch'].includes(lastResult.outcome);
    const isHR = lastResult.outcome === 'homerun';
    const isHBP = lastResult.outcome === 'hit_by_pitch';
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <HUD />

        {isHR && <div className="text-6xl mb-4 animate-bounce">💥</div>}
        {isHBP && <div className="text-6xl mb-4 animate-bounce">😵</div>}

        <div className={`text-3xl sm:text-4xl font-black mb-3 ${
          isHR ? 'text-red-400' : isHBP ? 'text-yellow-400' : isGood ? 'text-green-400' : 'text-slate-300'
        }`}>
          {lastResult.description}
        </div>

        {lastResult.timingQuality !== 'way_off' && lastResult.outcome !== 'hit_by_pitch' && lastResult.outcome !== 'ball' && lastResult.outcome !== 'called_strike' && (
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
          김서현: {KIM_SEOHYUN_PROFILE.pitches.find(p => p.code === currentPitch?.pitchCode)?.nameKo ?? '?'}
          {' '}{currentPitch?.speedKmh ?? '?'}km/h
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

  // --- At-bat result (on-base!) ---
  if (phase === 'at_bat_result') {
    const lastRec = records[records.length - 1];
    const resultText = lastRec?.result === 'walk' ? '볼넷! 출루!'
      : lastRec?.result === 'homerun' ? '홈런!!! 출루!'
      : lastRec?.result === 'hit' ? '안타! 출루!'
      : lastRec?.result === 'hbp' ? '몸에 맞는 볼! 출루!'
      : '출루!';
    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 text-center">
        <div className="text-green-400 text-3xl font-black mb-2">{resultText}</div>
        <div className="text-slate-400 text-sm mb-2">{lastRec?.pitchCount}구 승부</div>
        <div className="bg-slate-800/60 rounded-xl border border-orange-700/50 p-4 mb-6 max-w-xs">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">연속 출루</span>
            <span className="text-orange-400 font-bold text-xl">{streak}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="text-slate-400">다음 타석</span>
            <span className="text-white font-bold">{currentPA + 1}번째</span>
          </div>
        </div>
        <button
          onClick={handleNextAtBat}
          className="px-8 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-slate-900 font-bold text-lg transition-all"
        >
          다음 타석으로
        </button>
      </div>
    );
  }

  // --- Game result (out — game over) ---
  if (phase === 'game_result') {
    const gradeMsg = streak === 0 ? '첫 타석부터 아웃...'
      : streak <= 2 ? '아쉬운 결과...'
      : streak <= 5 ? '좋은 눈!'
      : streak <= 9 ? '출루 머신!'
      : streak <= 14 ? '프로 선구안!'
      : streak <= 19 ? '전설의 타자!'
      : '연속 출루의 신!';

    const gradeColor = streak === 0 ? 'text-red-400'
      : streak <= 2 ? 'text-slate-400'
      : streak <= 5 ? 'text-green-400'
      : streak <= 9 ? 'text-blue-400'
      : streak <= 14 ? 'text-purple-400'
      : 'text-amber-400';

    const hitCount = records.filter(r => r.result === 'hit').length;
    const hrCount = records.filter(r => r.result === 'homerun').length;
    const walkCount = records.filter(r => r.result === 'walk').length;
    const hbpCount = records.filter(r => r.result === 'hbp' || r.result === 'injury').length;
    const isInjury = records[records.length - 1]?.result === 'injury';

    return (
      <div className="min-h-[calc(100vh-22vh)] bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center px-4 py-8 text-center pb-[20vh]">
        <h2 className="text-slate-400 text-lg mb-1">김서현과 승부하기</h2>
        {isInjury && <div className="text-4xl mb-2">🏥</div>}
        <div className="text-7xl font-black text-orange-400 mb-1">{streak}</div>
        <div className="text-slate-300 font-medium text-lg mb-1">연속 출루</div>
        {isInjury && <div className="text-red-400 text-sm font-bold mb-2">부상으로 게임 종료!</div>}
        <div className={`text-sm mb-6 font-bold ${gradeColor}`}>{gradeMsg}</div>

        <div className="bg-slate-800/80 rounded-xl border border-orange-700/50 p-4 mb-6 w-full max-w-xs">
          <div className="grid grid-cols-4 gap-3 text-center">
            <div>
              <div className="text-2xl font-black text-white">{hitCount}</div>
              <div className="text-slate-400 text-xs">안타</div>
            </div>
            <div>
              <div className="text-2xl font-black text-red-400">{hrCount}</div>
              <div className="text-slate-400 text-xs">홈런</div>
            </div>
            <div>
              <div className="text-2xl font-black text-green-400">{walkCount}</div>
              <div className="text-slate-400 text-xs">볼넷</div>
            </div>
            <div>
              <div className="text-2xl font-black text-yellow-400">{hbpCount}</div>
              <div className="text-slate-400 text-xs">사구</div>
            </div>
          </div>
        </div>

        {/* PA history */}
        <div className="w-full max-w-xs mb-6">
          {records.map((r, i) => {
            const emoji = r.result === 'homerun' ? '💥' : r.result === 'hit' ? '🟢' : r.result === 'walk' ? '🟡' : r.result === 'hbp' ? '🔵' : r.result === 'injury' ? '🏥' : r.result === 'strikeout' ? '❌' : '🔴';
            const label = r.result === 'homerun' ? '홈런' : r.result === 'hit' ? '안타' : r.result === 'walk' ? '볼넷' : r.result === 'hbp' ? '사구' : r.result === 'injury' ? '부상(사구)' : r.result === 'strikeout' ? '삼진' : '아웃';
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
          <button onClick={handleRestart} className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold transition-all">
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
