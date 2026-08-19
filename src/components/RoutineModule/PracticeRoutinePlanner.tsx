import React, { useState, useEffect, useRef } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Clock,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Award,
  ChevronRight,
  Zap,
  Timer
} from 'lucide-react';

export interface RoutineBlock {
  id: string;
  name: string;
  category: 'Calentamiento' | 'Técnica' | 'Teoría' | 'Repertorio';
  minutes: number;
  description: string;
  instructions: string[];
}

export const PracticeRoutinePlanner: React.FC = () => {
  const { addPracticeSession, addNotification, setActiveTab } = useGuitar();

  const [routineDuration, setRoutineDuration] = useState<15 | 30 | 60>(30);
  const [focusArea, setFocusArea] = useState<'balance' | 'speed' | 'chords' | 'theory'>('balance');

  // Routine blocks based on chosen parameters
  const [blocks, setBlocks] = useState<RoutineBlock[]>([]);
  const [currentBlockIndex, setCurrentBlockIndex] = useState<number>(0);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [completedBlocks, setCompletedBlocks] = useState<Record<string, boolean>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate routine structure
  const generateRoutine = (duration: 15 | 30 | 60, focus: string) => {
    let generated: RoutineBlock[] = [];

    if (duration === 15) {
      generated = [
        {
          id: 'b1',
          name: 'Calentamiento Rápido: La Araña',
          category: 'Calentamiento',
          minutes: 3,
          description: 'Digitación cromática 1-2-3-4 en trastes 5-8 con metrónomo a 70 BPM.',
          instructions: ['Mantén los dedos cerca de las cuerdas', 'Sin tensión en el pulgar posterior']
        },
        {
          id: 'b2',
          name: focus === 'speed' ? 'Púa Alternada & Sincronización' : 'Cambio Rápido de Acordes',
          category: 'Técnica',
          minutes: 7,
          description: 'Entrenamiento de precisión con metrónomo.',
          instructions: ['1 minuto por transición de acordes', 'Palm muting relajado']
        },
        {
          id: 'b3',
          name: 'Repertorio del Día',
          category: 'Repertorio',
          minutes: 5,
          description: 'Toca la canción de referencia de tu nivel actual.',
          instructions: ['Toca con base o metrónomo', 'Concéntrate en la musicalidad']
        }
      ];
    } else if (duration === 30) {
      generated = [
        {
          id: 'b1',
          name: 'Calentamiento & Biomecánica',
          category: 'Calentamiento',
          minutes: 5,
          description: 'Estiramientos suaves de muñeca y digitación La Araña en 6 cuerdas.',
          instructions: ['Comienza a tempo lento (60 BPM)', 'Verifica que no haya tensión en los hombros']
        },
        {
          id: 'b2',
          name: focus === 'speed' ? 'Velocidad y Escape de Púa' : 'Cejillas & Fuerza de Mano',
          category: 'Técnica',
          minutes: 10,
          description: 'Dominio de cejilla en F / Bm o secuencias de semicorcheas alternadas.',
          instructions: ['Coloca el índice pegado al traste', 'Gira levemente el dedo hacia el lateral']
        },
        {
          id: 'b3',
          name: 'Teoría Aplicada & Diapasón CAGED',
          category: 'Teoría',
          minutes: 7,
          description: 'Localización de tríadas y notas tónicas en las cuerdas 5 y 6.',
          instructions: ['Recita las notas en voz alta mientras las tocas', 'Visualiza la caja de la pentatónica']
        },
        {
          id: 'b4',
          name: 'Canción y Expresión Musical',
          category: 'Repertorio',
          minutes: 8,
          description: 'Estudio de solo, dinámica de rasgueo y ritmo constante.',
          instructions: ['Graba un fragmento si es posible para evaluar tu tiempo', 'Toca con emoción']
        }
      ];
    } else {
      // 60 minutes
      generated = [
        {
          id: 'b1',
          name: 'Calentamiento Pro & Independencia',
          category: 'Calentamiento',
          minutes: 10,
          description: 'Digitaciones cruzadas, ligados (legato) y estiramientos fisiológicos.',
          instructions: ['Mantén el dedo 1 firme mientras el 4 se estira', 'Aumenta 5 BPM cada 2 minutos']
        },
        {
          id: 'b2',
          name: 'Técnica Intensiva: Púa Alternada / Cejillas',
          category: 'Técnica',
          minutes: 18,
          description: 'Aceleración progresiva con metrónomo hasta alcanzar tu BPM objetivo.',
          instructions: ['Si cometes 2 errores seguidos, baja 5 BPM', 'Mantén la púa a 45 grados']
        },
        {
          id: 'b3',
          name: 'Armonía, Diapasón & Entrenamiento Auditivo',
          category: 'Teoría',
          minutes: 14,
          description: 'Mapeo de los 7 Modos Griegos, intervalos de oído y formas de acordes séptima.',
          instructions: ['Identifica la 3ra mayor vs 3ra menor', 'Toca el modo Lidio sobre pedal de C']
        },
        {
          id: 'b4',
          name: 'Repertorio, Grabación e Improvisación',
          category: 'Repertorio',
          minutes: 18,
          description: 'Montaje de temas completos, improvisación sobre backing tracks y autocrítica.',
          instructions: ['Usa el Estudio DAW para registrar tu mejor toma', 'Revisa el tiempo y la afinación']
        }
      ];
    }

    setBlocks(generated);
    setCurrentBlockIndex(0);
    setSecondsRemaining(generated[0]?.minutes * 60 || 300);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    generateRoutine(routineDuration, focusArea);
  }, [routineDuration, focusArea]);

  // Timer interval handling
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            // Block completed! Play chime
            audioEngine.playInTuneAffirmation();
            const currentB = blocks[currentBlockIndex];
            setCompletedBlocks((c) => ({ ...c, [currentB.id]: true }));

            if (currentBlockIndex < blocks.length - 1) {
              // Move to next block
              const nextIndex = currentBlockIndex + 1;
              setCurrentBlockIndex(nextIndex);
              addNotification(
                'Siguiente Bloque de Práctica 🔔',
                `Comenzando: ${blocks[nextIndex].name}`,
                'info'
              );
              return blocks[nextIndex].minutes * 60;
            } else {
              // Entire routine finished!
              setIsTimerRunning(false);
              addPracticeSession(
                routineDuration,
                `Rutina diaria de ${routineDuration} min (${focusArea}) completada con éxito.`,
                blocks.map((b) => b.name)
              );
              addNotification(
                '¡Rutina Diaria Completada! 🏆',
                `Has sumado ${routineDuration} minutos a tu registro de práctica.`,
                'success'
              );
              return 0;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, currentBlockIndex, blocks, routineDuration, focusArea]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentBlock = blocks[currentBlockIndex];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center gap-2">
              <span>Planificador Inteligente de Rutinas Diarias</span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Bloques Guiados
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Estructura tu sesión diaria con cronometrado biomecánico y registro automático en tu diario
            </p>
          </div>
        </div>

        {/* Duration selector */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800">
          {[15, 30, 60].map((mins) => (
            <button
              key={mins}
              onClick={() => {
                setRoutineDuration(mins as 15 | 30 | 60);
                setIsTimerRunning(false);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                routineDuration === mins
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mins} Min
            </button>
          ))}
        </div>
      </div>

      {/* Focus Area Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { id: 'balance', label: 'Balance Integral', desc: 'Técnica + Teoría + Canción' },
          { id: 'speed', label: 'Técnica & Velocidad', desc: 'Púa alternada y destreza' },
          { id: 'chords', label: 'Acordes & Ritmo', desc: 'Cejillas, rasgueos, canciones' },
          { id: 'theory', label: 'Teoría & Diapasón', desc: 'CAGED, intervalos, modos' }
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => {
              setFocusArea(f.id as any);
              setIsTimerRunning(false);
            }}
            className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
              focusArea === f.id
                ? 'bg-amber-500/20 border-amber-500 shadow-md'
                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-400'
            }`}
          >
            <div className={`font-bold text-xs ${focusArea === f.id ? 'text-amber-300' : 'text-slate-200'}`}>
              {f.label}
            </div>
            <div className="text-[11px] text-slate-500 leading-tight mt-0.5">{f.desc}</div>
          </button>
        ))}
      </div>

      {/* Active Phase Display Card */}
      {currentBlock && (
        <div className="bg-slate-950 rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-inner">
          <div className="space-y-2 text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase">
                {currentBlock.category} • Bloque {currentBlockIndex + 1} de {blocks.length}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-slate-100">{currentBlock.name}</h3>
            <p className="text-xs sm:text-sm text-slate-400">{currentBlock.description}</p>
            <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
              {currentBlock.instructions.map((ins, idx) => (
                <span
                  key={idx}
                  className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {ins}
                </span>
              ))}
            </div>
          </div>

          {/* Timer Display */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-36 h-36 rounded-full bg-slate-900 border-4 border-amber-500/40 flex flex-col items-center justify-center shadow-2xl relative">
              <span className="font-mono text-3xl font-black text-amber-400">
                {formatTime(secondsRemaining)}
              </span>
              <span className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">Restante</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all ${
                  isTimerRunning
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                }`}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isTimerRunning ? 'Pausar' : 'Iniciar Bloque'}</span>
              </button>

              <button
                onClick={() => {
                  setIsTimerRunning(false);
                  setSecondsRemaining(currentBlock.minutes * 60);
                }}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl cursor-pointer"
                title="Reiniciar bloque actual"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine Blocks Pipeline */}
      <div className="space-y-2.5">
        <span className="text-xs font-bold text-slate-400">Estructura de la Rutina ({routineDuration} Min):</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
          {blocks.map((b, idx) => {
            const isCurrent = idx === currentBlockIndex;
            const isDone = completedBlocks[b.id];

            return (
              <div
                key={b.id}
                onClick={() => {
                  setCurrentBlockIndex(idx);
                  setSecondsRemaining(b.minutes * 60);
                  setIsTimerRunning(false);
                }}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-left space-y-1 ${
                  isCurrent
                    ? 'bg-amber-500/20 border-amber-500 shadow-md ring-1 ring-amber-500/30'
                    : isDone
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-slate-300'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200">
                    {idx + 1}. {b.name}
                  </span>
                  <span className="font-mono text-[10px] px-1.5 py-0.2 bg-slate-900 rounded border border-slate-800">
                    {b.minutes} min
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 truncate">{b.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
