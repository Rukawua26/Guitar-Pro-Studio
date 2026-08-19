import React, { useState } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import { COURSE_LESSONS } from '../../data/courseData';
import { audioEngine } from '../../utils/audioSynthesizer';
import {
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Flame,
  Zap,
  Star,
  ChevronRight,
  Shield,
  Layers,
  Crown,
  Play,
  Music,
  Compass
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SkillNode {
  id: string;
  lessonId: string;
  level: number;
  title: string;
  category: 'Fundamento' | 'Técnica' | 'Armonía' | 'Velocidad' | 'Maestría';
  description: string;
  icon: string;
  requiredPrevId?: string;
  badgeAwarded?: string;
}

const SKILL_NODES: SkillNode[] = [
  // Level 1
  {
    id: 'skill-1-1',
    lessonId: '1.1',
    level: 1,
    title: 'Acordes Abiertos & Postura',
    category: 'Fundamento',
    description: 'Digitación limpia de D, A, E y ergonomía sin tensión muscular.',
    icon: '🎸'
  },
  {
    id: 'skill-1-2',
    lessonId: '1.2',
    level: 1,
    title: 'Transiciones de 1 Minuto (30 CPM)',
    category: 'Velocidad',
    description: 'Cambios rápidos entre acordes abiertos sin detener el rasgueo.',
    icon: '⚡',
    requiredPrevId: 'skill-1-1',
    badgeAwarded: 'Medalla 30 CPM'
  },
  {
    id: 'skill-1-3',
    lessonId: '1.3',
    level: 1,
    title: 'Rítmica & Compás 4/4',
    category: 'Fundamento',
    description: 'Control de púa y rasgueo constante abajo/arriba.',
    icon: '🥁',
    requiredPrevId: 'skill-1-2'
  },

  // Level 2
  {
    id: 'skill-2-1',
    lessonId: '2.1',
    level: 2,
    title: 'Superación de la Cejilla (F & Bm)',
    category: 'Técnica',
    description: 'Colocación precisa del índice y presión uniforme sin dolor.',
    icon: '🧱',
    requiredPrevId: 'skill-1-3',
    badgeAwarded: 'Pared de Cejilla Superada'
  },
  {
    id: 'skill-2-2',
    lessonId: '2.2',
    level: 2,
    title: 'Púa Alternada & Sincronía',
    category: 'Técnica',
    description: 'Movimiento de muñeca en semicorcheas y digitación La Araña.',
    icon: '🕷️',
    requiredPrevId: 'skill-2-1'
  },

  // Level 3
  {
    id: 'skill-3-1',
    lessonId: '3.1',
    level: 3,
    title: 'Sistema CAGED: Formas E y A',
    category: 'Armonía',
    description: 'Transporte de acordes a lo largo de todo el mástil.',
    icon: '🗺️',
    requiredPrevId: 'skill-2-2',
    badgeAwarded: 'Maestro CAGED'
  },
  {
    id: 'skill-3-2',
    lessonId: '3.2',
    level: 3,
    title: 'Tríadas e Inversiones',
    category: 'Armonía',
    description: 'Localización de fundamentales, terceras y quintas en 3 cuerdas.',
    icon: '🔺',
    requiredPrevId: 'skill-3-1'
  },

  // Level 4
  {
    id: 'skill-4-1',
    lessonId: '4.1',
    level: 4,
    title: 'Pentatónica en 5 Posiciones',
    category: 'Técnica',
    description: 'Conexión fluida de las 5 cajas de la escala pentatónica menor y mayor.',
    icon: '🌟',
    requiredPrevId: 'skill-3-2'
  },
  {
    id: 'skill-4-2',
    lessonId: '4.2',
    level: 4,
    title: 'Bending Expresivo & Vibrato',
    category: 'Técnica',
    description: 'Afinación de bendings de 1/2 y 1 tono con soporte de 3 dedos.',
    icon: '🎯',
    requiredPrevId: 'skill-4-1'
  },

  // Level 5
  {
    id: 'skill-5-1',
    lessonId: '5.1',
    level: 5,
    title: '7 Modos Griegos & Color Modal',
    category: 'Armonía',
    description: 'Jónico, Dórico, Frigio, Lidio, Mixolidio, Eólico y Locrio.',
    icon: '🏛️',
    requiredPrevId: 'skill-4-2'
  },

  // Level 6
  {
    id: 'skill-6-1',
    lessonId: '6.1',
    level: 6,
    title: 'Velocidad 120 BPM & Legato',
    category: 'Velocidad',
    description: 'Hammer-on, pull-off continuos y alternate picking de alta precisión.',
    icon: '🚀',
    requiredPrevId: 'skill-5-1',
    badgeAwarded: 'Velocidad 120 BPM'
  },

  // Level 7
  {
    id: 'skill-7-1',
    lessonId: '7.1',
    level: 7,
    title: 'Maestría Total & Improvisación',
    category: 'Maestría',
    description: 'Integración completa de técnica, oído, armonía y lenguaje solista.',
    icon: '👑',
    requiredPrevId: 'skill-6-1',
    badgeAwarded: 'Gran Maestro de Guitarra'
  }
];

const BADGES_DEFINITIONS = [
  {
    name: 'Medalla 30 CPM',
    desc: 'Lograr 30 cambios de acordes por minuto en el Nivel 1.',
    icon: '⚡',
    color: 'from-amber-500 to-orange-500'
  },
  {
    name: 'Pared de Cejilla Superada',
    desc: 'Sonar de forma limpia las 6 cuerdas en una cejilla en el Nivel 2.',
    icon: '🧱',
    color: 'from-emerald-500 to-teal-500'
  },
  {
    name: 'Maestro CAGED',
    desc: 'Visualizar una misma armaduría en las 5 posiciones del mástil.',
    icon: '🗺️',
    color: 'from-blue-500 to-indigo-500'
  },
  {
    name: 'Oído de Oro',
    desc: 'Alcanzar una racha de 10 aciertos en el Entrenador de Oído.',
    icon: '🎧',
    color: 'from-purple-500 to-pink-500'
  },
  {
    name: 'Velocidad 120 BPM',
    desc: 'Sincronizar semicorcheas continuas a 120 BPM con metrónomo.',
    icon: '🚀',
    color: 'from-rose-500 to-amber-500'
  },
  {
    name: 'Gran Maestro de Guitarra',
    desc: 'Completar los 7 niveles del plan curricular.',
    icon: '👑',
    color: 'from-amber-400 via-yellow-400 to-amber-600'
  }
];

export const SkillTreeRPG: React.FC = () => {
  const { setSelectedLessonId, setActiveTab, getLessonProgress, profile } = useGuitar();
  const [selectedNode, setSelectedNode] = useState<SkillNode>(SKILL_NODES[0]);

  const getNodeStatus = (node: SkillNode): 'completed' | 'available' | 'locked' => {
    const lesson = COURSE_LESSONS.find((l) => l.id === node.lessonId);
    const progress = lesson ? getLessonProgress(node.lessonId, lesson.ejercicios.length) : 0;
    if (progress === 100) return 'completed';

    if (!node.requiredPrevId) return 'available';

    const prevNode = SKILL_NODES.find((n) => n.id === node.requiredPrevId);
    if (!prevNode) return 'available';

    const prevLesson = COURSE_LESSONS.find((l) => l.id === prevNode.lessonId);
    const prevProg = prevLesson ? getLessonProgress(prevNode.lessonId, prevLesson.ejercicios.length) : 0;

    return prevProg > 0 || prevProg === 100 ? 'available' : 'locked';
  };

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
    audioEngine.playGuitarPluck(330, 1.2, 0.7);
  };

  const handleJumpToLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    setActiveTab('course');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-purple-500/20 text-purple-400 rounded-2xl border border-purple-500/30 shadow-inner">
            <Compass className="w-6 h-6 animate-spin" style={{ animationDuration: '20s' }} />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>Árbol de Habilidades & Mapa RPG de Maestría</span>
              <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/40">
                Progreso por Nodos
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualiza tus 7 niveles como una red interconectada de habilidades desbloqueables y medallas de honor.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-2xl border border-slate-800">
          <Flame className="w-5 h-5 text-amber-500" />
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Racha de Práctica</span>
            <span className="text-sm font-mono font-black text-amber-400">
              {profile.practiceHistory.length} Días Registrados
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Skill Map & Details Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Interactive Node Map (8 Cols) */}
        <div className="lg:col-span-8 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ruta del Aprendiz al Maestro (Niveles 1 al 7)
            </span>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Dominado
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Disponible
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Bloqueado
              </span>
            </div>
          </div>

          {/* Node Flow Pipeline */}
          <div className="space-y-6 relative py-4">
            {/* Background connecting vertical line */}
            <div className="absolute left-8 sm:left-10 top-8 bottom-8 w-1 bg-gradient-to-b from-amber-500 via-purple-500 to-emerald-500 rounded-full opacity-30 pointer-events-none" />

            {SKILL_NODES.map((node, index) => {
              const status = getNodeStatus(node);
              const isSelected = selectedNode.id === node.id;

              return (
                <div
                  key={node.id}
                  onClick={() => handleNodeClick(node)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border transition-all cursor-pointer group relative ${
                    isSelected
                      ? 'bg-slate-850 border-purple-500 shadow-xl shadow-purple-500/10 ring-2 ring-purple-500/30'
                      : status === 'completed'
                      ? 'bg-emerald-950/20 border-emerald-500/40 hover:border-emerald-500'
                      : status === 'available'
                      ? 'bg-slate-950/80 border-slate-800 hover:border-amber-500/60'
                      : 'bg-slate-950/40 border-slate-850 opacity-60'
                  }`}
                >
                  {/* Node Circular Icon Avatar */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold flex-shrink-0 transition-transform group-hover:scale-110 shadow-lg ${
                      status === 'completed'
                        ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/20'
                        : status === 'available'
                        ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/20'
                        : 'bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    {status === 'completed' ? '✓' : status === 'locked' ? <Lock className="w-5 h-5 text-slate-500" /> : node.icon}
                  </div>

                  {/* Node Content */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          Nivel {node.level} • {node.category}
                        </span>
                        {node.badgeAwarded && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Award className="w-3 h-3" /> {node.badgeAwarded}
                          </span>
                        )}
                      </div>

                      <span className="text-xs font-mono text-slate-400">
                        {status === 'completed' ? '100% Completado' : status === 'available' ? 'Disponible' : 'Bloqueado'}
                      </span>
                    </div>

                    <h4
                      className={`text-base font-bold mt-1 ${
                        isSelected ? 'text-purple-300' : 'text-slate-100 group-hover:text-white'
                      }`}
                    >
                      {node.title}
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{node.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Skill Details & Badges Showcase (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Active Node Detail Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase">Detalle de la Habilidad</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Nivel {selectedNode.level}
              </span>
            </div>

            <div className="space-y-2">
              <div className="text-3xl">{selectedNode.icon}</div>
              <h3 className="text-xl font-extrabold text-slate-100">{selectedNode.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedNode.description}</p>
            </div>

            {selectedNode.badgeAwarded && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center gap-3">
                <Award className="w-6 h-6 text-amber-400 flex-shrink-0" />
                <div>
                  <span className="text-[10px] text-amber-300 uppercase font-bold block">Insignia Asociada</span>
                  <span className="text-xs font-bold text-slate-200">{selectedNode.badgeAwarded}</span>
                </div>
              </div>
            )}

            <button
              onClick={() => handleJumpToLesson(selectedNode.lessonId)}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-purple-600/30 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> Ir a la Lección de esta Habilidad
            </button>
          </div>

          {/* Badges Gallery */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" /> Insignias y Trofeos
              </h3>
              <span className="text-xs text-slate-400 font-mono">6 Medallas</span>
            </div>

            <div className="space-y-3">
              {BADGES_DEFINITIONS.map((badge, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${badge.color} text-slate-950 flex items-center justify-center font-bold text-lg shadow-md`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-200">{badge.name}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
