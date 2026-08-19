import React, { useState } from 'react';
import { COURSE_LESSONS } from '../../data/courseData';
import { useGuitar } from '../../context/GuitarContext';
import { LessonDetail } from './LessonDetail';
import {
  BookOpen,
  Search,
  CheckCircle2,
  Lock,
  Flame,
  Layers,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

export const CourseDashboard: React.FC = () => {
  const { selectedLessonId, setSelectedLessonId, getLessonProgress, getTotalProgress } = useGuitar();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStage, setSelectedStage] = useState<'all' | 'Principiante' | 'Intermedio' | 'Avanzado'>('all');

  const selectedLesson = COURSE_LESSONS.find(l => l.id === selectedLessonId) || COURSE_LESSONS[0];

  const filteredLessons = COURSE_LESSONS.filter(l => {
    const matchesSearch =
      l.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.teoria.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.cancion_referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `nivel ${l.nivel}`.includes(searchTerm.toLowerCase());

    const matchesStage = selectedStage === 'all' || l.categoria === selectedStage;
    return matchesSearch && matchesStage;
  });

  const totalProg = getTotalProgress();

  const stages = [
    { name: 'Principiante', range: 'Nivel 1 - 2', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' },
    { name: 'Intermedio', range: 'Nivel 3 - 5', color: 'text-blue-400 border-blue-500/30 bg-blue-500/10' },
    { name: 'Avanzado', range: 'Nivel 6 - 7', color: 'text-purple-400 border-purple-500/30 bg-purple-500/10' }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Sidebar: Navigation & Levels list (4 cols) */}
      <div className="lg:col-span-4 space-y-5">
        {/* Total Progress Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-slate-200">Progreso Global del Curso</span>
            </div>
            <span className="text-sm font-mono font-extrabold text-amber-400">
              {totalProg}%
            </span>
          </div>
          <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${totalProg}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2">
            <span>7 Niveles de Estudio</span>
            <span>21 Ejercicios Prácticos</span>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lección, técnica, canción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900/90 border border-slate-800 text-slate-200 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:border-amber-500 outline-none transition-colors"
            />
          </div>

          {/* Stage pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedStage('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedStage === 'all'
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Todos
            </button>
            {stages.map(st => (
              <button
                key={st.name}
                onClick={() => setSelectedStage(st.name as 'Principiante' | 'Intermedio' | 'Avanzado')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedStage === st.name
                    ? 'bg-slate-100 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* Lessons List Accordion / Stack */}
        <div className="space-y-2.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
          {filteredLessons.map((lesson) => {
            const isSelected = selectedLessonId === lesson.id;
            const progress = getLessonProgress(lesson.id, lesson.ejercicios.length);
            const isCompleted = progress === 100;

            return (
              <div
                key={lesson.id}
                onClick={() => setSelectedLessonId(lesson.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/30'
                    : 'bg-slate-900/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-850'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : isSelected
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {isCompleted ? '✓' : lesson.nivel}
                    </span>
                    <div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Nivel {lesson.nivel} • {lesson.categoria}
                      </span>
                      <h4
                        className={`text-sm font-bold leading-tight mt-0.5 line-clamp-1 ${
                          isSelected ? 'text-amber-300' : 'text-slate-200 group-hover:text-white'
                        }`}
                      >
                        {lesson.titulo}
                      </h4>
                    </div>
                  </div>

                  <ChevronRight
                    className={`w-4 h-4 flex-shrink-0 transition-transform ${
                      isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                    }`}
                  />
                </div>

                {/* Progress bar inside card */}
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-400' : 'bg-amber-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-medium text-slate-400 whitespace-nowrap">
                    {progress}%
                  </span>
                </div>
              </div>
            );
          })}

          {filteredLessons.length === 0 && (
            <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
              <p className="text-sm text-slate-400">No se encontraron lecciones con ese filtro.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area: Active Lesson (8 cols) */}
      <div className="lg:col-span-8">
        <LessonDetail lesson={selectedLesson} />
      </div>
    </div>
  );
};
