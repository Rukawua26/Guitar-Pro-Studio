// Web Audio API Synthesizer with Karplus-Strong Physical String Synthesis & Harmonic Resonators

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
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Karplus-Strong Physical Plucked String Algorithm
   * Simulates the exact physical behavior of a vibrating string using a delay line buffer with feedback averaging
   */
  public playKarplusStrong(frequency: number, duration: number = 3.0, velocity: number = 0.85, stringIndex: number = 2) {
    try {
      const ctx = this.getContext();
      const sampleRate = ctx.sampleRate;
      const period = Math.round(sampleRate / frequency);
      const bufferLength = Math.floor(sampleRate * duration);

      const buffer = ctx.createBuffer(1, bufferLength, sampleRate);
      const data = buffer.getChannelData(0);

      // String physical parameters
      // Thicker low strings have higher damping, treble strings ring brighter
      const dampingFactor = 0.992 - (stringIndex * 0.001); // between 0.988 and 0.996
      const brightness = 0.52; // feedback filter weight (averaging filter)

      // 1. Excitation signal (Plectrum noise burst into the delay line)
      for (let i = 0; i < period; i++) {
        // Shaped noise burst
        const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / period));
        data[i] = (Math.random() * 2 - 1) * window * velocity;
      }

      // 2. Karplus-Strong loop: y[n] = damping * (brightness * y[n-N] + (1 - brightness) * y[n-N-1])
      for (let i = period; i < bufferLength; i++) {
        const prev1 = data[i - period];
        const prev2 = data[i - period - 1] || prev1;
        data[i] = dampingFactor * (brightness * prev1 + (1 - brightness) * prev2);
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Body acoustic cavity resonance filter
      const bodyFilter = ctx.createBiquadFilter();
      bodyFilter.type = 'peaking';
      bodyFilter.frequency.setValueAtTime(105, ctx.currentTime); // Guitar soundboard air resonance (around 105 Hz)
      bodyFilter.Q.setValueAtTime(1.8, ctx.currentTime);
      bodyFilter.gain.setValueAtTime(4.0, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(velocity * 0.9, ctx.currentTime);

      source.connect(bodyFilter);
      bodyFilter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      source.start();
    } catch (e) {
      // Fallback to additive synthesis if buffer error occurs
      this.playGuitarPluck(frequency, duration, velocity);
    }
  }

  /**
   * High quality additive plucked acoustic/electric guitar note
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
      filter.Q.setValueAtTime(2.5, now);

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

        if (mult > 1) {
          osc.detune.setValueAtTime((Math.random() - 0.5) * 5, now);
        }

        oscGain.gain.setValueAtTime(hGain, now);
        osc.connect(oscGain);
        oscGain.connect(filter);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });

      // Pick attack noise transient
      const bufferSize = Math.floor(ctx.sampleRate * 0.02);
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
   * Play an interval or sequence of notes (for Ear Training)
   */
  public playInterval(freq1: number, freq2: number, harmonic: boolean = false) {
    if (harmonic) {
      // Play simultaneously
      this.playKarplusStrong(freq1, 2.5, 0.8);
      this.playKarplusStrong(freq2, 2.5, 0.8);
    } else {
      // Play ascending melodic
      this.playKarplusStrong(freq1, 1.8, 0.85);
      setTimeout(() => {
        this.playKarplusStrong(freq2, 2.2, 0.85);
      }, 700);
    }
  }

  /**
   * Play a full chord with realistic downward or upward strumming delay
   */
  public playChord(frets: (number | 'x')[], baseFret: number = 1, strumSpeedMs: number = 28) {
    const baseFreqs = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63];

    frets.forEach((fret, index) => {
      if (fret === 'x') return;
      const actualFret = fret;
      const stringBaseFreq = baseFreqs[index];
      const freq = stringBaseFreq * Math.pow(2, actualFret / 12);

      setTimeout(() => {
        this.playKarplusStrong(freq, 2.5, 0.8, index);
      }, index * strumSpeedMs);
    });
  }

  /**
   * Synthesize Kick Drum
   */
  public playDrumKick(velocity: number = 0.9, when?: number) {
    try {
      const ctx = this.getContext();
      const now = when || ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.12);

      gain.gain.setValueAtTime(velocity * 0.9, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch (e) {
      console.warn('Kick drum error:', e);
    }
  }

  /**
   * Synthesize Snare Drum
   */
  public playDrumSnare(velocity: number = 0.8, when?: number) {
    try {
      const ctx = this.getContext();
      const now = when || ctx.currentTime;

      // Noise component
      const bufferSize = Math.floor(ctx.sampleRate * 0.2);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'highpass';
      noiseFilter.frequency.setValueAtTime(800, now);

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(velocity * 0.7, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

      noise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain || ctx.destination);

      // Body tone component
      const tone = ctx.createOscillator();
      const toneGain = ctx.createGain();
      tone.type = 'triangle';
      tone.frequency.setValueAtTime(220, now);
      tone.frequency.exponentialRampToValueAtTime(100, now + 0.08);

      toneGain.gain.setValueAtTime(velocity * 0.5, now);
      toneGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);

      tone.connect(toneGain);
      toneGain.connect(this.masterGain || ctx.destination);

      noise.start(now);
      noise.stop(now + 0.2);
      tone.start(now);
      tone.stop(now + 0.12);
    } catch (e) {
      console.warn('Snare error:', e);
    }
  }

  /**
   * Synthesize Hi-Hat
   */
  public playDrumHiHat(open: boolean = false, velocity: number = 0.6, when?: number) {
    try {
      const ctx = this.getContext();
      const now = when || ctx.currentTime;
      const duration = open ? 0.35 : 0.05;

      const bufferSize = Math.floor(ctx.sampleRate * duration);
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(7000, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(velocity * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.01);
    } catch (e) {
      console.warn('HiHat error:', e);
    }
  }

  /**
   * Synthesize Warm Electric / Acoustic Bass Note
   */
  public playBassNote(frequency: number, duration: number = 1.2, velocity: number = 0.85, when?: number) {
    try {
      const ctx = this.getContext();
      const now = when || ctx.currentTime;

      const osc = ctx.createOscillator();
      const subOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(frequency, now);

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(frequency, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(frequency * 3.5, now);
      filter.frequency.exponentialRampToValueAtTime(frequency * 1.5, now + duration);
      filter.Q.setValueAtTime(2.0, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(velocity * 0.6, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      const subGain = ctx.createGain();
      subGain.gain.setValueAtTime(velocity * 0.5, now);

      osc.connect(filter);
      subOsc.connect(subGain);
      subGain.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain || ctx.destination);

      osc.start(now);
      subOsc.start(now);
      osc.stop(now + duration + 0.05);
      subOsc.stop(now + duration + 0.05);
    } catch (e) {
      console.warn('Bass note error:', e);
    }
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
