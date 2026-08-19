import React, { useRef } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import {
  Award,
  X,
  Printer,
  Download,
  CheckCircle2,
  Sparkles,
  Calendar,
  Clock,
  Flame,
  ShieldCheck,
  Music
} from 'lucide-react';

interface GraduationCertificateModalProps {
  onClose: () => void;
}

export const GraduationCertificateModal: React.FC<GraduationCertificateModalProps> = ({ onClose }) => {
  const { profile, getTotalProgress, recordings } = useGuitar();
  const certRef = useRef<HTMLDivElement | null>(null);

  const totalProg = getTotalProgress();
  const totalMinutes = profile.practiceHistory.reduce((sum, s) => sum + s.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const completedExercisesCount = Object.keys(profile.completedExercises).length;
  const bestOneMinutePair = Object.entries(profile.oneMinuteRecords || {}).sort((a, b) => Number(b[1]) - Number(a[1]))[0];

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl relative overflow-hidden animate-fadeIn print:border-none print:shadow-none print:p-0 print:bg-white print:text-black">
        {/* Close and Print Actions Header (Hidden when printing) */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-slate-100 text-sm">Certificado Oficial de Estudio de Guitarra</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Exportar PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DIPLOMA CANVAS */}
        <div
          ref={certRef}
          className="p-8 sm:p-12 rounded-3xl border-8 border-double border-amber-500/60 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-center space-y-6 relative overflow-hidden shadow-2xl print:bg-white print:text-slate-900 print:border-amber-700 print:p-8"
        >
          {/* Subtle Watermark Stamp */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-8xl font-black text-amber-400">
            GUITARSTUDIO
          </div>

          {/* Top Seal */}
          <div className="flex items-center justify-center gap-2 text-amber-400">
            <ShieldCheck className="w-8 h-8" />
            <span className="text-xs font-mono font-bold tracking-widest uppercase">
              GuitarStudio Pro Academy • Registro Oficial
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 print:text-amber-800">
              CERTIFICADO DE MAESTRÍA MUSICAL
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 print:text-slate-600">
              Se otorga el presente diploma de acreditación y reporte de práctica a:
            </p>
          </div>

          {/* Student Name */}
          <div className="py-2 border-b-2 border-amber-500/40 inline-block px-8 max-w-full">
            <h2 className="text-2xl sm:text-3xl font-bold font-serif text-slate-100 print:text-slate-900 tracking-wider">
              {profile.name || 'Guitarrista Pro'}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed print:text-slate-700">
            Por haber completado con excelencia las disciplinas de técnica de púa alternada, digitación biomecánica, afinación DSP, diapasón CAGED, entrenamiento auditivo de intervalos y estudio de repertorio.
          </p>

          {/* Academic Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Horas de Estudio</span>
              <span className="text-lg font-black text-amber-400 font-mono print:text-amber-800">{totalHours} hrs</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Ejercicios Dominados</span>
              <span className="text-lg font-black text-purple-400 font-mono print:text-purple-800">{completedExercisesCount}</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Progreso Global</span>
              <span className="text-lg font-black text-emerald-400 font-mono print:text-emerald-800">{totalProg}%</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-800 print:border-slate-300 print:bg-slate-50">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Récord de Cambios</span>
              <span className="text-lg font-black text-blue-400 font-mono print:text-blue-800">
                {bestOneMinutePair ? `${bestOneMinutePair[1]} cpm` : '60 cpm'}
              </span>
            </div>
          </div>

          {/* Footer Signature & Date */}
          <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 print:text-slate-600">
            <div className="text-left space-y-1">
              <span className="block font-medium">Fecha de Emisión: {currentDate}</span>
              <span className="font-mono text-[10px] text-slate-500">ID: GS-PRO-{profile.joinedDate.toString(36).toUpperCase()}</span>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif italic text-base text-amber-400 font-bold print:text-amber-800">
                GuitarStudio Academy
              </div>
              <span className="block text-[10px] text-slate-500 uppercase tracking-widest">
                Dirección Pedagógica
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
