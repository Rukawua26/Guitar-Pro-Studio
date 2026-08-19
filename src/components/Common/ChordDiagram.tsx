import React from 'react';
import { ChordShape } from '../../types/course';
import { audioEngine } from '../../utils/audioSynthesizer';
import { Volume2 } from 'lucide-react';

interface ChordDiagramProps {
  chord: ChordShape;
  size?: 'sm' | 'md' | 'lg';
  showPlayButton?: boolean;
}

export const ChordDiagram: React.FC<ChordDiagramProps> = ({
  chord,
  size = 'md',
  showPlayButton = true
}) => {
  const numStrings = 6;
  const numFrets = 4;

  const width = size === 'sm' ? 140 : size === 'lg' ? 220 : 170;
  const height = size === 'sm' ? 170 : size === 'lg' ? 260 : 210;
  const paddingX = size === 'sm' ? 24 : size === 'lg' ? 36 : 28;
  const paddingTop = size === 'sm' ? 42 : size === 'lg' ? 58 : 48;
  const paddingBottom = size === 'sm' ? 20 : size === 'lg' ? 30 : 24;

  const stringSpacing = (width - paddingX * 2) / (numStrings - 1);
  const fretSpacing = (height - paddingTop - paddingBottom) / numFrets;

  const baseFret = chord.baseFret || 1;

  const handlePlayChord = (e: React.MouseEvent) => {
    e.stopPropagation();
    audioEngine.playChord(chord.frets, baseFret, 30);
  };

  return (
    <div className="flex flex-col items-center p-3.5 bg-slate-900/80 border border-slate-800/80 rounded-xl hover:border-amber-500/40 transition-all shadow-lg backdrop-blur-sm group">
      <div className="flex items-center justify-between w-full mb-1">
        <span className="font-bold text-amber-400 text-sm tracking-wide group-hover:text-amber-300">
          {chord.name}
        </span>
        {showPlayButton && (
          <button
            onClick={handlePlayChord}
            title="Escuchar acorde"
            className="p-1 text-slate-400 hover:text-amber-400 bg-slate-800 hover:bg-slate-700/80 rounded-md transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <svg width={width} height={height} className="overflow-visible select-none">
        {/* Nut (thick top bar if baseFret === 1) */}
        {baseFret === 1 ? (
          <rect
            x={paddingX - 1}
            y={paddingTop - 4}
            width={width - paddingX * 2 + 2}
            height={5}
            fill="#e2e8f0"
            rx={1}
          />
        ) : (
          <text
            x={paddingX - 16}
            y={paddingTop + fretSpacing * 0.6}
            fill="#f59e0b"
            fontSize={size === 'sm' ? 10 : 12}
            fontWeight="bold"
            textAnchor="middle"
          >
            {baseFret}fr
          </text>
        )}

        {/* Fret horizontal lines */}
        {Array.from({ length: numFrets + 1 }).map((_, i) => (
          <line
            key={`fret-${i}`}
            x1={paddingX}
            y1={paddingTop + i * fretSpacing}
            x2={width - paddingX}
            y2={paddingTop + i * fretSpacing}
            stroke="#475569"
            strokeWidth={i === 0 && baseFret === 1 ? 3 : 1.5}
          />
        ))}

        {/* String vertical lines (E A D G B e) */}
        {Array.from({ length: numStrings }).map((_, i) => {
          const x = paddingX + i * stringSpacing;
          return (
            <line
              key={`string-${i}`}
              x1={x}
              y1={paddingTop}
              x2={x}
              y2={paddingTop + numFrets * fretSpacing}
              stroke={i >= 3 ? '#94a3b8' : '#cbd5e1'}
              strokeWidth={Math.max(1, (6 - i) * 0.45)}
            />
          );
        })}

        {/* Fretting markers and Open / Mute Indicators above nut */}
        {chord.frets.map((fret, stringIdx) => {
          const x = paddingX + stringIdx * stringSpacing;
          const markerY = paddingTop - (size === 'sm' ? 12 : 16);

          if (fret === 'x') {
            return (
              <text
                key={`mute-${stringIdx}`}
                x={x}
                y={markerY + 2}
                textAnchor="middle"
                fill="#ef4444"
                fontSize={size === 'sm' ? 12 : 14}
                fontWeight="bold"
              >
                ✕
              </text>
            );
          }

          if (fret === 0) {
            return (
              <circle
                key={`open-${stringIdx}`}
                cx={x}
                cy={markerY - 2}
                r={size === 'sm' ? 4 : 5}
                stroke="#10b981"
                strokeWidth={2}
                fill="none"
              />
            );
          }

          // Pressed fret dot
          const relativeFret = baseFret === 1 ? fret : fret - baseFret + 1;
          if (relativeFret >= 1 && relativeFret <= numFrets) {
            const y = paddingTop + (relativeFret - 0.5) * fretSpacing;
            const finger = chord.fingers ? chord.fingers[stringIdx] : null;

            return (
              <g key={`dot-${stringIdx}`}>
                <circle
                  cx={x}
                  cy={y}
                  r={size === 'sm' ? 7 : 9}
                  fill="#f59e0b"
                  stroke="#fbbf24"
                  strokeWidth={1.5}
                />
                {finger && finger !== 'x' && finger !== 0 && (
                  <text
                    x={x}
                    y={y + (size === 'sm' ? 3.5 : 4)}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize={size === 'sm' ? 9 : 11}
                    fontWeight="bold"
                  >
                    {finger}
                  </text>
                )}
              </g>
            );
          }
          return null;
        })}
      </svg>

      <div className="flex justify-between w-full px-2 text-[10px] text-slate-500 font-mono mt-0.5">
        <span>E</span>
        <span>A</span>
        <span>D</span>
        <span>G</span>
        <span>B</span>
        <span>e</span>
      </div>
    </div>
  );
};
