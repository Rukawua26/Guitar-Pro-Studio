// Precision Web Audio Pitch Detection using Autocorrelation + RMS Gating

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
 * Auto-correlation pitch detection algorithm tailored for acoustic & electric guitar.
 * Overcomes FFT bin resolution limitations in the bass register (E2 ~ 82.41Hz).
 */
export function autoCorrelate(
  buffer: Float32Array,
  sampleRate: number,
  minRmsThreshold: number = 0.008
): number {
  const rms = calculateRMS(buffer);
  if (rms < minRmsThreshold) {
    return -1; // Not enough signal energy
  }

  // Trim silence from start and end
  let r1 = 0;
  let r2 = buffer.length - 1;
  const thres = 0.2;
  for (let i = 0; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[i]) < thres) {
      r1 = i;
      break;
    }
  }
  for (let i = 1; i < buffer.length / 2; i++) {
    if (Math.abs(buffer[buffer.length - i]) < thres) {
      r2 = buffer.length - i;
      break;
    }
  }

  const trimmed = buffer.subarray(r1, r2);
  const c = new Float32Array(trimmed.length);

  for (let i = 0; i < trimmed.length; i++) {
    for (let j = 0; j < trimmed.length - i; j++) {
      c[i] = c[i] + trimmed[j] * trimmed[j + i];
    }
  }

  // Find first dip
  let d = 0;
  while (d < c.length - 1 && c[d] > c[d + 1]) {
    d++;
  }

  // Find peak after first dip
  let maxval = -1;
  let maxpos = -1;
  for (let i = d; i < c.length; i++) {
    if (c[i] > maxval) {
      maxval = c[i];
      maxpos = i;
    }
  }

  if (maxpos === -1 || maxval <= 0) return -1;

  let T0 = maxpos;

  // Parabolic interpolation for sub-sample accuracy
  const x1 = c[T0 - 1] ?? 0;
  const x2 = c[T0];
  const x3 = c[T0 + 1] ?? 0;

  const a = (x1 + x3 - 2 * x2) / 2;
  const b = (x3 - x1) / 2;
  if (a) {
    T0 = T0 - b / (2 * a);
  }

  const freq = sampleRate / T0;

  // Typical guitar fundamental frequency range: 50Hz (Drop Low) to 1200Hz (High frets)
  if (freq >= 55 && freq <= 1100) {
    return freq;
  }

  return -1;
}

/**
 * Calculates MIDI note, note name, octave and cent offset from frequency given A4 calibration.
 */
export function getPitchInfo(frequency: number, a4: number = 440): PitchDetectionResult | null {
  if (frequency <= 0 || isNaN(frequency)) return null;

  // MIDI note formula: 69 + 12 * log2(freq / A4)
  const midiNoteExact = 69 + 12 * Math.log2(frequency / a4);
  const midiNoteRounded = Math.round(midiNoteExact);

  const targetFrequency = a4 * Math.pow(2, (midiNoteRounded - 69) / 12);
  const cents = Math.round(1200 * Math.log2(frequency / targetFrequency));

  const noteIndex = (midiNoteRounded % 12 + 12) % 12;
  const noteName = NOTE_STRINGS[noteIndex];
  const octave = Math.floor(midiNoteRounded / 12) - 1;

  return {
    frequency: Number(frequency.toFixed(1)),
    note: noteName,
    octave,
    cents,
    targetFrequency: Number(targetFrequency.toFixed(2)),
    rms: 0,
    inTune: Math.abs(cents) <= 4,
    confidence: 0.95
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
