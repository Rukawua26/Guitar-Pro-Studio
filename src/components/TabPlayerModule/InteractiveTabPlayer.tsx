import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Gauge,
  Repeat,
  Sparkles,
  Music,
  Plus,
  Trash2,
  Save,
  FileEdit,
  FolderOpen,
  CheckCircle2,
  ChevronRight,
  Layers,
  Download,
  Upload
} from 'lucide-react';

export interface TabNote {
  string: number; // 0 (high E) to 5 (low E)
  fret: number;
  duration: number; // in beats, e.g. 0.25 (16th), 0.5 (8th), 1 (quarter)
  technique?: 'h' | 'p' | 'b' | '/' | '\\' | '~'; // hammer-on, pull-off, bend, slide, vibrato
}

export interface TabMeasure {
  id: number;
  notes: TabNote[];
}

export interface TabPiece {
  id: string;
  title: string;
  level: string;
  bpm: number;
  timeSignature: string;
  description: string;
  techniqueFocus: string;
  measures: TabMeasure[];
  isCustom?: boolean;
}

// Curated library of interactive guitar tablatures
export const TAB_LIBRARY: TabPiece[] = [
  {
    id: 'spider_chromatic',
    title: 'Ejercicio de Independencia: La Araña',
    level: 'Principiante / Intermedio',
    bpm: 80,
    timeSignature: '4/4',
    description: 'Fortalece la digitación 1-2-3-4 en trastes 5-8 sin levantar los dedos previos.',
    techniqueFocus: 'Sincronización de dedos y economía de movimiento',
    measures: [
      {
        id: 1,
        notes: [
          { string: 5, fret: 5, duration: 0.25 },
          { string: 5, fret: 6, duration: 0.25 },
          { string: 5, fret: 7, duration: 0.25 },
          { string: 5, fret: 8, duration: 0.25 },
          { string: 4, fret: 5, duration: 0.25 },
          { string: 4, fret: 6, duration: 0.25 },
          { string: 4, fret: 7, duration: 0.25 },
          { string: 4, fret: 8, duration: 0.25 },
          { string: 3, fret: 5, duration: 0.25 },
          { string: 3, fret: 6, duration: 0.25 },
          { string: 3, fret: 7, duration: 0.25 },
          { string: 3, fret: 8, duration: 0.25 },
          { string: 2, fret: 5, duration: 0.25 },
          { string: 2, fret: 6, duration: 0.25 },
          { string: 2, fret: 7, duration: 0.25 },
          { string: 2, fret: 8, duration: 0.25 }
        ]
      },
      {
        id: 2,
        notes: [
          { string: 1, fret: 5, duration: 0.25 },
          { string: 1, fret: 6, duration: 0.25 },
          { string: 1, fret: 7, duration: 0.25 },
          { string: 1, fret: 8, duration: 0.25 },
          { string: 0, fret: 5, duration: 0.25 },
          { string: 0, fret: 6, duration: 0.25 },
          { string: 0, fret: 7, duration: 0.25 },
          { string: 0, fret: 8, duration: 0.25 },
          { string: 0, fret: 8, duration: 0.25 },
          { string: 0, fret: 7, duration: 0.25 },
          { string: 0, fret: 6, duration: 0.25 },
          { string: 0, fret: 5, duration: 0.25 },
          { string: 1, fret: 8, duration: 0.25 },
          { string: 1, fret: 7, duration: 0.25 },
          { string: 1, fret: 6, duration: 0.25 },
          { string: 1, fret: 5, duration: 0.25 }
        ]
      }
    ]
  },
  {
    id: 'pentatonic_blues_lick',
    title: 'Solo Blues en Pentatónica Menor de Am',
    level: 'Intermedio',
    bpm: 90,
    timeSignature: '4/4',
    description: 'Fraseo clásico en Caja 1 con Bending de tono entero en traste 7 (cuerda G) y vibrato.',
    techniqueFocus: 'Bending expresivo, Hammer-on y resolución en tónica (La)',
    measures: [
      {
        id: 1,
        notes: [
          { string: 3, fret: 5, duration: 0.5 },
          { string: 3, fret: 7, duration: 0.5, technique: 'b' },
          { string: 1, fret: 5, duration: 0.5 },
          { string: 0, fret: 5, duration: 0.5 },
          { string: 1, fret: 8, duration: 0.5, technique: 'p' },
          { string: 1, fret: 5, duration: 0.5 },
          { string: 2, fret: 7, duration: 0.5, technique: 'b' },
          { string: 2, fret: 5, duration: 0.5 }
        ]
      },
      {
        id: 2,
        notes: [
          { string: 3, fret: 7, duration: 0.5 },
          { string: 3, fret: 5, duration: 0.5, technique: 'h' },
          { string: 4, fret: 7, duration: 1.0, technique: '~' },
          { string: 3, fret: 5, duration: 0.5 },
          { string: 2, fret: 7, duration: 0.5 },
          { string: 2, fret: 5, duration: 1.0, technique: '~' }
        ]
      }
    ]
  },
  {
    id: 'travis_fingerstyle',
    title: 'Travis Picking: Patrón Arpegiado Acústico',
    level: 'Intermedio',
    bpm: 96,
    timeSignature: '4/4',
    description: 'Bajo alternado con el pulgar en cuerdas graves mientras los dedos índice y medio tocan melodía.',
    techniqueFocus: 'Independencia de pulgar y arpegio polifónico',
    measures: [
      {
        id: 1,
        notes: [
          { string: 4, fret: 3, duration: 0.5 }, // C root (5th string)
          { string: 1, fret: 1, duration: 0.5 },
          { string: 3, fret: 2, duration: 0.5 },
          { string: 2, fret: 0, duration: 0.5 },
          { string: 4, fret: 3, duration: 0.5 },
          { string: 1, fret: 1, duration: 0.5 },
          { string: 3, fret: 2, duration: 0.5 },
          { string: 0, fret: 0, duration: 0.5 }
        ]
      },
      {
        id: 2,
        notes: [
          { string: 5, fret: 3, duration: 0.5 }, // G root (6th string)
          { string: 1, fret: 0, duration: 0.5 },
          { string: 3, fret: 0, duration: 0.5 },
          { string: 2, fret: 0, duration: 0.5 },
          { string: 5, fret: 3, duration: 0.5 },
          { string: 1, fret: 0, duration: 0.5 },
          { string: 3, fret: 0, duration: 0.5 },
          { string: 0, fret: 3, duration: 0.5 }
        ]
      }
    ]
  },
  {
    id: 'shred_alternate_picking',
    title: 'Púa Alternada a Alta Velocidad (16th Notes)',
    level: 'Avanzado',
    bpm: 110,
    timeSignature: '4/4',
    description: 'Entrenamiento de velocidad en sextinas y semicorcheas con pick slanting y cambio de cuerda.',
    techniqueFocus: 'Sincronización milimétrica y escape de púa',
    measures: [
      {
        id: 1,
        notes: [
          { string: 0, fret: 12, duration: 0.25 },
          { string: 0, fret: 10, duration: 0.25 },
          { string: 0, fret: 8, duration: 0.25 },
          { string: 0, fret: 10, duration: 0.25 },
          { string: 1, fret: 12, duration: 0.25 },
          { string: 1, fret: 10, duration: 0.25 },
          { string: 1, fret: 8, duration: 0.25 },
          { string: 1, fret: 10, duration: 0.25 },
          { string: 2, fret: 10, duration: 0.25 },
          { string: 2, fret: 9, duration: 0.25 },
          { string: 2, fret: 7, duration: 0.25 },
          { string: 2, fret: 9, duration: 0.25 },
          { string: 3, fret: 10, duration: 0.25 },
          { string: 3, fret: 9, duration: 0.25 },
          { string: 3, fret: 7, duration: 0.25 },
          { string: 3, fret: 9, duration: 0.25 }
        ]
      }
    ]
  }
];

// String tuning base frequencies: [High E, B, G, D, A, Low E]
const STRING_BASE_FREQS = [329.63, 246.94, 196.00, 146.83, 110.00, 82.41];
const STRING_NAMES = ['e (1ra)', 'B (2da)', 'G (3ra)', 'D (4ta)', 'A (5ta)', 'E (6ta)'];

export const InteractiveTabPlayer: React.FC = () => {
  const [customPieces, setCustomPieces] = useState<TabPiece[]>(() => {
    try {
      const saved = localStorage.getItem('guitarstudio_custom_tabs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allPieces = [...TAB_LIBRARY, ...customPieces];
  const [selectedPiece, setSelectedPiece] = useState<TabPiece>(TAB_LIBRARY[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [bpm, setBpm] = useState<number>(selectedPiece.bpm);
  const [activeNoteIndex, setActiveNoteIndex] = useState<number>(-1);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.85);

  // Tab Editor State
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editTitle, setEditTitle] = useState<string>('Mi Nuevo Lick Personalizado');
  const [editDescription, setEditDescription] = useState<string>('Ejercicio de técnica y velocidad');
  const [editNotes, setEditNotes] = useState<TabNote[]>([
    { string: 5, fret: 5, duration: 0.5 },
    { string: 5, fret: 7, duration: 0.5 },
    { string: 4, fret: 5, duration: 0.5 },
    { string: 4, fret: 7, duration: 0.5 },
    { string: 3, fret: 5, duration: 0.5 },
    { string: 3, fret: 7, duration: 0.5, technique: 'b' }
  ]);
  const [newNoteString, setNewNoteString] = useState<number>(0);
  const [newNoteFret, setNewNoteFret] = useState<number>(5);
  const [newNoteDuration, setNewNoteDuration] = useState<number>(0.5);
  const [newNoteTechnique, setNewNoteTechnique] = useState<string>('');

  const playbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save custom pieces to localStorage
  const saveCustomTabs = (tabs: TabPiece[]) => {
    setCustomPieces(tabs);
    localStorage.setItem('guitarstudio_custom_tabs', JSON.stringify(tabs));
  };

  // Flatten all notes across measures for playback
  const allNotes: { note: TabNote; measureId: number; globalIndex: number }[] = [];
  selectedPiece.measures.forEach((m) => {
    m.notes.forEach((n) => {
      allNotes.push({
        note: n,
        measureId: m.id,
        globalIndex: allNotes.length
      });
    });
  });

  // Calculate note frequency
  const getNoteFrequency = (stringIdx: number, fret: number): number => {
    const base = STRING_BASE_FREQS[stringIdx] || 440;
    return base * Math.pow(2, fret / 12);
  };

  // Play single note with Karplus-Strong
  const playNoteAudio = (stringIdx: number, fret: number) => {
    const freq = getNoteFrequency(stringIdx, fret);
    audioEngine.playKarplusStrong(freq, 2.2, volume, stringIdx);
  };

  // Switch piece
  const handleSelectPiece = (piece: TabPiece) => {
    stopPlayback();
    setSelectedPiece(piece);
    setBpm(piece.bpm);
    setActiveNoteIndex(-1);
  };

  // Start playback
  const startPlayback = () => {
    setIsPlaying(true);
    let currentIndex = activeNoteIndex >= 0 && activeNoteIndex < allNotes.length - 1 ? activeNoteIndex + 1 : 0;

    const playNext = () => {
      if (currentIndex >= allNotes.length) {
        if (isLooping) {
          currentIndex = 0;
        } else {
          stopPlayback();
          return;
        }
      }

      const item = allNotes[currentIndex];
      setActiveNoteIndex(currentIndex);
      playNoteAudio(item.note.string, item.note.fret);

      // Duration in milliseconds based on BPM: 1 beat = (60 / BPM) * 1000 ms
      const beatMs = (60 / bpm) * 1000;
      const noteDurationMs = item.note.duration * beatMs;

      currentIndex++;
      playbackTimerRef.current = setTimeout(playNext, noteDurationMs);
    };

    playNext();
  };

  const stopPlayback = () => {
    setIsPlaying(false);
    if (playbackTimerRef.current) {
      clearTimeout(playbackTimerRef.current);
      playbackTimerRef.current = null;
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  };

  const resetPlayback = () => {
    stopPlayback();
    setActiveNoteIndex(-1);
  };

  // Add Note to Editor
  const handleAddNoteToEditor = () => {
    const newNote: TabNote = {
      string: newNoteString,
      fret: newNoteFret,
      duration: newNoteDuration,
      technique: (newNoteTechnique || undefined) as any
    };
    setEditNotes([...editNotes, newNote]);
    playNoteAudio(newNoteString, newNoteFret);
  };

  // Remove Note from Editor
  const handleRemoveNoteFromEditor = (idx: number) => {
    setEditNotes(editNotes.filter((_, i) => i !== idx));
  };

  // Save Custom Piece
  const handleSaveCustomTab = () => {
    if (editNotes.length === 0) return;
    const newPiece: TabPiece = {
      id: 'custom_' + Date.now(),
      title: editTitle || 'Mi Tablatura',
      level: 'Personalizado',
      bpm: bpm,
      timeSignature: '4/4',
      description: editDescription || 'Creado con el Editor de GuitarStudio Pro',
      techniqueFocus: 'Composición propia',
      isCustom: true,
      measures: [
        {
          id: 1,
          notes: editNotes
        }
      ]
    };

    const updated = [newPiece, ...customPieces];
    saveCustomTabs(updated);
    setSelectedPiece(newPiece);
    setIsEditing(false);
  };

  // Delete Custom Piece
  const handleDeleteCustomPiece = (id: string) => {
    const updated = customPieces.filter((p) => p.id !== id);
    saveCustomTabs(updated);
    if (selectedPiece.id === id) {
      setSelectedPiece(TAB_LIBRARY[0]);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearTimeout(playbackTimerRef.current);
    };
  }, []);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Music className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Tablatura Interactiva & Editor DAW</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Karplus-Strong DSP
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Síntesis física de cuerda pulsada, visualizador con cursor DAW y creador de tablaturas personalizadas
            </p>
          </div>
        </div>

        {/* Mode Toggle: Player / Editor */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isEditing
                ? 'bg-purple-600 text-white shadow-purple-600/30'
                : 'bg-slate-950 border border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            <FileEdit className="w-4 h-4" />
            <span>{isEditing ? 'Ver Reproductor' : 'Crear / Editar Tab'}</span>
          </button>

          {!isEditing && (
            <select
              value={selectedPiece.id}
              onChange={(e) => {
                const p = allPieces.find((item) => item.id === e.target.value);
                if (p) handleSelectPiece(p);
              }}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl focus:border-amber-500 outline-none cursor-pointer max-w-[200px] sm:max-w-xs truncate"
            >
              <optgroup label="Biblioteca Oficial">
                {TAB_LIBRARY.map((piece) => (
                  <option key={piece.id} value={piece.id}>
                    {piece.title} ({piece.level})
                  </option>
                ))}
              </optgroup>
              {customPieces.length > 0 && (
                <optgroup label="Mis Tablaturas Creadas">
                  {customPieces.map((piece) => (
                    <option key={piece.id} value={piece.id}>
                      ★ {piece.title}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          )}
        </div>
      </div>

      {/* TAB EDITOR VIEW */}
      {isEditing ? (
        <div className="bg-slate-950 rounded-3xl p-5 sm:p-7 border border-purple-500/30 space-y-6 shadow-inner animate-fadeIn">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <FileEdit className="w-5 h-5 text-purple-400" /> Creador de Tablaturas Interactivas
              </h3>
              <p className="text-xs text-slate-400">
                Agrega notas cuerda por cuerda, asigna técnicas y guárdalas para reproducirlas en el estudio.
              </p>
            </div>

            <button
              onClick={handleSaveCustomTab}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Tablatura</span>
            </button>
          </div>

          {/* Tab Metainfo Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Título de la Tablatura</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-purple-500 outline-none"
                placeholder="Ej. Solo Intro Rock en Re"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">Descripción / Enfoque</label>
              <input
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:border-purple-500 outline-none"
                placeholder="Ej. Bending y púa alternada"
              />
            </div>
          </div>

          {/* Note Input Controls */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3">
            <span className="text-xs font-bold text-purple-300 block">Añadir Nota al Compás:</span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Cuerda</label>
                <select
                  value={newNoteString}
                  onChange={(e) => setNewNoteString(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl"
                >
                  {STRING_NAMES.map((name, idx) => (
                    <option key={idx} value={idx}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Traste (0 - 24)</label>
                <input
                  type="number"
                  min={0}
                  max={24}
                  value={newNoteFret}
                  onChange={(e) => setNewNoteFret(parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Duración (Pulsos)</label>
                <select
                  value={newNoteDuration}
                  onChange={(e) => setNewNoteDuration(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl"
                >
                  <option value={0.25}>1/16 (Semicorchea)</option>
                  <option value={0.5}>1/8 (Corchea)</option>
                  <option value={1.0}>1/4 (Negra)</option>
                  <option value={2.0}>1/2 (Blanca)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Técnica Expresiva</label>
                <select
                  value={newNoteTechnique}
                  onChange={(e) => setNewNoteTechnique(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl"
                >
                  <option value="">Normal</option>
                  <option value="h">Hammer-on (h)</option>
                  <option value="p">Pull-off (p)</option>
                  <option value="b">Bending (b)</option>
                  <option value="/">Slide Ascendente (/)</option>
                  <option value="\">Slide Descendente (\)</option>
                  <option value="~">Vibrato (~)</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={handleAddNoteToEditor}
                  className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insertar Nota</span>
                </button>
              </div>
            </div>
          </div>

          {/* Editor Sequence Preview */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400">
              Secuencia Actual ({editNotes.length} notas):
            </span>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900/50 rounded-2xl border border-slate-800">
              {editNotes.map((n, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono text-slate-200 group hover:border-purple-500/50"
                >
                  <span className="text-purple-400 font-bold">#{idx + 1}</span>
                  <span>{STRING_NAMES[n.string].split(' ')[0]}: Traste {n.fret}</span>
                  {n.technique && <span className="text-amber-400">({n.technique})</span>}
                  <button
                    onClick={() => playNoteAudio(n.string, n.fret)}
                    className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer"
                    title="Escuchar"
                  >
                    <Play className="w-3 h-3 fill-current" />
                  </button>
                  <button
                    onClick={() => handleRemoveNoteFromEditor(idx)}
                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* STANDARD TAB PLAYER VIEW */
        <>
          {/* Piece Info & Focus */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-amber-400 text-sm flex items-center gap-2">
                <span>{selectedPiece.title}</span>
                {selectedPiece.isCustom && (
                  <button
                    onClick={() => handleDeleteCustomPiece(selectedPiece.id)}
                    className="p-1 text-rose-400 hover:text-rose-300 rounded cursor-pointer"
                    title="Eliminar tablatura personalizada"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-slate-400">{selectedPiece.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium">
                🎯 {selectedPiece.techniqueFocus}
              </span>
            </div>
          </div>

          {/* Control Transport Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
            {/* Playback buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={togglePlayback}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isPlaying
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pausar' : 'Reproducir Tab'}</span>
              </button>

              <button
                onClick={resetPlayback}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Reiniciar cursor al inicio"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isLooping
                    ? 'bg-purple-600/30 border border-purple-500 text-purple-300'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Bucle continuo de reproducción"
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Loop</span>
              </button>
            </div>

            {/* BPM and Speed */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold text-slate-300">Tempo:</span>
                <span className="font-mono font-bold text-amber-400 text-sm w-12">{bpm} BPM</span>
                <input
                  type="range"
                  min={40}
                  max={200}
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value, 10))}
                  className="w-24 sm:w-32 accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {[60, 80, 100, 120].map((presetBpm) => (
                  <button
                    key={presetBpm}
                    onClick={() => setBpm(presetBpm)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                      bpm === presetBpm ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {presetBpm}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Tablature Score Canvas with Real-Time Animated Cursor */}
          <div className="bg-slate-950 rounded-2xl p-5 sm:p-6 border border-slate-800 shadow-inner overflow-x-auto">
            <div className="min-w-[650px] space-y-4">
              {/* Tab Staff */}
              <div className="relative font-mono select-none">
                {/* 6 Guitar Strings */}
                {[0, 1, 2, 3, 4, 5].map((stringIdx) => (
                  <div
                    key={stringIdx}
                    className="relative h-10 flex items-center border-b border-slate-800/80 group"
                  >
                    {/* String Label */}
                    <div className="w-16 flex-shrink-0 text-xs font-bold text-amber-400/80 uppercase">
                      {STRING_NAMES[stringIdx]}
                    </div>

                    {/* Score notes on this string */}
                    <div className="flex-1 flex items-center justify-between relative pl-4 pr-6">
                      {allNotes.map((item, idx) => {
                        const isThisString = item.note.string === stringIdx;
                        const isActive = activeNoteIndex === idx;

                        return (
                          <div
                            key={idx}
                            onClick={() => {
                              setActiveNoteIndex(idx);
                              playNoteAudio(item.note.string, item.note.fret);
                            }}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isThisString
                                ? isActive
                                ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/50 scale-125 z-20 ring-2 ring-white font-black'
                                : 'bg-slate-900 border border-slate-700 text-slate-100 hover:border-amber-400 hover:bg-slate-800'
                              : isActive
                              ? 'bg-amber-500/10 border-b border-amber-500/30'
                              : 'opacity-20 text-slate-700'
                            }`}
                          >
                            {isThisString ? (
                              <div className="flex flex-col items-center">
                                <span>{item.note.fret}</span>
                                {item.note.technique && (
                                  <span className="text-[9px] text-amber-400 -mt-1 font-sans">
                                    {item.note.technique}
                                  </span>
                                )}
                              </div>
                            ) : (
                              '—'
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-800">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Haz clic en cualquier número para escuchar el sonido
                  físico de la cuerda.
                </span>
                <span className="font-mono text-slate-400">
                  Nota Actual:{' '}
                  <strong className="text-amber-400">
                    {activeNoteIndex >= 0 ? `${activeNoteIndex + 1} / ${allNotes.length}` : 'En pausa'}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
