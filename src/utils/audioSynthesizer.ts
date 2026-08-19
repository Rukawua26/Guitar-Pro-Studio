// Web Audio API Synthesizer with Harmonic Overtone Simulation, Body Resonance & Plucked Attack

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  public getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Synthesize a realistic plucked acoustic/electric guitar string using additive harmonic synthesis + resonant body filter
   */
  public playGuitarPluck(frequency: number, duration: number = 2.8, velocity: number = 0.85) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Master pluck gain node with realistic exponential decay envelope
      const pluckGain = ctx.createGain();
      pluckGain.gain.setValueAtTime(0.0001, now);
      pluckGain.gain.exponentialRampToValueAtTime(Math.max(0.01, velocity * 0.45), now + 0.007);
      pluckGain.gain.exponentialRampToValueAtTime(0.00005, now + duration);

      // Dynamic lowpass filter: initial bright transient, damping quickly down to fundamental
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(Math.min(frequency * 6.5, 9000), now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.6, now + duration * 0.6);
      filter.Q.setValueAtTime(2.5, now); // Natural body resonance peak

      // Overtones for guitar string physics:
      // Combination of Sawtooth (rich harmonic spectrum) + Triangle (strong fundamental)
      const harmonics = [
        { mult: 1, gain: 1.0, type: 'triangle' as OscillatorType },
        { mult: 1, gain: 0.35, type: 'sawtooth' as OscillatorType },
        { mult: 2, gain: 0.55, type: 'sine' as OscillatorType },
        { mult: 3, gain: 0.3, type: 'sawtooth' as OscillatorType },
        { mult: 4, gain: 0.18, type: 'sine' as OscillatorType },
        { mult: 5, gain: 0.08, type: 'triangle' as OscillatorType }
      ];

      harmonics.forEach(({ mult, gain: hGain, type }) => {
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(frequency * mult, now);

        // Micro-detune for warm acoustic phasing
        if (mult > 1) {
          osc.detune.setValueAtTime((Math.random() - 0.5) * 5, now);
        }

        oscGain.gain.setValueAtTime(hGain, now);
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Pick attack noise transient (percussive plectrum click)
      const bufferSize = Math.floor(ctx.sampleRate * 0.02); // 20ms burst
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const plectrumClick = ctx.createBufferSource();
      plectrumClick.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(2800, now);
      noiseFilter.Q.setValueAtTime(4.0, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(velocity * 0.2, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.02);

      plectrumClick.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain || ctx.destination);

      plectrumClick.start(now);
      plectrumClick.stop(now + 0.025);

      filter.connect(pluckGain);
      pluckGain.connect(this.masterGain || ctx.destination);
    } catch (e) {
      console.warn('Audio synthesis error:', e);
    }
  }

  /**
   * Sound effect when string is tuned perfectly
   */
  public playInTuneAffirmation() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 - E5 - G5 - C6 sparkle

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.06);

        gain.gain.setValueAtTime(0.0001, now + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.12, now + idx * 0.06 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain || ctx.destination);

        osc.start(now + idx * 0.06);
        osc.stop(now + idx * 0.06 + 0.45);
      });
    } catch (e) {
      console.warn('In-tune chime error:', e);
    }
  }

  /**
   * Play a full chord with downward strumming delay between strings
   */
  public playChord(frets: (number | 'x')[], baseFret: number = 1, strumSpeedMs: number = 28) {
    const baseFreqs = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

    frets.forEach((fret, index) => {
      if (fret === 'x') return;
      const actualFret = fret;
      const stringBaseFreq = baseFreqs[index];
      const freq = stringBaseFreq * Math.pow(2, actualFret / 12);

      setTimeout(() => {
        this.playGuitarPluck(freq, 2.5, 0.8);
      }, index * strumSpeedMs);
    });
  }

  /**
   * High quality metronome click sound
   */
  public playMetronomeClick(isHigh: boolean = false, bpm?: number, volume: number = 0.7) {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(isHigh ? 1800 : 1000, now);
      osc.frequency.exponentialRampToValueAtTime(isHigh ? 350 : 200, now + 0.04);

      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.06);
    } catch (e) {
      console.warn('Metronome click error:', e);
    }
  }
}

export const audioEngine = new AudioEngine();
