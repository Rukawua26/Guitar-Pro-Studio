import React, { useState } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import {
  Calendar,
  Clock,
  Award,
  Zap,
  Download,
  Plus,
  BookOpen,
  TrendingUp,
  Sparkles
} from 'lucide-react';

export const PracticeJournal: React.FC = () => {
  const { profile, logPractice, exportUserData } = useGuitar();
  const [minutes, setMinutes] = useState<number>(30);
  const [lessonId, setLessonId] = useState<string>('1.1');
  const [notes, setNotes] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  const totalMinutes = profile.practiceHistory.reduce((sum, s) => sum + s.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes > 0) {
      logPractice(minutes, notes, lessonId);
      setNotes('');
      setShowAddForm(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Stats Cards Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Tiempo Total
            </span>
            <span className="text-2xl font-mono font-bold text-slate-100">
              {totalHours} hrs
            </span>
            <span className="text-[11px] text-slate-500 block">({totalMinutes} minutos)</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Sesiones Registradas
            </span>
            <span className="text-2xl font-mono font-bold text-slate-100">
              {profile.practiceHistory.length}
            </span>
            <span className="text-[11px] text-emerald-400 block">En constancia</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Récord 1 Minuto
            </span>
            <span className="text-2xl font-mono font-bold text-slate-100">
              {profile.oneMinuteRecords['D_A'] || 0}
            </span>
            <span className="text-[11px] text-slate-500 block">Cambios D ↔ A</span>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex items-center gap-4">
          <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">
              Meta Diaria
            </span>
            <span className="text-2xl font-mono font-bold text-slate-100">
              {profile.dailyGoalMinutes} min
            </span>
            <span className="text-[11px] text-slate-500 block">Recomendado</span>
          </div>
        </div>
      </div>

      {/* Action Header: Add practice & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-slate-100">Historial y Diario de Práctica</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => exportUserData('csv')}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Registrar Sesión
          </button>
        </div>
      </div>

      {/* Add practice form */}
      {showAddForm && (
        <form onSubmit={handleAddSession} className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-100">Nueva Entrada en el Diario</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Minutos de práctica</label>
              <input
                type="number"
                min="5"
                max="300"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-sm outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Módulo o Nivel trabajado</label>
              <select
                value={lessonId}
                onChange={(e) => setLessonId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-200 text-sm outline-none focus:border-amber-500"
              >
                <option value="1.1">Nivel 1: Ergonomía & Acordes D, A, E</option>
                <option value="2.1">Nivel 2: Rasgueo Universal & G, C, Am</option>
                <option value="3.1">Nivel 3: Sistema CAGED & Cejillas F, Bm</option>
                <option value="4.1">Nivel 4: Pentatónica & Bending</option>
                <option value="5.1">Nivel 5: Fingerstyle & Travis Picking</option>
                <option value="6.1">Nivel 6: Picking Rápido & Sincronización</option>
                <option value="7.1">Nivel 7: Sweep Picking & Modos Griegos</option>
                <option value="Libre">Práctica Libre / Canciones Propias</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Reflexiones y dificultades técnicas</label>
            <textarea
              rows={3}
              placeholder="¿Qué ejercicio te costó más? ¿Cómo respondió la postura o la púa?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 text-sm outline-none focus:border-amber-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-slate-400 text-xs font-semibold cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer"
            >
              Guardar Entrada
            </button>
          </div>
        </form>
      )}

      {/* Practice Timeline Feed */}
      <div className="space-y-4">
        {profile.practiceHistory.map((sess) => (
          <div
            key={sess.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-start justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/30">
                  {sess.minutes} minutos
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {sess.lessonId ? `Lección ${sess.lessonId}` : 'Práctica Libre'}
                </span>
              </div>
              <p className="text-sm text-slate-300 leading-relaxed pt-1">
                {sess.notes || 'Sin notas adicionales para esta sesión.'}
              </p>
            </div>

            <div className="text-xs text-slate-500 font-mono whitespace-nowrap self-end sm:self-center">
              {new Date(sess.timestamp).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
