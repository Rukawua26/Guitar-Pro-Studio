import React, { useState } from 'react';
import { Lesson } from '../../types/course';
import { useGuitar } from '../../context/GuitarContext';
import { CHORD_LIBRARY } from '../../data/courseData';
import { ChordDiagram } from '../Common/ChordDiagram';
import { OneMinuteSpeedTrainer } from './OneMinuteSpeedTrainer';
import { InteractiveVideoPlayer } from './InteractiveVideoPlayer';
import { FocusPracticeMode } from './FocusPracticeMode';
import {
  CheckCircle,
  Circle,
  Youtube,
  ExternalLink,
  BookOpen,
  Award,
  Zap,
  Clock,
  Music,
  CheckCheck,
  Flame,
  FileCode,
  Share2,
  Sparkles,
  Maximize2
} from 'lucide-react';

interface LessonDetailProps {
  lesson: Lesson;
}

export const LessonDetail: React.FC<LessonDetailProps> = ({ lesson }) => {
  const { isExerciseDone, toggleExercise, logPractice } = useGuitar();
  const [showSpeedTrainer, setShowSpeedTrainer] = useState<boolean>(false);
  const [showFocusMode, setShowFocusMode] = useState<boolean>(false);
  const [practiceTime, setPracticeTime] = useState<number>(20);
  const [practiceNotes, setPracticeNotes] = useState<string>('');
  const [isLogging, setIsLogging] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  const getCategoryBadgeClass = (cat: string) => {
    switch (cat) {
      case 'Principiante':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Intermedio':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Avanzado':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const handleSavePractice = (e: React.FormEvent) => {
    e.preventDefault();
    logPractice(
      practiceTime,
      practiceNotes || `Práctica enfocada en ${lesson.titulo}`,
      lesson.id
    );
    setIsLogging(false);
    setPracticeNotes('');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Lesson Header Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${getCategoryBadgeClass(
                lesson.categoria
              )}`}
            >
              Nivel {lesson.nivel} • {lesson.categoria}
            </span>
            {lesson.bpmObjetivo && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> BPM Objetivo: {lesson.bpmObjetivo}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFocusMode(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Modo Enfoque</span>
            </button>
            <button
              onClick={handleShare}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copiedLink ? '¡Copiado!' : 'Compartir'}</span>
            </button>
            <button
              onClick={() => setIsLogging(true)}
              className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Registrar Práctica</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight leading-snug max-w-3xl">
          {lesson.titulo}
        </h1>
      </div>

      {/* Quick Practice Log Modal / Slideover */}
      {isLogging && (
        <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl animate-fadeIn">
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-400" /> Registrar Sesión de Práctica
          </h3>
          <form onSubmit={handleSavePractice} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Tiempo de Práctica (Minutos)
                </label>
                <input
                  type="number"
                  min="5"
                  max="240"
                  value={practiceTime}
                  onChange={(e) => setPracticeTime(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">
                  Lección Actual
                </label>
                <input
                  type="text"
                  disabled
                  value={`Nivel ${lesson.nivel}: ${lesson.titulo}`}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-400 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">
                Notas y Sensaciones Técnicas (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ej. Los cambios entre Re y La salieron más limpios hoy. Logré 28 cambios por minuto sin trasteos."
                value={practiceNotes}
                onChange={(e) => setPracticeNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-sm focus:border-amber-500 outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsLogging(false)}
                className="px-4 py-2 text-slate-400 hover:text-slate-200 text-sm font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Guardar en Mi Diario
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Theory, Video Player and Exercises */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Theory, Video Player & Key Points (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Interactive Video Player with Timestamps & Looper */}
          <InteractiveVideoPlayer lesson={lesson} />

          {/* Theory Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2.5 mb-4 text-amber-400">
              <BookOpen className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-100">Fundamentos Teóricos</h2>
            </div>
            <p className="text-slate-300 leading-relaxed text-base">
              {lesson.teoria}
            </p>

            {lesson.puntosClave && lesson.puntosClave.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Puntos Clave y Ergonomía
                </h3>
                <ul className="space-y-2.5">
                  {lesson.puntosClave.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Tablature / Notation Snippet Card */}
          {lesson.tabSnippet && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <FileCode className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold">Tablatura y Notación Técnica</h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">Lectura Estándar</span>
              </div>
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-emerald-400 font-mono text-xs sm:text-sm overflow-x-auto leading-relaxed shadow-inner">
                {lesson.tabSnippet}
              </pre>
            </div>
          )}

          {/* Chords of this lesson */}
          {lesson.chords && lesson.chords.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5 text-slate-200">
                  <Music className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold">Acordes de la Lección</h2>
                </div>
                <span className="text-xs text-slate-400">Toca el altavoz para escuchar</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {lesson.chords.map((chordKey) => {
                  const chordData = CHORD_LIBRARY[chordKey];
                  if (!chordData) return null;
                  return <ChordDiagram key={chordKey} chord={chordData} size="sm" />;
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Interactive Exercises & Song (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Exercises Checklist */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 text-emerald-400">
                <CheckCheck className="w-5 h-5" />
                <h2 className="text-lg font-bold text-slate-100">Ejercicios Prácticos</h2>
              </div>
              <span className="text-xs text-slate-400">Marca tu progreso</span>
            </div>

            <div className="space-y-3">
              {lesson.ejercicios.map((ejercicio, idx) => {
                const done = isExerciseDone(lesson.id, idx);
                const isSpeedDrill =
                  ejercicio.toLowerCase().includes('minuto') ||
                  ejercicio.toLowerCase().includes('one minute');

                return (
                  <div
                    key={idx}
                    onClick={() => toggleExercise(lesson.id, idx)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer group flex flex-col gap-2 ${
                      done
                        ? 'bg-emerald-950/20 border-emerald-500/50 text-slate-200'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <button className="mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110">
                        {done ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                        ) : (
                          <Circle className="w-5 h-5 text-slate-500 group-hover:text-slate-400" />
                        )}
                      </button>
                      <span
                        className={`text-sm leading-relaxed ${
                          done ? 'line-through opacity-70' : ''
                        }`}
                      >
                        {ejercicio}
                      </span>
                    </div>

                    {isSpeedDrill && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSpeedTrainer(true);
                        }}
                        className="mt-1 self-start px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Zap className="w-3.5 h-3.5" /> Abrir Entrenador de 1 Minuto
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reference Song Summary Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2.5 text-amber-400 mb-4">
              <Sparkles className="w-5 h-5" />
              <h2 className="text-lg font-bold text-slate-100">Canción de Referencia</h2>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-[11px] uppercase font-bold text-slate-500 tracking-wider block">
                Repertorio Aplicado
              </span>
              <span className="text-base font-bold text-slate-100 block">
                {lesson.cancion_referencia}
              </span>
              <p className="text-xs text-slate-400 pt-1">
                Aprende esta pieza para consolidar la armonía y articulaciones de este nivel.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Focus Practice Mode Modal */}
      {showFocusMode && (
        <FocusPracticeMode lesson={lesson} onClose={() => setShowFocusMode(false)} />
      )}

      {/* Speed Trainer Modal */}
      {showSpeedTrainer && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl">
            <div className="flex justify-end mb-2">
              <button
                onClick={() => setShowSpeedTrainer(false)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg cursor-pointer"
              >
                Cerrar ✕
              </button>
            </div>
            <OneMinuteSpeedTrainer />
          </div>
        </div>
      )}
    </div>
  );
};
