import React from 'react';
import { X, BookOpen, Mic, Sliders, Radio, Music, Award, Check, Brain, Timer, Activity } from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ onClose }) => {
  const steps = [
    {
      step: '1',
      title: 'Afina con Precisión DSP',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      desc: 'Ve a "Afinador DSP", activa tu micrófono y afina con el algoritmo YIN libre de falsos armónicos en cuerdas graves.'
    },
    {
      step: '2',
      title: 'Tablatura DAW & Síntesis Karplus-Strong',
      icon: <Music className="w-5 h-5 text-emerald-400" />,
      desc: 'Aprende los licks legendarios con cursor en tiempo real y sonido orgánico de cuerda pulsada con control de BPM.'
    },
    {
      step: '3',
      title: 'Entrena tu Memoria & Oído Relativo',
      icon: <Brain className="w-5 h-5 text-purple-400" />,
      desc: 'Supera el quiz de flashcards del diapasón para dominar los 12 trastes y entrena tu oído con intervalos y tipos de acordes.'
    },
    {
      step: '4',
      title: 'Rutina Diaria Guiada & Medidor de Ritmo',
      icon: <Timer className="w-5 h-5 text-blue-400" />,
      desc: 'Elige 15, 30 o 60 min para entrenar calentamiento, técnica, teoría y repertorio, y mide tu precisión rítmica con el micrófono.'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl relative overflow-hidden animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3 mb-2">
          <span>🎸 Guía de Inicio Rápido</span>
        </h2>
        <p className="text-sm text-slate-400 mb-6">
          Bienvenido al estudio integral de guitarra digital. Sigue esta hoja de ruta para acelerar tu aprendizaje:
        </p>

        <div className="space-y-3.5 mb-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-3.5"
            >
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/80 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">
                  {item.step}. {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-colors cursor-pointer shadow-lg shadow-amber-500/20"
        >
          ¡Entendido, Comencemos a Tocar!
        </button>
      </div>
    </div>
  );
};
