// High-Precision Web Audio Pitch Detection using YIN Algorithm + EMA Temporal Smoothing
// YIN eliminates octave-jumping and overtone interference on bass guitar strings (E2 ~ 82.41Hz)

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
 * Calculates the Root Mean Square (RMS) of audio buffer to determine signal energy.
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Implementation of the YIN Pitch Detection Algorithm
 * Reference: De Cheveigné, A., & Kawahara, H. (2002). "YIN, a fundamental frequency estimator for speech and music."
 * J. Acoust. Soc. Am. 111(4), 1917-1930.
 *
 * Steps:
 * 1. Difference function d_t(tau)
 * 2. Cumulative mean normalized difference function d'_t(tau)
 * 3. Absolute thresholding
 * 4. Parabolic interpolation for sub-sample accuracy
 */
export class YinDetector {
  private threshold: number;
  private bufferSize: number;
  private yinBuffer: Float32Array;
  private smoothedFreq: number = -1;
  private smoothingAlpha: number = 0.35; // Exponential Moving Average (EMA) factor

  constructor(bufferSize: number = 2048, threshold: number = 0.12) {
    this.bufferSize = bufferSize;
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
   * Detects fundamental frequency using YIN algorithm
   */
  public detectPitch(
    buffer: Float32Array,
    sampleRate: number,
    minRmsThreshold: number = 0.008
  ): { frequency: number; probability: number } | null {
    const rms = calculateRMS(buffer);
    if (rms < minRmsThreshold) {
      this.resetSmoothing();
      return null; // Silent or noise gate active
    }

    const halfBufferSize = Math.floor(buffer.length / 2);
    if (this.yinBuffer.length !== halfBufferSize) {
      this.yinBuffer = new Float32Array(halfBufferSize);
    }

    // Step 1: Difference Function
    // d_t(tau) = sum_j (x_j - x_{j+tau})^2
    for (let tau = 0; tau < halfBufferSize; tau++) {
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
    for (let tau = 1; tau < halfBufferSize; tau++) {
      runningSum += this.yinBuffer[tau];
      if (runningSum > 0) {
        this.yinBuffer[tau] = (this.yinBuffer[tau] * tau) / runningSum;
      } else {
        this.yinBuffer[tau] = 1;
      }
    }

    // Step 3: Absolute Thresholding
    let tauEstimate = -1;
    for (let tau = 2; tau < halfBufferSize; tau++) {
      if (this.yinBuffer[tau] < this.threshold) {
        while (tau + 1 < halfBufferSize && this.yinBuffer[tau + 1] < this.yinBuffer[tau]) {
          tau++;
        }
        tauEstimate = tau;
        break;
      }
    }

    // Fallback: If no value is under threshold, find global minimum
    if (tauEstimate === -1) {
      let minVal = 1000;
      for (let tau = 2; tau < halfBufferSize; tau++) {
        if (this.yinBuffer[tau] < minVal) {
          minVal = this.yinBuffer[tau];
          tauEstimate = tau;
        }
      }
      if (minVal > 0.4) {
        // High aperiodicity / noise
        return null;
      }
    }

    // Step 4: Parabolic Interpolation for sub-sample accuracy
    let betterTau: number = tauEstimate;
    const x0 = tauEstimate < 1 ? tauEstimate : tauEstimate - 1;
    const x2 = tauEstimate + 1 < halfBufferSize ? tauEstimate + 1 : tauEstimate;

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
    const probability = 1 - (this.yinBuffer[tauEstimate] || 0);

    // Range filter for guitar fundamental pitch (E2 ~ 82Hz down to Drop A 55Hz up to High E frets ~ 1200Hz)
    if (rawFreq < 55 || rawFreq > 1200) {
      return null;
    }

    // Apply EMA (Exponential Moving Average) Smoothing to stabilize needle & cents display
    let finalFreq = rawFreq;
    if (this.smoothedFreq > 0 && Math.abs(rawFreq - this.smoothedFreq) < 25) {
      finalFreq = this.smoothingAlpha * rawFreq + (1 - this.smoothingAlpha) * this.smoothedFreq;
    }
    this.smoothedFreq = finalFreq;

    return {
      frequency: finalFreq,
      probability: Math.max(0, Math.min(1, probability))
    };
  }
}

// Global detector instance
export const yinDetector = new YinDetector(2048, 0.12);

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
