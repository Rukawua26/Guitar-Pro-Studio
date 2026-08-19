// Web Audio API Synthesizer for realistic guitar plucks, chords, and metronome

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Synthesize a realistic plucked acoustic/electric guitar string using additive harmonic synthesis + decay filter
   */
  public playGuitarPluck(frequency: number, duration: number = 2.5, velocity: number = 0.8) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Master pluck gain node with envelope
      const pluckGain = ctx.createGain();
      pluckGain.gain.setValueAtTime(0.001, now);
      pluckGain.gain.exponentialRampToValueAtTime(Math.max(0.01, velocity * 0.4), now + 0.008);
      pluckGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      // Lowpass filter for natural acoustic body damping
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(frequency * 5, 8000), now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration * 0.7);

      // Overtones for guitar string physics: Fundamental + 2nd, 3rd, 4th, 5th harmonics
      const harmonics = [
        { mult: 1, gain: 1.0, type: 'triangle' as OscillatorType },
        { mult: 2, gain: 0.5, type: 'sine' as OscillatorType },
        { mult: 3, gain: 0.25, type: 'sawtooth' as OscillatorType },
        { mult: 4, gain: 0.12, type: 'sine' as OscillatorType },
        { mult: 5, gain: 0.06, type: 'triangle' as OscillatorType }
      ];

      harmonics.forEach(({ mult, gain: hGain, type }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency * mult, now);
        
        // Slight detune for natural warmth
        if (mult > 1) {
          osc.detune.setValueAtTime((Math.random() - 0.5) * 4, now);
        }

        oscGain.gain.setValueAtTime(hGain, now);
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Body resonance subtle noise burst (pick attack click)
      const bufferSize = ctx.sampleRate * 0.02; // 20ms burst
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(3000, now);
      noiseFilter.Q.setValueAtTime(3, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(velocity * 0.15, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain || ctx.destination);

      whiteNoise.start(now);
      whiteNoise.stop(now + 0.03);

      filter.connect(pluckGain);
      pluckGain.connect(this.masterGain || ctx.destination);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }

  /**
   * Play a full chord with authentic downward strumming delay between strings (30ms stagger)
   */
  public playChord(frets: (number | 'x')[], baseFret: number = 1, strumSpeedMs: number = 25) {
    // Standard string base frequencies in Hz (E2, A2, D3, G3, B3, E4)
    const baseFreqs = [82.41, 110.00, 146.83, 196.00, 246.94, 329.63];

    frets.forEach((fret, index) => {
      if (fret === 'x') return;
      const actualFret = fret;
      // Formula: f = f0 * 2^(fret/12)
      const stringBaseFreq = baseFreqs[index];
      const freq = stringBaseFreq * Math.pow(2, actualFret / 12);

      setTimeout(() => {
        this.playGuitarPluck(freq, 2.2, 0.75);
      }, index * strumSpeedMs);
    });
  }

  /**
   * Synthesize high quality metronome click sound
   */
  public playMetronomeClick(isHigh: boolean = false, tempoBpm: number = 120) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isHigh ? 1600 : 900, now);
      osc.frequency.exponentialRampToValueAtTime(isHigh ? 400 : 250, now + 0.04);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn("Metronome click error:", e);
    }
  }
}

export const audioEngine = new AudioEngine();
