import React, { useState } from 'react';
import { useGuitar, AppTabType } from '../../context/GuitarContext';
import {
  BookOpen,
  Radio,
  Mic,
  Layers,
  Clock,
  Music,
  User,
  Bell,
  HelpCircle,
  Command,
  Flame,
  CheckCircle,
  Menu,
  X,
  Volume2,
  Brain,
  Timer,
  Activity,
  Sparkles,
  Disc,
  Award
} from 'lucide-react';

interface NavbarProps {
  onOpenProfile: () => void;
  onOpenGuide: () => void;
  onOpenShortcuts: () => void;
  onOpenCertificate: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenProfile,
  onOpenGuide,
  onOpenShortcuts,
  onOpenCertificate
}) => {
  const { activeTab, setActiveTab, getTotalProgress, notifications, markNotificationRead, clearNotifications } = useGuitar();
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const unreadCount = notifications.filter(n => !n.read).length;
  const totalProg = getTotalProgress();

  interface NavItem {
    id: AppTabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    highlight?: boolean;
    badge?: string;
  }

  const primaryNavItems: NavItem[] = [
    { id: 'course', label: 'Curso (7 Niveles)', icon: BookOpen },
    { id: 'tuner', label: 'Afinador DSP', icon: Radio, highlight: true },
    { id: 'tabplayer', label: 'Tablatura DAW', icon: Music, badge: 'Editor' },
    { id: 'backingtrack', label: 'Pistas / Jam', icon: Disc, badge: 'Banda' },
    { id: 'songbook', label: 'Cancionero', icon: BookOpen, badge: 'Auto' },
    { id: 'trainer', label: 'Entrenador & Oído', icon: Brain, badge: 'Quiz' },
    { id: 'routine', label: 'Rutina Diaria', icon: Timer },
    { id: 'rhythm', label: 'Precisión Ritmo', icon: Activity, badge: 'Mic' },
    { id: 'fretboard', label: 'Diapasón', icon: Layers },
    { id: 'metronome', label: 'Metrónomo', icon: Clock },
    { id: 'recorder', label: 'Estudio DAW', icon: Mic },
    { id: 'chords', label: 'Acordes', icon: Music },
    { id: 'journal', label: 'Diario', icon: Flame }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo Branding */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('course')}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-black text-xl flex-shrink-0">
              🎸
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent block">
                GuitarStudio Pro
              </span>
              <span className="text-[10px] font-mono text-slate-400 block -mt-0.5">
                Mastery System & Web Audio DSP
              </span>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 border border-slate-800 p-1.5 rounded-2xl shadow-inner overflow-x-auto max-w-3xl">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : item.highlight
                      ? 'text-emerald-400 hover:bg-slate-800/80 hover:text-emerald-300'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : item.highlight ? 'text-emerald-400' : ''}`} />
                  <span>{item.label}</span>
                  {item.badge && !isActive && (
                    <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 font-mono text-amber-400 border border-slate-700">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Medium Screen Nav Strip (Lg) */}
          <div className="hidden lg:flex xl:hidden items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-2xl">
            {primaryNavItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer ${
                    isActive ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center gap-2">
            {/* Official Certificate Button */}
            <button
              onClick={onOpenCertificate}
              title="Ver Certificado Oficial & Reporte"
              className="px-3 py-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span>Certificado</span>
            </button>

            {/* Quick shortcuts info button */}
            <button
              onClick={onOpenShortcuts}
              title="Atajos de teclado"
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors hidden sm:flex cursor-pointer"
            >
              <Command className="w-4 h-4" />
            </button>

            {/* Quick Guide */}
            <button
              onClick={onOpenGuide}
              title="Guía de inicio"
              className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors hidden sm:flex cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl transition-colors relative cursor-pointer"
                title="Notificaciones y logros"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[10px] rounded-full flex items-center justify-center animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-fadeIn">
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                    <span className="font-bold text-xs text-slate-200">Alertas de Práctica</span>
                    <button
                      onClick={clearNotifications}
                      className="text-[10px] text-slate-500 hover:text-slate-300"
                    >
                      Limpiar todo
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">
                        Sin notificaciones pendientes.
                      </p>
                    ) : (
                      notifications.map(n => (
                        <div
                          key={n.id}
                          onClick={() => markNotificationRead(n.id)}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            n.read
                              ? 'bg-slate-950/40 border-slate-800/60 text-slate-400'
                              : 'bg-slate-800/90 border-amber-500/40 text-slate-200'
                          }`}
                        >
                          <div className="font-bold text-amber-400 text-xs mb-0.5">{n.title}</div>
                          <div className="text-[11px] leading-snug">{n.message}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Avatar & Progress */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl transition-all cursor-pointer"
            >
              <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-sm">
                G
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-200 leading-none">Mi Perfil</span>
                <span className="text-[10px] font-mono text-amber-400">{totalProg}% Progreso</span>
              </div>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-400 hover:text-slate-200 bg-slate-900 border border-slate-800 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-slate-800 grid grid-cols-2 gap-2 animate-fadeIn max-h-[75vh] overflow-y-auto">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'text-slate-300 hover:bg-slate-900 bg-slate-950/60 border border-slate-800/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
