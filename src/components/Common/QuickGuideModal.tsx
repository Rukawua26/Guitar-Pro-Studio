import React from 'react';
import { X, BookOpen, Mic, Sliders, Radio, Music, Award, Check } from 'lucide-react';

interface QuickGuideModalProps {
  onClose: () => void;
}

export const QuickGuideModal: React.FC<QuickGuideModalProps> = ({ onClose }) => {
  const steps = [
    {
      step: '1',
      title: 'Afina tu Guitarra',
      icon: <Radio className="w-5 h-5 text-amber-400" />,
      desc: 'Ve a la pestaña "Afinador Web", activa tu micrófono y afina cuerda por cuerda (E2, A2, D3, G3, B3, E4) guiándote por la aguja central y el indicador verde de ±5 cents.'
    },
    {
      step: '2',
      title: 'Aprende los 7 Niveles Estructurados',
      icon: <BookOpen className="w-5 h-5 text-emerald-400" />,
      desc: 'Comienza en el Nivel 1 con la digitación de la araña y los acordes abiertos. Sube gradualmente a través de Cejillas CAGED, Pentatónica, Fingerstyle, Sincronización rápida y Sweep Picking modal.'
    },
    {
      step: '3',
      title: 'Entrena con el Test de 1 Minuto',
      icon: <Award className="w-5 h-5 text-purple-400" />,
      desc: 'Usa el contador interactivo de 60 segundos para contar tus cambios limpios de acordes y superar tus marcas personales.'
    },
    {
      step: '4',
      title: 'Graba tus Riffs & Practica con Metrónomo',
      icon: <Mic className="w-5 h-5 text-rose-400" />,
      desc: 'Utiliza el laboratorio DAW para grabar tus tomas, ralentizar pasajes difíciles a 0.5x / 0.75x y exportar tus grabaciones en formato WAV.'
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

        <div className="space-y-4 mb-6">
          {steps.map((item) => (
            <div
              key={item.step}
              className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-start gap-4"
            >
              <div className="p-2 bg-slate-900 rounded-xl border border-slate-700/80 flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-200">
                  {item.step}. {item.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
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
