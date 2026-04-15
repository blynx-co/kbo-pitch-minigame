import { useState, useCallback } from 'react';
import type {
  GamePhase,
  GameMode,
  Difficulty,
  AtBatState,
  Zone,
  PitchOutcome,
  PitchTrajectory,
  AtBatOutcome,
  KorPitcherProfile,
  DomLineup,
  BatterProfile,
  PitchOption,
} from './data/types';
import { SCENARIOS } from './data/scenarios';
import { BATTER_PROFILES } from './data/batterProfiles';
import { PITCHER_REPERTOIRE } from './data/pitcherRepertoire';
import { DOM_BATTER_PROFILES } from './data/domBatterProfiles';
import { DOM_LINEUPS } from './data/domLineups';
import { KOR_PITCHERS } from './data/korPitcherProfiles';
import { determinePitchOutcome, generatePitchTrajectory } from './engine/outcomeEngine';
import type { FamiliarityContext } from './engine/outcomeEngine';
import { scorePitch, scoreAtBat, calculateTotalScore, calculateLeadScore } from './utils/scoring';
import type { AtBatSummary } from './utils/scoring';
import GameIntro from './components/GameIntro';
import PitchSelector from './components/PitchSelector';
import PitchScene from './components/PitchScene';
import OutcomeDisplay from './components/OutcomeDisplay';
import AtBatResult from './components/AtBatResult';
import GameResult from './components/GameResult';
import HUD from './components/HUD';
import ModeSelect from './components/ModeSelect';
import PitcherSelect from './components/PitcherSelect';
import LineupSelect from './components/LineupSelect';
import DifficultySelect from './components/DifficultySelect';
import MissNotify from './components/MissNotify';
import ScenarioSelect from './components/ScenarioSelect';
import LanguageToggle from './components/LanguageToggle';
import { SCENARIO_MODES } from './data/lorenzenScenarios';
import type { ScenarioMode, ScenarioAtBat } from './data/lorenzenScenarios';
import { LORENZEN_PROFILE } from './data/lorenzenProfile';
import { USA_BATTER_PROFILES } from './data/usaBatterProfiles';
import { CAN_BATTER_PROFILES } from './data/canBatterProfiles';
import { USA_PITCHERS } from './data/usaPitcherProfiles';
import { CAN_PITCHERS } from './data/canPitcherProfiles';
import { USA_LINEUPS } from './data/usaLineups';
import { CAN_LINEUPS } from './data/canLineups';
import { KBO_BATTER_PROFILES } from './data/kboBatterProfiles';
import { KBO_PITCHERS } from './data/kboPitcherProfiles';
import { KBO_LINEUPS } from './data/kboLineups';
import InningTransition from './components/InningTransition';
import { gameAudio } from './audio/gameAudio';
import BattingApp from './BattingApp';
import KimBattingApp from './KimBattingApp';
import { useLanguage } from './i18n/LanguageContext';

const TOTAL_AT_BATS_JAPAN = SCENARIOS.length;

// --- KBO helpers ---
function generateHanwhaScoring(): number[] {
  // Average ~8.6 runs per game. base(6) + two dice(0-3 each) = 6-12, avg ~9
  const base = 6;
  const extra = Math.floor(Math.random() * 4) + Math.floor(Math.random() * 4);
  const total = base + extra;
  const scores = new Array(9).fill(0);
  for (let i = 0; i < total; i++) {
    scores[Math.floor(Math.random() * 9)]++;
  }
  return scores;
}

function processKboBaseRunning(
  bases: [boolean, boolean, boolean],
  result: AtBatOutcome,
): { newBases: [boolean, boolean, boolean]; runsScored: number } {
  let [b1, b2, b3] = [...bases] as [boolean, boolean, boolean];
  let runs = 0;

  if (result.type === 'walk') {
    if (b1 && b2 && b3) runs++;
    if (b1 && b2) b3 = true;
    if (b1) b2 = true;
    b1 = true;
  } else if (result.type === 'hit') {
    switch (result.result) {
      case 'single':
        if (b3) { runs++; }
        b3 = b2; b2 = b1; b1 = true;
        break;
      case 'double':
        if (b3) runs++;
        if (b2) runs++;
        b3 = b1; b2 = true; b1 = false;
        break;
      case 'triple':
        if (b1) runs++;
        if (b2) runs++;
        if (b3) runs++;
        b1 = false; b2 = false; b3 = true;
        break;
      case 'homerun':
        if (b1) runs++;
        if (b2) runs++;
        if (b3) runs++;
        runs++; // batter scores
        b1 = false; b2 = false; b3 = false;
        break;
    }
  }

  return { newBases: [b1, b2, b3], runsScored: runs };
}

function isAtBatOver(
  outcome: PitchOutcome,
  balls: number,
  strikes: number,
): { over: boolean; result: AtBatOutcome | null } {
  // In-play outcomes immediately end the at-bat
  if (['single', 'double', 'triple', 'homerun'].includes(outcome)) {
    return {
      over: true,
      result: { type: 'hit', result: outcome as 'single' | 'double' | 'triple' | 'homerun' },
    };
  }
  if (['groundout', 'flyout', 'lineout'].includes(outcome)) {
    return {
      over: true,
      result: { type: 'out', result: outcome as 'groundout' | 'flyout' | 'lineout' },
    };
  }

  // Count-based endings
  if (outcome === 'swinging_strike' || outcome === 'called_strike') {
    if (strikes + 1 >= 3) {
      return { over: true, result: { type: 'strikeout' } };
    }
  }
  if (outcome === 'ball') {
    if (balls + 1 >= 4) {
      return { over: true, result: { type: 'walk' } };
    }
  }

  return { over: false, result: null };
}

function updateCount(
  outcome: PitchOutcome,
  balls: number,
  strikes: number,
): { balls: number; strikes: number } {
  switch (outcome) {
    case 'called_strike':
    case 'swinging_strike':
      return { balls, strikes: Math.min(strikes + 1, 3) };
    case 'foul':
      // Foul with 2 strikes doesn't add a strike
      return { balls, strikes: strikes < 2 ? strikes + 1 : strikes };
    case 'ball':
      return { balls: Math.min(balls + 1, 4), strikes };
    default:
      // In-play outcomes don't change count
      return { balls, strikes };
  }
}

export default function App() {
  const { lang, playerName, t } = useLanguage();
  const [phase, setPhase] = useState<GamePhase>('mode_select');
  const [gameMode, setGameMode] = useState<GameMode>('japan');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [selectedPitcher, setSelectedPitcher] = useState<KorPitcherProfile | null>(null);
  const [selectedLineup, setSelectedLineup] = useState<DomLineup | null>(null);
  const [atBat, setAtBat] = useState<AtBatState>({
    scenarioIndex: 0,
    balls: 0,
    strikes: 0,
    pitchHistory: [],
    result: null,
  });
  const [completedAtBats, setCompletedAtBats] = useState<AtBatSummary[]>([]);
  const [currentTrajectory, setCurrentTrajectory] = useState<PitchTrajectory | null>(null);
  const [lastOutcome, setLastOutcome] = useState<{
    outcome: PitchOutcome;
    pitchCode: string;
    zone: Zone;
    actualZone: Zone;
    newBalls: number;
    newStrikes: number;
  } | null>(null);
  const [atBatOver, setAtBatOver] = useState<{ result: AtBatOutcome; score: number } | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioMode | null>(null);
  const [selectedAtBats, setSelectedAtBats] = useState<ScenarioAtBat[]>([]);

  // KBO 9-inning state
  const [kboInning, setKboInning] = useState(1);
  const [kboOuts, setKboOuts] = useState(0);
  const [kboBases, setKboBases] = useState<[boolean, boolean, boolean]>([false, false, false]);
  const [kboKiaScore, setKboKiaScore] = useState(0);
  const [kboHanwhaScore, setKboHanwhaScore] = useState(0);
  const [kboKiaInningScores, setKboKiaInningScores] = useState<number[]>([]);
  const [kboHanwhaInningScores, setKboHanwhaInningScores] = useState<number[]>([]);
  const [kboKiaThisInning, setKboKiaThisInning] = useState(0);
  const [kboBatterOrder, setKboBatterOrder] = useState(0);
  const [isChangingPitcher, setIsChangingPitcher] = useState(false);
  const [returnPhaseAfterChange, setReturnPhaseAfterChange] = useState<'pitch_select' | 'inning_transition'>('pitch_select');
  // Pitch count tracking per pitcher: { pitcherId: count }
  const [kboPitchCounts, setKboPitchCounts] = useState<Record<string, number>>({});
  const [kboFatigueNotified, setKboFatigueNotified] = useState(false);
  // Game-wide pitch type usage counts (for familiarity)
  const [kboGamePitchCounts, setKboGamePitchCounts] = useState<Record<string, number>>({});
  // How many completed at-bats per batter ID (for lineup cycle bonus)
  const [kboBatterFaceCounts, setKboBatterFaceCounts] = useState<Record<string, number>>({});
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Derived data based on mode
  const totalAtBats = gameMode === 'scenario'
    ? (selectedScenario?.selectCount ?? 5)
    : gameMode === 'kbo'
      ? 999 // KBO: ends by inning count, not at-bat count
      : (gameMode === 'dom' || gameMode === 'usa' || gameMode === 'can')
        ? (selectedLineup?.batterIds.length ?? 9)
        : TOTAL_AT_BATS_JAPAN;

  // Current batter/pitcher based on mode
  let batter: BatterProfile | null = null;
  let pitcher: { pitches: PitchOption[]; hand: 'L' | 'R'; nameKo: string; id: string } | null = null;
  let scenario = undefined as ReturnType<typeof Object.assign> | undefined;

  if (gameMode === 'japan') {
    const sc = SCENARIOS[atBat.scenarioIndex];
    scenario = sc;
    batter = sc ? BATTER_PROFILES[sc.batterId] : null;
    const pitcherData = sc ? PITCHER_REPERTOIRE[sc.pitcherId] : null;
    pitcher = pitcherData
      ? { pitches: pitcherData.pitches, hand: pitcherData.hand, nameKo: pitcherData.nameKo, id: sc.pitcherId }
      : null;
  } else if (gameMode === 'dom' && selectedLineup && selectedPitcher) {
    const batterId = selectedLineup.batterIds[atBat.scenarioIndex];
    batter = batterId ? DOM_BATTER_PROFILES[batterId] : null;
    pitcher = { pitches: selectedPitcher.pitches, hand: selectedPitcher.hand, nameKo: selectedPitcher.nameKo, id: selectedPitcher.id };
  } else if (gameMode === 'usa' && selectedLineup && selectedPitcher) {
    // Beat USA: CAN pitcher vs USA batters
    const batterId = selectedLineup.batterIds[atBat.scenarioIndex];
    batter = batterId ? (USA_BATTER_PROFILES[batterId] ?? null) : null;
    pitcher = { pitches: selectedPitcher.pitches, hand: selectedPitcher.hand, nameKo: selectedPitcher.nameKo, id: selectedPitcher.id };
  } else if (gameMode === 'can' && selectedLineup && selectedPitcher) {
    // Beat CAN: USA pitcher vs CAN batters
    const batterId = selectedLineup.batterIds[atBat.scenarioIndex];
    batter = batterId ? (CAN_BATTER_PROFILES[batterId] ?? null) : null;
    pitcher = { pitches: selectedPitcher.pitches, hand: selectedPitcher.hand, nameKo: selectedPitcher.nameKo, id: selectedPitcher.id };
  } else if (gameMode === 'kbo' && selectedLineup && selectedPitcher) {
    // KBO 9-inning: cycle through 1-9 lineup
    const batterIdx = kboBatterOrder % selectedLineup.batterIds.length;
    const batterId = selectedLineup.batterIds[batterIdx];
    batter = batterId ? (KBO_BATTER_PROFILES[batterId] ?? null) : null;
    pitcher = { pitches: selectedPitcher.pitches, hand: selectedPitcher.hand, nameKo: selectedPitcher.nameKo, id: selectedPitcher.id };
  } else if (gameMode === 'scenario' && selectedScenario && selectedAtBats.length > 0) {
    const scenarioAtBat = selectedAtBats[atBat.scenarioIndex];
    if (scenarioAtBat) {
      batter = USA_BATTER_PROFILES[scenarioAtBat.batterId] ?? null;
      // Use the scenario's pitcher profile
      if (selectedScenario.pitcherId === 'lorenzen') {
        pitcher = { pitches: LORENZEN_PROFILE.pitches, hand: LORENZEN_PROFILE.hand, nameKo: LORENZEN_PROFILE.nameKo, id: LORENZEN_PROFILE.id };
      }
    }
  }

  // Handlers
  const handleSelectMode = useCallback((mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'batting' || mode === 'kim_batting') {
      setPhase('intro'); // BattingApp/KimBattingApp manages its own phases
    } else if (mode === 'scenario') {
      setPhase('scenario_select');
    } else {
      setPhase('difficulty_select');
    }
  }, []);

  const handleSelectDifficulty = useCallback((diff: Difficulty) => {
    setDifficulty(diff);
    if (gameMode === 'japan') {
      setPhase('intro');
    } else if (gameMode === 'scenario') {
      // Scenario mode: random select at-bats and start
      if (selectedScenario) {
        const shuffled = [...selectedScenario.atBats].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, selectedScenario.selectCount);
        setSelectedAtBats(selected);
        setAtBat({ scenarioIndex: 0, balls: 0, strikes: 0, pitchHistory: [], result: null });
        setPhase('pitch_select');
      }
    } else {
      setPhase('pitcher_select');
    }
  }, [gameMode, selectedScenario]);

  const handleBackToModeSelectFromDifficulty = useCallback(() => {
    setPhase('mode_select');
  }, []);

  const handleSelectScenario = useCallback((sc: ScenarioMode) => {
    setSelectedScenario(sc);
    setPhase('difficulty_select');
  }, []);

  const handleBackToModeSelectFromScenario = useCallback(() => {
    setPhase('mode_select');
    setSelectedScenario(null);
  }, []);

  const handleSelectPitcher = useCallback((p: KorPitcherProfile) => {
    setSelectedPitcher(p);
    setKboFatigueNotified(false);
    if (isChangingPitcher) {
      setIsChangingPitcher(false);
      setPhase(returnPhaseAfterChange);
    } else {
      setPhase('lineup_select');
    }
  }, [isChangingPitcher, returnPhaseAfterChange]);

  const handleSelectLineup = useCallback((lineup: DomLineup) => {
    setSelectedLineup(lineup);
    setAtBat({ scenarioIndex: 0, balls: 0, strikes: 0, pitchHistory: [], result: null });
    if (gameMode === 'kbo') {
      // Start audio (user click = gesture, browser allows it)
      gameAudio.preload();
      gameAudio.startAmbient();
      setSoundEnabled(true);
      const scores = generateHanwhaScoring();
      setKboHanwhaInningScores(scores);
      setKboHanwhaScore(0); // revealed incrementally
      setKboKiaScore(0);
      setKboKiaInningScores([]);
      setKboKiaThisInning(0);
      setKboInning(1);
      setKboOuts(0);
      setKboBases([false, false, false]);
      setKboBatterOrder(0);
    }
    setPhase('pitch_select');
  }, [gameMode]);

  const handleBackToModeSelect = useCallback(() => {
    if (isChangingPitcher) {
      // Cancel pitcher change, go back to game
      setIsChangingPitcher(false);
      setPhase(returnPhaseAfterChange);
      return;
    }
    setPhase('mode_select');
    setSelectedPitcher(null);
    setSelectedLineup(null);
  }, [isChangingPitcher, returnPhaseAfterChange]);

  const handleBackToPitcherSelect = useCallback(() => {
    setPhase('pitcher_select');
    setSelectedLineup(null);
  }, []);

  const handleStart = useCallback(() => {
    setPhase('pitch_select');
  }, []);

  const handlePitchSelect = useCallback(
    (pitchCode: string, zone: Zone) => {
      if (!batter || !pitcher) return;

      // Find the selected pitch option for speed
      const pitchOption = pitcher.pitches.find((p) => p.code === pitchCode);
      let avgSpeed = pitchOption?.avgSpeed || 90;

      // KBO fatigue: check if pitcher exceeded pitch limit
      const pitcherId = selectedPitcher?.id ?? '';
      const currentCount = kboPitchCounts[pitcherId] ?? 0;
      const pitchLimit = selectedPitcher?.pitchLimit ?? 999;
      const isFatigued = gameMode === 'kbo' && currentCount >= pitchLimit;

      if (isFatigued) {
        // Speed drops ~3 km/h ≈ 2 mph
        avgSpeed = Math.max(avgSpeed - 2, 60);
      }

      // Increment pitch count for KBO
      if (gameMode === 'kbo' && pitcherId) {
        setKboPitchCounts(prev => ({ ...prev, [pitcherId]: currentCount + 1 }));
        if (currentCount + 1 === pitchLimit && !kboFatigueNotified) {
          setKboFatigueNotified(true);
        }
        // Track game-wide pitch type usage
        setKboGamePitchCounts(prev => ({ ...prev, [pitchCode]: (prev[pitchCode] ?? 0) + 1 }));
      }

      // Build hard mode context
      const hardCtx = (difficulty === 'hard' || isFatigued) ? {
        pitchHistory: atBat.pitchHistory,
        pitchSpeed: avgSpeed,
        difficulty: difficulty === 'hard' ? 'hard' as const : 'normal' as const,
        fatigued: isFatigued,
      } : undefined;

      // Build familiarity context for KBO
      const famCtx: FamiliarityContext | undefined = gameMode === 'kbo' ? {
        gamePitchCounts: kboGamePitchCounts,
        batterTimesFaced: kboBatterFaceCounts[batter.id] ?? 0,
      } : undefined;

      // Determine outcome
      const { outcome, actualZone } = determinePitchOutcome(
        batter.id,
        pitchCode,
        zone,
        atBat.balls,
        atBat.strikes,
        hardCtx,
        famCtx,
      );

      // Generate trajectory — use actualZone for animation target
      const batSide = batter.bats === 'S' ? 'R' : batter.bats;
      const trajectory = generatePitchTrajectory(
        pitchCode,
        actualZone,
        avgSpeed,
        pitcher.hand,
        batSide,
      );

      // Calculate new count
      const newCount = updateCount(outcome, atBat.balls, atBat.strikes);

      setCurrentTrajectory(trajectory);
      setLastOutcome({
        outcome,
        pitchCode,
        zone,
        actualZone,
        newBalls: newCount.balls,
        newStrikes: newCount.strikes,
      });

      // Show miss notification before animation if pitch missed target zone
      if ((difficulty === 'hard' || isFatigued) && actualZone !== zone) {
        setPhase('miss_notify');
      } else {
        setPhase('animating');
      }
    },
    [batter, pitcher, atBat.balls, atBat.strikes, difficulty, atBat.pitchHistory, gameMode, selectedPitcher, kboPitchCounts, kboFatigueNotified, kboGamePitchCounts, kboBatterFaceCounts],
  );

  const handleMissNotifyDone = useCallback(() => {
    setPhase('animating');
  }, []);

  const handleAnimationComplete = useCallback(() => {
    if (gameMode === 'kbo' && soundEnabled && lastOutcome) {
      gameAudio.onPitchOutcome(lastOutcome.outcome);
    }
    setPhase('outcome');
  }, [gameMode, soundEnabled, lastOutcome]);

  const handleOutcomeNext = useCallback(() => {
    if (!lastOutcome) return;

    const { outcome, pitchCode, zone, actualZone, newBalls, newStrikes } = lastOutcome;
    const pitchScore = scorePitch(outcome, actualZone);

    // Add pitch to history (includes actualZone for hard mode tracking)
    const newPitch = { pitchCode, zone, actualZone, outcome, score: pitchScore };
    const newHistory = [...atBat.pitchHistory, newPitch];

    // Check if at-bat is over
    const { over, result } = isAtBatOver(outcome, atBat.balls, atBat.strikes);

    if (over && result) {
      // At-bat result sound
      if (gameMode === 'kbo' && soundEnabled) {
        gameAudio.onAtBatResult(result.type);
      }
      // Calculate at-bat score
      const abBonus = scoreAtBat(result);
      const pitchTotal = newHistory.reduce((s, p) => s + p.score, 0);
      const abScore = pitchTotal + abBonus;

      setAtBat((prev) => ({
        ...prev,
        balls: newBalls,
        strikes: newStrikes,
        pitchHistory: newHistory,
        result,
      }));
      setAtBatOver({ result, score: abScore });
      setPhase('at_bat_result');
    } else {
      // Continue at-bat
      setAtBat((prev) => ({
        ...prev,
        balls: newBalls,
        strikes: newStrikes,
        pitchHistory: newHistory,
      }));
      setPhase('pitch_select');
    }
  }, [lastOutcome, atBat]);

  const handleAtBatNext = useCallback(() => {
    if (!atBatOver) return;

    // Determine batterId based on mode
    let batterId: string;
    if (gameMode === 'japan') {
      batterId = scenario?.batterId ?? '';
    } else if (gameMode === 'scenario') {
      batterId = selectedAtBats[atBat.scenarioIndex]?.batterId ?? '';
    } else if (gameMode === 'kbo' && selectedLineup) {
      const batterIdx = kboBatterOrder % selectedLineup.batterIds.length;
      batterId = selectedLineup.batterIds[batterIdx] ?? '';
    } else {
      batterId = selectedLineup?.batterIds[atBat.scenarioIndex] ?? '';
    }

    // Record completed at-bat
    const summary: AtBatSummary = {
      batterId,
      pitchHistory: atBat.pitchHistory,
      outcome: atBatOver.result,
      totalScore: atBatOver.score,
    };

    const newCompletedAtBats = [...completedAtBats, summary];
    setCompletedAtBats(newCompletedAtBats);

    // --- KBO 9-inning logic ---
    if (gameMode === 'kbo') {
      // Track batter face count (for lineup cycle bonus)
      setKboBatterFaceCounts(prev => ({ ...prev, [batterId]: (prev[batterId] ?? 0) + 1 }));

      const result = atBatOver.result;
      const isOut = result.type === 'strikeout' || result.type === 'out';

      // Process base-running for hits/walks
      let newOuts = kboOuts;

      if (isOut) {
        newOuts = kboOuts + 1;
        setKboOuts(newOuts);
      } else {
        const br = processKboBaseRunning(kboBases, result);
        setKboBases(br.newBases);
        setKboKiaScore(prev => prev + br.runsScored);
        setKboKiaThisInning(prev => prev + br.runsScored);
      }

      const nextBatterOrder = kboBatterOrder + 1;
      setKboBatterOrder(nextBatterOrder);

      if (newOuts >= 3) {
        // Inning over → show transition
        setPhase('inning_transition');
      } else {
        // Next batter in same inning
        setAtBat({
          scenarioIndex: atBat.scenarioIndex + 1,
          balls: 0,
          strikes: 0,
          pitchHistory: [],
          result: null,
        });
        setAtBatOver(null);
        setLastOutcome(null);
        setCurrentTrajectory(null);
        setPhase('pitch_select');
      }
      return;
    }

    // --- Non-KBO modes (original logic) ---
    const nextIndex = atBat.scenarioIndex + 1;

    if (nextIndex >= totalAtBats) {
      setPhase('game_result');
    } else {
      setAtBat({
        scenarioIndex: nextIndex,
        balls: 0,
        strikes: 0,
        pitchHistory: [],
        result: null,
      });
      setAtBatOver(null);
      setLastOutcome(null);
      setCurrentTrajectory(null);
      setPhase('pitch_select');
    }
  }, [atBatOver, scenario, atBat, completedAtBats, gameMode, selectedLineup, selectedAtBats, totalAtBats, kboBatterOrder, kboOuts, kboBases]);

  const handleChangePitcher = useCallback((fromPhase: 'pitch_select' | 'inning_transition') => {
    setIsChangingPitcher(true);
    setReturnPhaseAfterChange(fromPhase);
    setPhase('pitcher_select');
  }, []);

  const handleInningNext = useCallback(() => {
    // Record KIA's inning score
    const newKiaInningScores = [...kboKiaInningScores, kboKiaThisInning];
    setKboKiaInningScores(newKiaInningScores);

    // Reveal Hanwha's score for this inning
    const hanwhaThisInning = kboHanwhaInningScores[kboInning - 1] ?? 0;
    setKboHanwhaScore(prev => prev + hanwhaThisInning);

    if (kboInning >= 9) {
      // Game over
      gameAudio.stopAmbient();
      const finalHanwha = kboHanwhaScore + hanwhaThisInning;
      const finalKia = kboKiaScore;
      if (soundEnabled) {
        if (finalHanwha > finalKia) gameAudio.onVictory();
        else gameAudio.onDefeat();
      }
      setPhase('game_result');
    } else {
      // Next inning
      setKboInning(prev => prev + 1);
      setKboOuts(0);
      setKboBases([false, false, false]);
      setKboKiaThisInning(0);
      setAtBat(prev => ({
        scenarioIndex: prev.scenarioIndex + 1,
        balls: 0,
        strikes: 0,
        pitchHistory: [],
        result: null,
      }));
      setAtBatOver(null);
      setLastOutcome(null);
      setCurrentTrajectory(null);
      setPhase('pitch_select');
    }
  }, [kboInning, kboKiaThisInning, kboKiaInningScores, kboHanwhaInningScores]);

  const handleRestart = useCallback(() => {
    gameAudio.stopAmbient();
    setSoundEnabled(false);
    setPhase('mode_select');
    setGameMode('japan');
    setDifficulty('normal');
    setSelectedPitcher(null);
    setSelectedLineup(null);
    setSelectedScenario(null);
    setSelectedAtBats([]);
    setAtBat({
      scenarioIndex: 0,
      balls: 0,
      strikes: 0,
      pitchHistory: [],
      result: null,
    });
    setCompletedAtBats([]);
    setCurrentTrajectory(null);
    setLastOutcome(null);
    setAtBatOver(null);
    // Reset KBO state
    setKboInning(1);
    setKboOuts(0);
    setKboBases([false, false, false]);
    setKboKiaScore(0);
    setKboHanwhaScore(0);
    setKboKiaInningScores([]);
    setKboHanwhaInningScores([]);
    setKboKiaThisInning(0);
    setKboBatterOrder(0);
    setIsChangingPitcher(false);
    setKboPitchCounts({});
    setKboFatigueNotified(false);
    setKboGamePitchCounts({});
    setKboBatterFaceCounts({});
  }, []);

  // Render based on phase
  const content = (() => {
    // Batting modes have their own self-contained apps
    if (gameMode === 'batting' && phase !== 'mode_select') {
      return <BattingApp onBack={handleRestart} />;
    }
    if (gameMode === 'kim_batting' && phase !== 'mode_select') {
      return <KimBattingApp onBack={handleRestart} />;
    }

    switch (phase) {
      case 'mode_select':
        return <ModeSelect onSelectMode={handleSelectMode} />;

      case 'difficulty_select':
        return (
          <DifficultySelect
            gameMode={gameMode}
            onSelect={handleSelectDifficulty}
            onBack={handleBackToModeSelectFromDifficulty}
          />
        );

      case 'intro':
        return <GameIntro onStart={handleStart} />;

      case 'pitcher_select': {
        const pitcherList = gameMode === 'usa' ? CAN_PITCHERS
          : gameMode === 'can' ? USA_PITCHERS
          : gameMode === 'kbo' ? KBO_PITCHERS
          : KOR_PITCHERS;
        return (
          <PitcherSelect
            pitchers={pitcherList}
            onSelect={handleSelectPitcher}
            onBack={handleBackToModeSelect}
          />
        );
      }

      case 'lineup_select': {
        const lineupList = gameMode === 'usa' ? USA_LINEUPS
          : gameMode === 'can' ? CAN_LINEUPS
          : gameMode === 'kbo' ? KBO_LINEUPS
          : DOM_LINEUPS;
        const batterProfileMap = gameMode === 'usa' ? USA_BATTER_PROFILES
          : gameMode === 'can' ? CAN_BATTER_PROFILES
          : gameMode === 'kbo' ? KBO_BATTER_PROFILES
          : DOM_BATTER_PROFILES;
        return (
          <LineupSelect
            lineups={lineupList}
            batterProfiles={batterProfileMap}
            onSelect={handleSelectLineup}
            onBack={handleBackToPitcherSelect}
          />
        );
      }

      case 'scenario_select':
        return (
          <ScenarioSelect
            scenarios={SCENARIO_MODES}
            onSelect={handleSelectScenario}
            onBack={handleBackToModeSelectFromScenario}
          />
        );

      case 'pitch_select':
        if (!batter || !pitcher) return null;
        return (
          <>
            <HUD
              scenario={scenario}
              balls={atBat.balls}
              strikes={atBat.strikes}
              outs={gameMode === 'kbo' ? kboOuts : (scenario?.outs ?? 0)}
              currentAtBat={gameMode === 'kbo' ? (kboBatterOrder % 9) + 1 : atBat.scenarioIndex + 1}
              totalAtBats={gameMode === 'kbo' ? 9 : totalAtBats}
              pitcherName={playerName(pitcher.nameKo, pitcher.id)}
              batterName={playerName(batter.nameKo, batter.id)}
              gameMode={gameMode}
              kboInning={kboInning}
              kboHanwhaScore={kboHanwhaScore}
              kboKiaScore={kboKiaScore}
              kboBases={kboBases}
            />
            <PitchSelector
              pitches={pitcher.pitches}
              batSide={batter.bats === 'S' ? 'R' : batter.bats}
              onSelect={handlePitchSelect}
              balls={atBat.balls}
              strikes={atBat.strikes}
            />
            {gameMode === 'kbo' && selectedPitcher && (() => {
              const pid = selectedPitcher.id;
              const cnt = kboPitchCounts[pid] ?? 0;
              const lim = selectedPitcher.pitchLimit ?? 999;
              const over = cnt >= lim;
              return (
                <>
                  {/* Pitch count badge */}
                  <div className={`fixed bottom-14 left-4 z-50 px-3 py-1.5 rounded-lg text-xs font-mono ${
                    over ? 'bg-red-900/90 border-red-500 text-red-300' : 'bg-slate-800/80 border-slate-600 text-slate-300'
                  } border`}>
                    {cnt}/{lim} {lang === 'ko' ? '구' : 'P'}
                  </div>
                  {/* Fatigue alert */}
                  {kboFatigueNotified && (
                    <div
                      className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-red-900/95 border border-red-500 text-red-200 px-4 py-2 rounded-xl text-sm font-bold animate-bounce cursor-pointer"
                      onClick={() => setKboFatigueNotified(false)}
                    >
                      {lang === 'ko'
                        ? `${selectedPitcher.nameKo}: 한계 투구수(${lim}구)를 넘었습니다! 구속↓ 제구↓`
                        : `${selectedPitcher.name}: Pitch limit (${lim}) exceeded! Speed↓ Control↓`}
                    </div>
                  )}
                  {/* Change pitcher button */}
                  {atBat.balls === 0 && atBat.strikes === 0 && (
                    <button
                      onClick={() => handleChangePitcher('pitch_select')}
                      className={`fixed bottom-4 left-4 z-50 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                        over ? 'bg-red-800/80 hover:bg-red-700 border-red-500 text-red-200 animate-pulse' : 'bg-slate-800/80 hover:bg-slate-700 border-slate-600 text-slate-300'
                      }`}
                    >
                      {lang === 'ko' ? '투수 교체' : 'Change Pitcher'}
                    </button>
                  )}
                </>
              );
            })()}
          </>
        );

      case 'miss_notify':
        if (!batter || !pitcher || !lastOutcome) return null;
        return (
          <MissNotify
            targetZone={lastOutcome.zone}
            actualZone={lastOutcome.actualZone}
            onDone={handleMissNotifyDone}
          />
        );

      case 'animating':
        if (!batter || !pitcher || !currentTrajectory) return null;
        return (
          <>
            <HUD
              scenario={scenario}
              balls={atBat.balls}
              strikes={atBat.strikes}
              outs={gameMode === 'kbo' ? kboOuts : (scenario?.outs ?? 0)}
              currentAtBat={gameMode === 'kbo' ? (kboBatterOrder % 9) + 1 : atBat.scenarioIndex + 1}
              totalAtBats={gameMode === 'kbo' ? 9 : totalAtBats}
              pitcherName={playerName(pitcher.nameKo, pitcher.id)}
              batterName={playerName(batter.nameKo, batter.id)}
              gameMode={gameMode}
              kboInning={kboInning}
              kboHanwhaScore={kboHanwhaScore}
              kboKiaScore={kboKiaScore}
              kboBases={kboBases}
            />
            <PitchScene
              pitch={currentTrajectory}
              isAnimating={true}
              onAnimationComplete={handleAnimationComplete}
            />
          </>
        );

      case 'outcome':
        if (!batter || !pitcher || !lastOutcome) return null;
        return (
          <>
            <HUD
              scenario={scenario}
              balls={lastOutcome.newBalls}
              strikes={lastOutcome.newStrikes}
              outs={gameMode === 'kbo' ? kboOuts : (scenario?.outs ?? 0)}
              currentAtBat={gameMode === 'kbo' ? (kboBatterOrder % 9) + 1 : atBat.scenarioIndex + 1}
              totalAtBats={gameMode === 'kbo' ? 9 : totalAtBats}
              pitcherName={playerName(pitcher.nameKo, pitcher.id)}
              batterName={playerName(batter.nameKo, batter.id)}
              gameMode={gameMode}
              kboInning={kboInning}
              kboHanwhaScore={kboHanwhaScore}
              kboKiaScore={kboKiaScore}
              kboBases={kboBases}
            />
            <OutcomeDisplay
              outcome={lastOutcome.outcome}
              pitchCode={lastOutcome.pitchCode}
              zone={lastOutcome.zone}
              actualZone={lastOutcome.actualZone}
              difficulty={difficulty}
              batterProfile={batter}
              balls={lastOutcome.newBalls}
              strikes={lastOutcome.newStrikes}
              onNext={handleOutcomeNext}
            />
          </>
        );

      case 'at_bat_result':
        if (!batter || !atBatOver) return null;
        return (
          <AtBatResult
            batter={batter}
            outcome={atBatOver.result}
            pitchHistory={atBat.pitchHistory}
            totalScore={atBatOver.score}
            scenarioActualResult={(() => {
              const rawResult = gameMode === 'scenario'
                ? (selectedAtBats[atBat.scenarioIndex]?.actualResult ?? '')
                : (scenario?.actualResult ?? '');
              const atBatId = gameMode === 'scenario'
                ? (selectedAtBats[atBat.scenarioIndex]?.id ?? '')
                : (scenario?.id ?? '');
              if (!atBatId) return rawResult;
              const key = 'scenario.result.' + atBatId;
              const val = t(key);
              return val !== key ? val : rawResult;
            })()}
            onNext={handleAtBatNext}
            isLastAtBat={gameMode === 'kbo'
              ? (kboOuts >= 2 && kboInning >= 9 && (atBatOver?.result.type === 'strikeout' || atBatOver?.result.type === 'out'))
              : atBat.scenarioIndex + 1 >= totalAtBats}
          />
        );

      case 'inning_transition': {
        const hanwhaThisInn = kboHanwhaInningScores[kboInning - 1] ?? 0;
        const hanwhaTotalSoFar = kboHanwhaScore + hanwhaThisInn;
        const kiaTotalSoFar = kboKiaScore;
        // Build completed inning scores for display
        const displayHanwha = [...kboKiaInningScores.map((_, i) => kboHanwhaInningScores[i] ?? 0), hanwhaThisInn];
        const displayKia = [...kboKiaInningScores, kboKiaThisInning];
        return (
          <InningTransition
            inning={kboInning}
            hanwhaInningScores={displayHanwha}
            kiaInningScores={displayKia}
            hanwhaTotal={hanwhaTotalSoFar}
            kiaTotal={kiaTotalSoFar}
            hanwhaThisInning={hanwhaThisInn}
            kiaThisInning={kboKiaThisInning}
            isGameOver={kboInning >= 9}
            onNext={handleInningNext}
            onChangePitcher={() => handleChangePitcher('inning_transition')}
            currentPitcherName={selectedPitcher ? playerName(selectedPitcher.nameKo, selectedPitcher.id) : undefined}
          />
        );
      }

      case 'game_result': {
        const total = calculateTotalScore(completedAtBats);
        const leadScore = calculateLeadScore(completedAtBats, lang);
        const scenarioPitcherName = gameMode === 'scenario'
          ? (selectedScenario?.pitcherId === 'lorenzen' ? playerName(LORENZEN_PROFILE.nameKo, LORENZEN_PROFILE.id) : undefined)
          : selectedPitcher ? playerName(selectedPitcher.nameKo, selectedPitcher.id) : undefined;
        return (
          <GameResult
            atBats={completedAtBats}
            totalScore={total}
            difficulty={difficulty}
            onRestart={handleRestart}
            gameMode={gameMode}
            pitcherName={scenarioPitcherName}
            leadScore={leadScore}
            scenarioMode={selectedScenario ?? undefined}
            selectedAtBats={selectedAtBats}
            kboHanwhaScore={kboHanwhaScore}
            kboKiaScore={kboKiaScore}
            kboHanwhaInningScores={kboHanwhaInningScores}
            kboKiaInningScores={kboKiaInningScores}
          />
        );
      }

      default:
        return null;
    }
  })();

  const handleToggleSound = useCallback(() => {
    const muted = gameAudio.toggleMute();
    setSoundEnabled(!muted);
    if (!muted) gameAudio.startAmbient();
  }, []);

  return (
    <>
      {/* Piqq banner — fixed bottom center, 12% of viewport height */}
      <a
        href="https://piqq.me"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-0 left-0 right-0 z-[70] flex justify-center bg-slate-950/90 backdrop-blur-sm border-t border-slate-800 py-1 active:opacity-80 transition-opacity"
      >
        <img
          src="/images/piqq-banner.png"
          alt="Piqq"
          className="max-h-[15vh] w-auto max-w-[98vw] object-contain"
        />
      </a>
      <LanguageToggle />
      {gameMode === 'kbo' && soundEnabled !== undefined && phase !== 'mode_select' && phase !== 'difficulty_select' && phase !== 'pitcher_select' && phase !== 'lineup_select' && (
        <button
          onClick={handleToggleSound}
          className="fixed top-2 right-14 z-[60] bg-slate-800/80 hover:bg-slate-700 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm border border-slate-600 transition-colors"
        >
          {soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07'}
        </button>
      )}
      {content}
    </>
  );
}
