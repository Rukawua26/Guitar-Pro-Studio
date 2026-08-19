import React, { useState } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import {
  User,
  ShieldCheck,
  Cloud,
  Download,
  Upload,
  Settings,
  X,
  Sparkles,
  CheckCircle,
  FileText
} from 'lucide-react';

interface UserProfileModalProps {
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ onClose }) => {
  const { profile, updateProfile, exportUserData, importUserData, getTotalProgress } = useGuitar();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [dailyGoal, setDailyGoal] = useState(profile.dailyGoalMinutes);
  const [experience, setExperience] = useState(profile.experienceLevel);
  const [isSaved, setIsSaved] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      dailyGoalMinutes: dailyGoal,
      experienceLevel: experience
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const ok = importUserData(content);
      if (ok) {
        setImportStatus('¡Respaldo restaurado con éxito!');
      } else {
        setImportStatus('Error: El archivo JSON no es válido.');
      }
      setTimeout(() => setImportStatus(null), 3000);
    };
    reader.readAsText(file);
  };

  const totalProg = getTotalProgress();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-fadeIn">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-200 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-amber-500/20">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-100">{name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-400">{profile.email}</span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3 h-3" /> Cifrado E2E Activo
              </span>
            </div>
          </div>
        </div>

        {/* Profile Progress Snapshot */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-center text-xs mb-2">
            <span className="text-slate-400">Progreso de Certificación</span>
            <span className="font-mono font-bold text-amber-400">{totalProg}%</span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${totalProg}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nombre / Alias</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Nivel Inicial</label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none"
              >
                <option value="Principiante">Principiante (Nivel 1 - 2)</option>
                <option value="Intermedio">Intermedio (Nivel 3 - 5)</option>
                <option value="Avanzado">Avanzado (Nivel 6 - 7)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Meta Diaria de Práctica (Minutos)
            </label>
            <input
              type="number"
              min="10"
              max="180"
              value={dailyGoal}
              onChange={(e) => setDailyGoal(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:border-amber-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {isSaved ? <CheckCircle className="w-4 h-4" /> : null}
            <span>{isSaved ? '¡Preferencias Guardadas!' : 'Actualizar Perfil'}</span>
          </button>
        </form>

        {/* Cloud backup & data export section */}
        <div className="pt-4 border-t border-slate-800/80 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Respaldo y Sincronización en la Nube
          </span>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => exportUserData('json')}
              className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Descargar Backup JSON
            </button>

            <label className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Importar Backup</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
            </label>
          </div>

          {importStatus && (
            <p className="text-xs text-emerald-400 text-center font-medium mt-1">
              {importStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
