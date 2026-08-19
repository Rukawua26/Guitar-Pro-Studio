import React, { useRef, useState } from 'react';
import { Lesson } from '../../types/course';
import { useGuitar } from '../../context/GuitarContext';
import { CURATED_LESSON_VIDEOS, VideoAlternative } from '../../data/curatedVideos';
import {
  extractYouTubeVideoId,
  getYouTubeEmbedUrl
} from '../../utils/youtubeHelper';
import {
  X,
  Gauge,
  Repeat,
  Tv,
  Bookmark,
  Play,
  Film,
  Sparkles,
  Link2,
  RotateCcw,
  Check,
  Music,
  ChevronRight,
  Video
} from 'lucide-react';

interface VideoTheaterModalProps {
  lesson: Lesson;
  onClose: () => void;
}

export const VideoTheaterModal: React.FC<VideoTheaterModalProps> = ({ lesson, onClose }) => {
  const { profile, setCustomLessonVideo, addNotification } = useGuitar();

  const rawVideoInput = profile.customVideoUrls?.[lesson.id] || lesson.youtubeVideoId || 'kJvWq6q3sEQ';
  const activeVideoId = extractYouTubeVideoId(rawVideoInput) || 'kJvWq6q3sEQ';

  const [activeTimestamp, setActiveTimestamp] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [customInputUrl, setCustomInputUrl] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [activeSubTab, setActiveSubTab] = useState<'curated' | 'timestamps' | 'tab'>('curated');

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const curatedOptions: VideoAlternative[] = CURATED_LESSON_VIDEOS[lesson.id] || [];
  const embedUrl = getYouTubeEmbedUrl(activeVideoId, activeTimestamp);

  const handleJumpToTimestamp = (seconds: number) => {
    setActiveTimestamp(seconds);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [seconds, true]
        }),
        '*'
      );
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'playVideo',
          args: []
        }),
        '*'
      );
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [speed]
        }),
        '*'
      );
    }
  };

  const handleSelectAlternative = (videoId: string) => {
    setCustomLessonVideo(lesson.id, videoId);
    setActiveTimestamp(0);
    addNotification('Video Cambiado', 'Se ha cargado la nueva lección dentro del reproductor.', 'success');
  };

  const handleSaveCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYouTubeVideoId(customInputUrl);
    if (cleanId) {
      setCustomLessonVideo(lesson.id, cleanId);
      setShowCustomInput(false);
      setCustomInputUrl('');
    } else {
      addNotification('Enlace No Válido', 'Ingresa un enlace de YouTube válido.', 'warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-6xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Theater Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
              <Film className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2 truncate">
                <span>Modo Cine Integrado • Lección {lesson.id}</span>
                <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  HD In-App Player
                </span>
              </h2>
              <p className="text-xs text-slate-400 truncate">{lesson.titulo}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Theater Content Area */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Main Video Frame & Video Controls */}
          <div className="lg:col-span-8 p-4 sm:p-6 flex flex-col gap-4 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl">
              <iframe
                ref={iframeRef}
                src={embedUrl}
                title={lesson.titulo}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* In-App Theater Controls Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80">
              {/* Playback speed */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-amber-400" /> Velocidad:
                </span>
                <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5">
                  {[0.5, 0.75, 1.0, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                        playbackSpeed === spd
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom URL Trigger */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowCustomInput(!showCustomInput)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>Pegar Otro Enlace</span>
                </button>
              </div>
            </div>

            {/* Custom Input Dropdown */}
            {showCustomInput && (
              <form
                onSubmit={handleSaveCustomUrl}
                className="p-3 bg-slate-950 border border-amber-500/40 rounded-2xl flex flex-col sm:flex-row gap-2 animate-fadeIn"
              >
                <input
                  type="text"
                  placeholder="Pega cualquier enlace de YouTube aquí..."
                  value={customInputUrl}
                  onChange={(e) => setCustomInputUrl(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Aplicar en la App
                </button>
              </form>
            )}
          </div>

          {/* Right Sidebar: Tutorial Selector, Timestamps & Tab snippet */}
          <div className="lg:col-span-4 p-4 sm:p-6 bg-slate-950/40 flex flex-col space-y-4">
            {/* Tab Selector */}
            <div className="flex items-center bg-slate-900/80 p-1 rounded-2xl border border-slate-800">
              <button
                onClick={() => setActiveSubTab('curated')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'curated'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Tutoriales</span>
              </button>
              <button
                onClick={() => setActiveSubTab('timestamps')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'timestamps'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Marcadores</span>
              </button>
              <button
                onClick={() => setActiveSubTab('tab')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeSubTab === 'tab'
                    ? 'bg-amber-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Music className="w-3.5 h-3.5" />
                <span>Tablatura</span>
              </button>
            </div>

            {/* SubTab Content */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {/* Curated Alternatives */}
              {activeSubTab === 'curated' && (
                <div className="space-y-2.5">
                  <div className="text-xs text-slate-400 font-medium">
                    Tutoriales destacados para ver directamente en la app sin salir:
                  </div>

                  {curatedOptions.map((opt) => {
                    const isSelected = activeVideoId === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => handleSelectAlternative(opt.id)}
                        className={`p-3 rounded-2xl border transition-all cursor-pointer text-left space-y-1.5 ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-500 shadow-md'
                            : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                            {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                            {opt.title}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
                            {opt.duration}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="text-amber-400/90 font-medium">{opt.channel}</span>
                          <span className="uppercase text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            {opt.language === 'es' ? 'Español' : 'Inglés'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Timestamps */}
              {activeSubTab === 'timestamps' && (
                <div className="space-y-2">
                  <div className="text-xs text-slate-400 font-medium">
                    Haz clic para saltar a un ejercicio específico:
                  </div>
                  {lesson.videoTimestamps?.map((ts, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleJumpToTimestamp(ts.seconds)}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start justify-between gap-2 ${
                        activeTimestamp === ts.seconds
                          ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
                      }`}
                    >
                      <div className="space-y-0.5 min-w-0">
                        <span className="font-bold text-xs block truncate">{ts.label}</span>
                        {ts.description && (
                          <span className="text-[11px] text-slate-400 block leading-tight">{ts.description}</span>
                        )}
                      </div>
                      <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400 flex-shrink-0 mt-0.5" />
                    </button>
                  ))}
                </div>
              )}

              {/* Tab Snippet */}
              {activeSubTab === 'tab' && (
                <div className="space-y-3">
                  <div className="text-xs font-bold text-amber-400">Tablatura & Guía Técnica:</div>
                  <pre className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 whitespace-pre overflow-x-auto">
                    {lesson.tabSnippet}
                  </pre>
                  <div className="space-y-1.5 pt-2">
                    <span className="text-xs font-bold text-slate-300">Puntos Clave:</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {lesson.puntosClave.map((pk, idx) => (
                        <li key={idx}>{pk}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
