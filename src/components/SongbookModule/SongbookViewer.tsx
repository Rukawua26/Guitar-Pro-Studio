import React, { useState, useEffect, useRef } from 'react';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  BookOpen,
  Play,
  Pause,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Volume2,
  Sparkles,
  Search,
  Plus,
  Trash2,
  Save,
  Music,
  CheckCircle2
} from 'lucide-react';

interface SongChordInfo {
  name: string;
  frets: (number | 'x')[];
}

const CHORD_DB: Record<string, (number | 'x')[]> = {
  'C': ['x', 3, 2, 0, 1, 0],
  'C#': ['x', 4, 3, 1, 2, 1],
  'D': ['x', 'x', 0, 2, 3, 2],
  'D#': ['x', 'x', 1, 3, 4, 3],
  'E': [0, 2, 2, 1, 0, 0],
  'F': [1, 3, 3, 2, 1, 1],
  'F#': [2, 4, 4, 3, 2, 2],
  'G': [3, 2, 0, 0, 0, 3],
  'G#': [4, 3, 1, 1, 1, 4],
  'A': ['x', 0, 2, 2, 2, 0],
  'A#': ['x', 1, 3, 3, 3, 1],
  'B': ['x', 2, 4, 4, 4, 2],
  // Minors
  'Cm': ['x', 3, 5, 5, 4, 3],
  'C#m': ['x', 4, 6, 6, 5, 4],
  'Dm': ['x', 'x', 0, 2, 3, 1],
  'D#m': ['x', 'x', 1, 3, 4, 2],
  'Em': [0, 2, 2, 0, 0, 0],
  'Fm': [1, 3, 3, 1, 1, 1],
  'F#m': [2, 4, 4, 2, 2, 2],
  'Gm': [3, 5, 5, 3, 3, 3],
  'G#m': [4, 6, 6, 4, 4, 4],
  'Am': ['x', 0, 2, 2, 1, 0],
  'A#m': ['x', 1, 3, 3, 2, 1],
  'Bm': ['x', 2, 4, 4, 3, 2],
  // 7ths
  'C7': ['x', 3, 2, 3, 1, 0],
  'D7': ['x', 'x', 0, 2, 1, 2],
  'E7': [0, 2, 0, 1, 0, 0],
  'G7': [3, 2, 0, 0, 0, 1],
  'A7': ['x', 0, 2, 0, 2, 0],
  'B7': ['x', 2, 1, 2, 0, 2]
};

const NOTE_SCALE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

interface SongItem {
  id: string;
  title: string;
  artist: string;
  key: string;
  genre: string;
  tempoBpm: number;
  lyricsAndChords: string;
}

const SONG_CATALOG: SongItem[] = [
  {
    id: 'stand_by_me',
    title: 'Stand By Me',
    artist: 'Ben E. King',
    key: 'G',
    genre: 'Soul / Classic',
    tempoBpm: 118,
    lyricsAndChords: `[G]
When the night has come
[Em]
And the land is dark
        [C]          [D]             [G]
And the moon is the only light we'll see

[G]
No I won't be afraid, no I won't be afraid
        [Em]
Just as long as you stand, stand by me

[G]
So darling, darling, stand by me,
    [Em]
Oh, stand by me
     [C]       [D]          [G]
Oh, stand, stand by me, stand by me`
  },
  {
    id: 'knockin_on_heavens_door',
    title: "Knockin' On Heaven's Door",
    artist: 'Bob Dylan / Guns N Roses',
    key: 'G',
    genre: 'Classic Rock',
    tempoBpm: 68,
    lyricsAndChords: `[G]           [D]            [Am]
Mama, take this badge off of me
[G]         [D]         [C]
I can't use it anymore
[G]           [D]                 [Am]
It's gettin' dark, too dark to see
[G]           [D]                    [C]
I feel I'm knockin' on heaven's door

[G]         [D]                  [Am]
Knock, knock, knockin' on heaven's door
[G]         [D]                  [C]
Knock, knock, knockin' on heaven's door
[G]         [D]                  [Am]
Knock, knock, knockin' on heaven's door
[G]         [D]                  [C]
Knock, knock, knockin' on heaven's door`
  },
  {
    id: 'de_musica_ligera',
    title: 'De Música Ligera',
    artist: 'Soda Stereo',
    key: 'Bm',
    genre: 'Rock en Español',
    tempoBpm: 125,
    lyricsAndChords: `[Bm]   [G]   [D]   [A]

[Bm]            [G]
Ella durmió al calor de las masas
[D]               [A]
Y yo desperté queriendo soñarla
[Bm]           [G]
Algún tiempo atrás pensé en escribirle
[D]                    [A]
Que nunca sorteé las trampas del amor

[Bm]        [G]        [D]        [A]
De aquel amor de música ligera
[Bm]     [G]          [D]        [A]
Nada nos libra, nada más queda`
  },
  {
    id: 'creep_radiohead',
    title: 'Creep',
    artist: 'Radiohead',
    key: 'G',
    genre: 'Alternative Rock',
    tempoBpm: 92,
    lyricsAndChords: `[G]
When you were here before
[B]
Couldn't look you in the eye
[C]
You're just like an angel
[Cm]
Your skin makes me cry

[G]
You float like a feather
[B]
In a beautiful world
[C]
I wish I was special
[Cm]
You're so fuckin' special

        [G]
But I'm a creep
        [B]
I'm a weirdo
                [C]
What the hell am I doin' here?
        [Cm]
I don't belong here`
  },
  {
    id: 'let_it_be',
    title: 'Let It Be',
    artist: 'The Beatles',
    key: 'C',
    genre: 'Pop Rock',
    tempoBpm: 75,
    lyricsAndChords: `[C]               [G]
When I find myself in times of trouble
[Am]           [F]
Mother Mary comes to me
[C]               [G]              [F]   [C]
Speaking words of wisdom, let it be

[C]              [G]
And in my hour of darkness
        [Am]               [F]
She is standing right in front of me
[C]               [G]              [F]   [C]
Speaking words of wisdom, let it be

        [Am]       [G]       [F]       [C]
Let it be, let it be, let it be, let it be
[C]               [G]              [F]   [C]
Whisper words of wisdom, let it be`
  }
];

export const SongbookViewer: React.FC = () => {
  const [selectedSong, setSelectedSong] = useState<SongItem>(SONG_CATALOG[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [transposeOffset, setTransposeOffset] = useState<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(false);
  const [scrollSpeed, setScrollSpeed] = useState<number>(2); // 1 to 6
  const [hoveredChord, setHoveredChord] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const scrollAnimRef = useRef<number | null>(null);

  // Transpose a chord name by offset semitones
  const transposeChord = (chordStr: string, offset: number): string => {
    if (offset === 0) return chordStr;
    const match = chordStr.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chordStr;

    let root = match[1];
    const suffix = match[2] || '';

    if (root.endsWith('b')) {
      const natural = root[0];
      const natIdx = NOTE_SCALE.indexOf(natural);
      root = NOTE_SCALE[(natIdx - 1 + 12) % 12];
    }

    const idx = NOTE_SCALE.indexOf(root);
    if (idx === -1) return chordStr;

    const newIdx = (idx + offset + 120) % 12;
    return NOTE_SCALE[newIdx] + suffix;
  };

  // Play chord audio
  const handlePlayChord = (chordName: string) => {
    const baseChord = chordName.replace(/[^A-G#m7]/g, '');
    const frets = CHORD_DB[baseChord] || CHORD_DB[chordName] || [0, 2, 2, 0, 0, 0];
    audioEngine.playChord(frets, 1, 28);
  };

  // Auto-scroll logic with requestAnimationFrame
  useEffect(() => {
    let lastTime = performance.now();

    const stepScroll = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      if (scrollContainerRef.current && isAutoScrolling) {
        // Pixels per second based on speed (10px/s * speed)
        const px = scrollSpeed * 22 * delta;
        scrollContainerRef.current.scrollTop += px;
      }

      if (isAutoScrolling) {
        scrollAnimRef.current = requestAnimationFrame(stepScroll);
      }
    };

    if (isAutoScrolling) {
      lastTime = performance.now();
      scrollAnimRef.current = requestAnimationFrame(stepScroll);
    } else {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    }

    return () => {
      if (scrollAnimRef.current) cancelAnimationFrame(scrollAnimRef.current);
    };
  }, [isAutoScrolling, scrollSpeed]);

  // Reset scroll on song change
  const handleSelectSong = (song: SongItem) => {
    setIsAutoScrolling(false);
    setSelectedSong(song);
    setTransposeOffset(0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  };

  const filteredSongs = SONG_CATALOG.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Render text with interactive chord badges
  const renderTransposedContent = (text: string) => {
    return text.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\[[^\]]+\])/g);

      return (
        <div key={lineIdx} className="min-h-[1.5rem] leading-relaxed">
          {parts.map((part, pIdx) => {
            if (part.startsWith('[') && part.endsWith(']')) {
              const rawChord = part.slice(1, -1);
              const chord = transposeChord(rawChord, transposeOffset);

              return (
                <button
                  key={pIdx}
                  onClick={() => handlePlayChord(chord)}
                  onMouseEnter={() => setHoveredChord(chord)}
                  className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg bg-amber-500/20 hover:bg-amber-500 hover:text-slate-950 text-amber-300 font-mono font-bold text-xs border border-amber-500/40 transition-all cursor-pointer shadow-sm"
                  title="Haz clic para escuchar el acorde"
                >
                  <span>{chord}</span>
                </button>
              );
            }
            return <span key={pIdx} className="text-slate-200">{part}</span>;
          })}
        </div>
      );
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Cancionero con Auto-Scroll & Acordes Interactivos</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Transposición en Vivo
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Toca sin despegar las manos con teleprompter suave y escucha la digitación de cualquier acorde
            </p>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar canción o artista..."
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs pl-9 pr-4 py-2 rounded-xl focus:border-amber-500 outline-none w-48 sm:w-64"
          />
        </div>
      </div>

      {/* Song Catalog Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {filteredSongs.map((s) => (
          <button
            key={s.id}
            onClick={() => handleSelectSong(s)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex-shrink-0 ${
              selectedSong.id === s.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-slate-950 border border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            {s.title} • <span className="font-normal opacity-80">{s.artist}</span>
          </button>
        ))}
      </div>

      {/* Main Song & Teleprompter Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-950/90 rounded-2xl border border-slate-800">
        {/* Play Auto-Scroll */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
              isAutoScrolling
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
            }`}
          >
            {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isAutoScrolling ? 'Pausar Desplazamiento' : 'Iniciar Auto-Scroll'}</span>
          </button>

          <button
            onClick={() => {
              setIsAutoScrolling(false);
              if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
            }}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer"
            title="Volver al inicio"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Scroll Speed Controls */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-300">Velocidad:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {[1, 2, 3, 4, 5].map((speed) => (
              <button
                key={speed}
                onClick={() => setScrollSpeed(speed)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold cursor-pointer transition-colors ${
                  scrollSpeed === speed
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {/* Transpose Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">Transposición:</span>
          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setTransposeOffset((p) => p - 1)}
              className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer rounded"
              title="Bajar 1 semitono"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <span className="font-mono font-bold text-amber-400 text-xs px-2">
              {transposeOffset > 0 ? `+${transposeOffset}` : transposeOffset} semitonos
            </span>
            <button
              onClick={() => setTransposeOffset((p) => p + 1)}
              className="p-1 text-slate-400 hover:text-amber-400 cursor-pointer rounded"
              title="Subir 1 semitono"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Song Lyrics & Chords Auto-Scroll Canvas */}
      <div
        ref={scrollContainerRef}
        className="bg-slate-950 rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-inner max-h-[500px] overflow-y-auto font-sans text-sm sm:text-base space-y-6 relative"
      >
        {/* Title Header */}
        <div className="border-b border-slate-800 pb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-2xl font-black text-slate-100">{selectedSong.title}</h3>
            <p className="text-sm font-medium text-amber-400">{selectedSong.artist}</p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
              Tonalidad: <strong>{transposeChord(selectedSong.key, transposeOffset)}</strong>
            </span>
            <span className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-xl text-slate-300">
              Tempo: <strong>{selectedSong.tempoBpm} BPM</strong>
            </span>
          </div>
        </div>

        {/* Formatted Content */}
        <div className="font-mono text-slate-300 leading-loose whitespace-pre-wrap select-text">
          {renderTransposedContent(selectedSong.lyricsAndChords)}
        </div>

        <div className="text-center text-xs text-slate-600 pt-8 pb-4">
          — Fin de la Canción —
        </div>
      </div>
    </div>
  );
};
