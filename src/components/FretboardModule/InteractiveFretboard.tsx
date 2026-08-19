import React, { useState } from 'react';
import { MODES_LIST } from '../../data/courseData';
import { audioEngine } from '../../utils/audioSynthesizer';
import { Music, Sparkles, Layers, Volume2, Info } from 'lucide-react';

const CHROMATIC_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// 6 strings standard tuning notes from 1st (high E) down to 6th (low E)
const STRINGS_OPEN = [
  { note: 'E', octave: 4, baseFreq: 329.63, stringNum: 1 },
  { note: 'B', octave: 3, baseFreq: 246.94, stringNum: 2 },
  { note: 'G', octave: 3, baseFreq: 196.00, stringNum: 3 },
  { note: 'D', octave: 3, baseFreq: 146.83, stringNum: 4 },
  { note: 'A', octave: 2, baseFreq: 110.00, stringNum: 5 },
  { note: 'E', octave: 2, baseFreq: 82.41, stringNum: 6 }
];

export const InteractiveFretboard: React.FC = () => {
  const [rootKey, setRootKey] = useState<string>('A');
  const [scaleType, setScaleType] = useState<string>('pentatonic_minor');
  const [highlightMode, setHighlightMode] = useState<'notes' | 'degrees' | 'intervals'>('notes');
  const [numFrets, setNumFrets] = useState<number>(15);

  const getScaleIntervals = () => {
    switch (scaleType) {
      case 'pentatonic_minor':
        return [0, 3, 5, 7, 10]; // 1, b3, 4, 5, b7
      case 'pentatonic_major':
        return [0, 2, 4, 7, 9]; // 1, 2, 3, 5, 6
      case 'blues_minor':
        return [0, 3, 5, 6, 7, 10]; // Blues scale with b5 Blue note
      case 'ionian':
        return [0, 2, 4, 5, 7, 9, 11]; // Mayor
      case 'dorian':
        return [0, 2, 3, 5, 7, 9, 10];
      case 'phrygian':
        return [0, 1, 3, 5, 7, 8, 10];
      case 'lydian':
        return [0, 2, 4, 6, 7, 9, 11];
      case 'mixolydian':
        return [0, 2, 4, 5, 7, 9, 10];
      case 'aeolian':
        return [0, 2, 3, 5, 7, 8, 10]; // Menor natural
      case 'locrian':
        return [0, 1, 3, 5, 6, 8, 10];
      case 'caged_e_shape':
        return [0, 4, 7]; // Major Triad
      default:
        return [0, 3, 5, 7, 10];
    }
  };

  const intervals = getScaleIntervals();
  const rootIndex = CHROMATIC_SCALE.indexOf(rootKey);

  const scaleNotes = intervals.map(i => CHROMATIC_SCALE[(rootIndex + i) % 12]);

  // Handle plucking a fret note
  const handleFretClick = (stringBaseFreq: number, fret: number) => {
    const freq = stringBaseFreq * Math.pow(2, fret / 12);
    audioEngine.playGuitarPluck(freq, 2.5, 0.85);
  };

  const isFretMarker = (fret: number) => [3, 5, 7, 9, 15, 17, 19, 21].includes(fret);
  const isDoubleFretMarker = (fret: number) => fret === 12;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Mode Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-slate-100 flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-amber-400" /> Diapasón Interactivo & Sistema Modal
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualiza escalas, modos griegos y el sistema CAGED en todo el mástil. Haz clic en las notas para escucharlas.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Root Key Selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-500 font-bold">Tónica:</span>
              <select
                value={rootKey}
                onChange={(e) => setRootKey(e.target.value)}
                className="bg-transparent font-bold text-amber-400 outline-none cursor-pointer"
              >
                {CHROMATIC_SCALE.map(n => (
                  <option key={n} value={n} className="bg-slate-900">{n}</option>
                ))}
              </select>
            </div>

            {/* Scale / Mode selector */}
            <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
              <span className="text-slate-500 font-bold">Escala / Modo:</span>
              <select
                value={scaleType}
                onChange={(e) => setScaleType(e.target.value)}
                className="bg-transparent font-semibold text-slate-100 outline-none cursor-pointer"
              >
                <optgroup label="Pentatónicas & Blues" className="bg-slate-900">
                  <option value="pentatonic_minor">Pentatónica Menor (Rock / Blues)</option>
                  <option value="pentatonic_major">Pentatónica Mayor (Country / Pop)</option>
                  <option value="blues_minor">Escala de Blues (con Blue Note b5)</option>
                </optgroup>
                <optgroup label="7 Modos Griegos" className="bg-slate-900">
                  <option value="ionian">1. Jónico (Escala Mayor)</option>
                  <option value="dorian">2. Dórico (Santana / Funk)</option>
                  <option value="phrygian">3. Frigio (Flamenco / Metal)</option>
                  <option value="lydian">4. Lidio (#4 Satriani / Vai)</option>
                  <option value="mixolydian">5. Mixolidio (b7 Rock Clásico)</option>
                  <option value="aeolian">6. Eólico (Menor Natural)</option>
                  <option value="locrian">7. Locrio (Disonante / Jazz)</option>
                </optgroup>
                <optgroup label="Arpegios & Tríadas" className="bg-slate-900">
                  <option value="caged_e_shape">Tríada Mayor (1 - 3 - 5)</option>
                </optgroup>
              </select>
            </div>

            {/* Fret count */}
            <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
              <button
                onClick={() => setNumFrets(12)}
                className={`px-2 py-1 rounded font-mono ${numFrets === 12 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                12t
              </button>
              <button
                onClick={() => setNumFrets(15)}
                className={`px-2 py-1 rounded font-mono ${numFrets === 15 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                15t
              </button>
              <button
                onClick={() => setNumFrets(22)}
                className={`px-2 py-1 rounded font-mono ${numFrets === 22 ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                22t
              </button>
            </div>
          </div>
        </div>

        {/* Fretboard SVG / Canvas Container */}
        <div className="overflow-x-auto pb-4 pt-2">
          <div className="min-w-[760px] bg-gradient-to-b from-amber-950/40 via-amber-950/20 to-slate-950 border-2 border-amber-900/40 rounded-2xl p-4 shadow-2xl relative select-none">
            {/* Top Fret numbers */}
            <div className="grid grid-cols-[50px_repeat(var(--num-frets),1fr)] text-center text-xs font-mono text-slate-500 mb-2" style={{ '--num-frets': numFrets } as any}>
              <span>0 (Nut)</span>
              {Array.from({ length: numFrets }).map((_, f) => (
                <span key={f} className={f + 1 === 12 ? 'text-amber-400 font-bold' : ''}>
                  {f + 1}
                </span>
              ))}
            </div>

            {/* 6 Guitar Strings */}
            <div className="space-y-4 relative py-2">
              {STRINGS_OPEN.map((str, sIdx) => {
                const openNoteIndex = CHROMATIC_SCALE.indexOf(str.note);

                return (
                  <div key={sIdx} className="grid grid-cols-[50px_repeat(var(--num-frets),1fr)] items-center relative" style={{ '--num-frets': numFrets } as any}>
                    {/* Horizontal metallic string line across frets */}
                    <div
                      className="absolute left-12 right-0 bg-slate-400/80 -translate-y-1/2 pointer-events-none"
                      style={{
                        top: '50%',
                        height: `${Math.max(1.5, (6 - sIdx) * 0.7)}px`,
                        boxShadow: '0 1px 2px rgba(0,0,0,0.5)'
                      }}
                    />

                    {/* Open String (Fret 0) */}
                    <div className="flex justify-center z-10">
                      {(() => {
                        const noteName = str.note;
                        const isRoot = noteName === rootKey;
                        const inScale = scaleNotes.includes(noteName);

                        return (
                          <button
                            onClick={() => handleFretClick(str.baseFreq, 0)}
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-transform hover:scale-110 cursor-pointer shadow-md ${
                              isRoot
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 font-extrabold'
                                : inScale
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800/80 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {noteName}
                          </button>
                        );
                      })()}
                    </div>

                    {/* Frets 1 to N */}
                    {Array.from({ length: numFrets }).map((_, fIdx) => {
                      const fretNumber = fIdx + 1;
                      const noteIndex = (openNoteIndex + fretNumber) % 12;
                      const noteName = CHROMATIC_SCALE[noteIndex];
                      const isRoot = noteName === rootKey;
                      const inScale = scaleNotes.includes(noteName);

                      return (
                        <div
                          key={fIdx}
                          className="flex justify-center items-center z-10 relative h-9 border-r border-slate-700/60"
                        >
                          {/* Fret inlay dot behind note if 3rd, 5th, 7th, 9th, 12th */}
                          {sIdx === 2 && isFretMarker(fretNumber) && (
                            <div className="absolute w-3 h-3 rounded-full bg-slate-700/40 pointer-events-none -z-0" />
                          )}
                          {sIdx === 2 && isDoubleFretMarker(fretNumber) && (
                            <div className="absolute flex gap-1 pointer-events-none -z-0">
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
                            </div>
                          )}

                          {inScale ? (
                            <button
                              onClick={() => handleFretClick(str.baseFreq, fretNumber)}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all hover:scale-115 cursor-pointer shadow-lg ${
                                isRoot
                                  ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-200 font-black scale-105 shadow-amber-400/30'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20'
                              }`}
                              title={`${noteName} (Traste ${fretNumber})`}
                            >
                              {noteName}
                            </button>
                          ) : (
                            <button
                              onClick={() => handleFretClick(str.baseFreq, fretNumber)}
                              className="w-5 h-5 rounded-full opacity-0 hover:opacity-100 hover:bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center transition-all cursor-pointer"
                            >
                              {noteName}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Scale summary footer */}
        <div className="mt-4 p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400">Notas en la Escala:</span>
            <div className="flex items-center gap-1.5">
              {scaleNotes.map((n, i) => (
                <span
                  key={i}
                  className={`px-2.5 py-1 rounded-lg font-bold font-mono ${
                    n === rootKey ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-emerald-400'
                  }`}
                >
                  {n}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <span>Tónica ({rootKey})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-600" />
              <span>Notas de la escala</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
