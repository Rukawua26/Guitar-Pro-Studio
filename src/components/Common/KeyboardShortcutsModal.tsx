import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    { key: '1', action: 'Ir al Curso (7 Niveles Metodológicos)' },
    { key: '2', action: 'Ir al Afinador DSP de Alta Precisión' },
    { key: '3', action: 'Ir a la Tablatura DAW (Karplus-Strong)' },
    { key: '4', action: 'Ir al Entrenador de Memoria & Oído' },
    { key: '5', action: 'Ir a la Rutina Diaria Cronometrada' },
    { key: '6', action: 'Ir al Analizador de Precisión por Micrófono' },
    { key: '7', action: 'Ir al Diapasón Interactivo & Modos' },
    { key: '8', action: 'Ir al Metrónomo & Ritmo' },
    { key: '9', action: 'Ir a la Grabadora / Estudio DAW' },
    { key: '0', action: 'Ir al Diario de Práctica' },
    { key: 'Espacio', action: 'Contar cambio limpio en el Test de 1 Minuto' },
    { key: 'Esc', action: 'Cerrar cualquier ventana modal activa' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <Command className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-slate-100">Atajos de Teclado del Estudio</h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Agiliza tu flujo de trabajo y práctica usando estos comandos rápidos:
        </p>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-xs"
            >
              <span className="text-slate-300">{s.action}</span>
              <kbd className="px-2 py-1 bg-slate-800 border border-slate-700 text-amber-400 font-mono font-bold rounded-lg shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
