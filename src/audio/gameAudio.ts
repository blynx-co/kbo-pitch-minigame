/**
 * Game audio engine using real sound files.
 * Files in public/audio/, served as static assets.
 */

type SoundName =
  | 'strikeCall'    // umpire "Strike!"
  | 'gloveCatch'    // ball caught in mitt
  | 'batSwing'      // swing and miss whoosh
  | 'batCrack'      // hit — bat crack
  | 'foulTip'       // foul tip off backstop
  | 'homerunCheer'  // crowd gasp → cheer
  | 'victory'       // celebration
  | 'crowdBoo'      // deep boo
  | 'crowdBoo2'     // secondary boo
  | 'crowdAmbient'; // stadium background

const SOUND_FILES: Record<SoundName, string> = {
  strikeCall:    '/audio/strike-call.mp3',
  gloveCatch:    '/audio/glove-catch.wav',
  batSwing:      '/audio/bat-swing.mp3',
  batCrack:      '/audio/bat-crack.wav',
  foulTip:       '/audio/foul-tip.mp3',
  homerunCheer:  '/audio/homerun-cheer.mp3',
  victory:       '/audio/victory.mp3',
  crowdBoo:      '/audio/crowd-boo.wav',
  crowdBoo2:     '/audio/crowd-boo2.mp3',
  crowdAmbient:  '/audio/crowd-ambient.wav',
};

class GameAudio {
  private cache: Map<SoundName, HTMLAudioElement> = new Map();
  private ambient: HTMLAudioElement | null = null;
  private _muted = false;
  private _volume = 0.7;

  /** Preload all sounds */
  preload() {
    for (const [name, src] of Object.entries(SOUND_FILES)) {
      const audio = new Audio(src);
      audio.preload = 'auto';
      audio.volume = this._volume;
      this.cache.set(name as SoundName, audio);
    }
  }

  get muted() { return this._muted; }

  toggleMute(): boolean {
    this._muted = !this._muted;
    // Mute/unmute ambient
    if (this.ambient) {
      this.ambient.muted = this._muted;
    }
    return this._muted;
  }

  /** Play a one-shot sound effect */
  private play(name: SoundName, volume?: number) {
    if (this._muted) return;
    // Clone from cache so overlapping plays work
    const cached = this.cache.get(name);
    const src = cached?.src ?? SOUND_FILES[name];
    const audio = new Audio(src);
    audio.volume = volume ?? this._volume;
    audio.play().catch(() => { /* user hasn't interacted yet */ });
  }

  /** Start looping ambient crowd noise */
  startAmbient() {
    if (this.ambient) return;
    const audio = new Audio(SOUND_FILES.crowdAmbient);
    audio.loop = true;
    audio.volume = 0.25;
    audio.muted = this._muted;
    audio.play().catch(() => { /* ok */ });
    this.ambient = audio;
  }

  stopAmbient() {
    if (this.ambient) {
      this.ambient.pause();
      this.ambient.currentTime = 0;
      this.ambient = null;
    }
  }

  // ── Game event triggers ──

  /** Called after each pitch outcome */
  onPitchOutcome(outcome: string) {
    switch (outcome) {
      case 'called_strike':
        this.play('strikeCall');
        break;
      case 'swinging_strike':
        this.play('batSwing');
        // slight delay then glove catch
        setTimeout(() => this.play('gloveCatch', 0.4), 200);
        break;
      case 'ball':
        this.play('gloveCatch', 0.5);
        break;
      case 'foul':
        this.play('foulTip');
        break;
      case 'single':
      case 'double':
      case 'triple':
        this.play('batCrack');
        break;
      case 'homerun':
        this.play('batCrack', 0.9);
        setTimeout(() => this.play('homerunCheer'), 500);
        break;
      case 'groundout':
      case 'flyout':
      case 'lineout':
        this.play('batCrack', 0.6);
        break;
    }
  }

  /** Called on at-bat result */
  onAtBatResult(type: string) {
    switch (type) {
      case 'strikeout':
        // Crowd boos after strikeout (away game — home fans upset)
        this.play('crowdBoo', 0.5);
        break;
      case 'walk':
        // Mild crowd reaction — no specific sound
        break;
    }
  }

  /** Called on game win */
  onVictory() {
    this.play('victory');
  }

  /** Called on game loss */
  onDefeat() {
    this.play('crowdBoo2', 0.6);
  }

  dispose() {
    this.stopAmbient();
    this.cache.clear();
  }
}

export const gameAudio = new GameAudio();
