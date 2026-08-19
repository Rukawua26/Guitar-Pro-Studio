// High-Precision Web Audio Pitch Detection using Optimized YIN Algorithm + EMA Smoothing
// Engineered for acoustic/electric guitars across sample rates (44.1kHz, 48kHz, 96kHz)

const NOTE_STRINGS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export interface PitchDetectionResult {
  frequency: number;
  note: string;
  octave: number;
  cents: number;
  targetFrequency: number;
  rms: number;
  inTune: boolean; // within -5 to +5 cents
  confidence: number;
}

/**
 * Calculates Root Mean Square (RMS) of audio buffer to determine signal energy.
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Optimized Implementation of YIN Pitch Detection Algorithm with Guitar Range Constraints
 */
export class YinDetector {
  private threshold: number;
  private yinBuffer: Float32Array;
  private smoothedFreq: number = -1;
  private smoothingAlpha: number = 0.35; // Exponential Moving Average (EMA) factor

  constructor(bufferSize: number = 4096, threshold: number = 0.15) {
    this.threshold = threshold;
    this.yinBuffer = new Float32Array(Math.floor(bufferSize / 2));
  }

  public setThreshold(val: number) {
    this.threshold = Math.max(0.05, Math.min(0.3, val));
  }

  public resetSmoothing() {
    this.smoothedFreq = -1;
  }

  /**
   * Detects fundamental frequency using optimized YIN algorithm
   * @param buffer Time domain audio data
   * @param sampleRate AudioContext sample rate (44100, 48000, 96000, etc.)
   * @param minRmsThreshold Noise gate threshold
   */
  public detectPitch(
    buffer: Float32Array,
    sampleRate: number,
    minRmsThreshold: number = 0.003
  ): { frequency: number; probability: number } | null {
    const rms = calculateRMS(buffer);
    if (rms < minRmsThreshold) {
      this.resetSmoothing();
      return null; // Noise gate active
    }

    const halfBufferSize = Math.floor(buffer.length / 2);
    if (this.yinBuffer.length !== halfBufferSize) {
      this.yinBuffer = new Float32Array(halfBufferSize);
    }

    // Tau search range bounded by guitar frequency range (50 Hz to 1400 Hz)
    // E.g. at 48kHz: tauMin = 48000/1400 ~= 34 samples, tauMax = 48000/50 ~= 960 samples
    const tauMin = Math.max(2, Math.floor(sampleRate / 1400));
    const tauMax = Math.min(halfBufferSize - 1, Math.floor(sampleRate / 50));

    // Step 1: Difference Function
    // d_t(tau) = sum_j (x_j - x_{j+tau})^2
    for (let tau = 0; tau <= tauMax; tau++) {
      let sum = 0;
      for (let j = 0; j < halfBufferSize; j++) {
        const delta = buffer[j] - buffer[j + tau];
        sum += delta * delta;
      }
      this.yinBuffer[tau] = sum;
    }

    // Step 2: Cumulative Mean Normalized Difference Function
    // d'_t(tau) = 1 if tau=0; d_t(tau) / ((1/tau) * sum_{j=1}^tau d_t(j))
    this.yinBuffer[0] = 1;
    let runningSum = 0;
    for (let tau = 1; tau <= tauMax; tau++) {
      runningSum += this.yinBuffer[tau];
      if (runningSum > 0) {
        this.yinBuffer[tau] = (this.yinBuffer[tau] * tau) / runningSum;
      } else {
        this.yinBuffer[tau] = 1;
      }
    }

    // Step 3: Absolute Thresholding
    let tauEstimate = -1;
    for (let tau = tauMin; tau <= tauMax; tau++) {
      if (this.yinBuffer[tau] < this.threshold) {
        while (tau + 1 <= tauMax && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    // Fallback: If no value is under threshold, find global minimum in tau range
    if (tauEstimate === -1) {
      let minVal = 1000;
      for (let tau = tauMin; tau <= tauMax; tau++) {
        if (this.yinBuffer[tau] < minVal) {
          minVal = this.yinBuffer[tau];
          tauEstimate = tau;
        }
      }
      if (minVal > 0.45) {
        // Signal is aperiodic or noisy
        return null;
      }
    }

    // Step 4: Parabolic Interpolation for sub-sample accuracy
    let betterTau: number = tauEstimate;
    const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
    const x2 = tauEstimate + 1 <= tauMax ? tauEstimate + 1 : tauEstimate;

    if (x0 !== tauEstimate && x2 !== tauEstimate) {
      const s0 = this.yinBuffer[x0];
      const s1 = this.yinBuffer[tauEstimate];
      const s2 = this.yinBuffer[x2];
      const denom = 2 * (2 * s1 - s2 - s0);
      if (denom !== 0) {
        betterTau = tauEstimate + (s2 - s0) / denom;
      }
    }

    if (betterTau <= 0) return null;

    const rawFreq = sampleRate / betterTau;
    const probability = Math.max(0, 1 - (this.yinBuffer[tauEstimate] || 0));

    // Bounds check
    if (rawFreq < 50 || rawFreq > 1400) {
      return null;
    }

    // Apply EMA Smoothing to stabilize pitch readings against transient pick clicks
    let finalFreq = rawFreq;
    if (this.smoothedFreq > 0 && Math.abs(rawFreq - this.smoothedFreq) < 30) {
      finalFreq = this.smoothingAlpha * rawFreq + (1 - this.smoothingAlpha) * this.smoothedFreq;
    }
    this.smoothedFreq = finalFreq;

    return {
      frequency: finalFreq,
      probability: Math.max(0, Math.min(1, probability))
    };
  }
}

// Global detector instance with 4096 buffer size support
export const yinDetector = new YinDetector(4096, 0.15);

/**
 * Calculates MIDI note, note name, octave and cent offset from frequency given A4 calibration.
 * Formula: cents = 1200 * log2(f_det / f_target)
 */
export function getPitchInfo(frequency: number, a4: number = 440): PitchDetectionResult | null {
  if (frequency <= 0 || isNaN(frequency)) return null;

  // MIDI note formula: 69 + 12 * log2(freq / A4)
  const midiNoteExact = 69 + 12 * Math.log2(frequency / a4);
  const midiNoteRounded = Math.round(midiNoteExact);

  const targetFrequency = a4 * Math.pow(2, (midiNoteRounded - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));

  const noteIndex = ((midiNoteRounded % 12) + 12) % 12;
  const noteName = NOTE_STRINGS[noteIndex];
  const octave = Math.floor(midiNoteRounded / 12) - 1;

  return {
    frequency: Number(frequency.toFixed(1)),
    note: noteName,
    octave,
    cents,
    targetFrequency: Number(targetFrequency.toFixed(2)),
    rms: 0,
    inTune: Math.abs(cents) <= 5, // +/- 5 cents standard tolerance
    confidence: 0.96
  };
}

/**
 * Note to frequency helper
 */
export function noteToFreq(note: string, octave: number, a4: number = 440): number {
  const index = NOTE_STRINGS.indexOf(note.replace('b', '#'));
  const normalizedIndex = index !== -1 ? index : 0;
  const midi = 12 * (octave + 1) + normalizedIndex;
  return a4 * Math.pow(2, (midi - 69) / 12);
}
