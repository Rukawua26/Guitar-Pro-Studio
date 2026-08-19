import React, { useState, useRef } from 'react';
import { Lesson } from '../../types/course';
import { useGuitar } from '../../context/GuitarContext';
import { CURATED_LESSON_VIDEOS, VideoAlternative } from '../../data/curatedVideos';
import {
  extractYouTubeVideoId,
  getYouTubeWatchUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl
} from '../../utils/youtubeHelper';
import {
  Play,
  Gauge,
  Repeat,
  Youtube,
  Bookmark,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  Sparkles,
  Link2,
  Film,
  Tv,
  ListVideo,
  ChevronDown
} from 'lucide-react';
import { VideoTheaterModal } from './VideoTheaterModal';

interface InteractiveVideoPlayerProps {
  lesson: Lesson;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({ lesson }) => {
  const {
    profile,
    setCustomLessonVideo,
    addNotification,
    setFloatingVideo,
    setIsFloatingMinimized,
    isTheaterMode,
    setIsTheaterMode
  } = useGuitar();

  // Determine active video ID: custom user override first, then lesson default
  const rawVideoInput = profile.customVideoUrls?.[lesson.id] || lesson.youtubeVideoId || 'kJvWq6q3sEQ';
  const activeVideoId = extractYouTubeVideoId(rawVideoInput) || 'kJvWq6q3sEQ';

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTimestamp, setActiveTimestamp] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isEditingVideo, setIsEditingVideo] = useState<boolean>(false);
  const [customInputVal, setCustomInputVal] = useState<string>('');
  const [showCuratedSelector, setShowCuratedSelector] = useState<boolean>(false);
  const [playerKey, setPlayerKey] = useState<number>(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Direct links and embed URL
  const fullWatchUrl = getYouTubeWatchUrl(activeVideoId, activeTimestamp);
  const embedUrl = getYouTubeEmbedUrl(activeVideoId, activeTimestamp);
  const curatedOptions: VideoAlternative[] = CURATED_LESSON_VIDEOS[lesson.id] || [];

  // Jump to specific timestamp in iframe
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

  // Change playback speed
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

  // Activate In-App Floating Companion Mode
  const handleActivateFloating = () => {
    setFloatingVideo({
      videoId: activeVideoId,
      title: `L${lesson.id}: ${lesson.titulo}`,
      lessonId: lesson.id,
      timestamp: activeTimestamp
    });
    setIsFloatingMinimized(false);
    addNotification(
      'Mini-Reproductor Flotante Activo 📺',
      'El video continuará reproduciéndose en la esquina mientras usas el afinador o metrónomo sin salir de la página.',
      'info'
    );
  };

  // Copy full unbroken URL to clipboard (without leaving app)
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullWatchUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
      addNotification('Enlace Copiado 📋', 'Se copió la URL de YouTube al portapapeles sin salir de la app.', 'success');
    }
  };

  // Save custom video URL or ID
  const handleSaveCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYouTubeVideoId(customInputVal);
    if (cleanId) {
      setCustomLessonVideo(lesson.id, cleanId);
      setIsEditingVideo(false);
      setPlayerKey(prev => prev + 1);
    } else {
      addNotification('Enlace No Válido', 'Por favor ingresa un enlace o ID de YouTube válido.', 'warning');
    }
  };

  // Switch to alternative curated tutorial in-app
  const handleSelectCuratedVideo = (videoId: string) => {
    setCustomLessonVideo(lesson.id, videoId);
    setShowCuratedSelector(false);
    setPlayerKey(prev => prev + 1);
    setActiveTimestamp(0);
    addNotification('Tutorial Actualizado 🎸', 'Se cargó el nuevo video directamente dentro de la lección.', 'success');
  };

  // Reset to default course video
  const handleResetDefaultVideo = () => {
    setCustomLessonVideo(lesson.id, lesson.youtubeVideoId || 'kJvWq6q3sEQ');
    setIsEditingVideo(false);
    setPlayerKey(prev => prev + 1);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shadow-inner">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Reproductor de Estudio Integrado</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                100% In-App
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Canal: <span className="text-amber-400 font-medium">{lesson.canal_youtube}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Theater Mode, Floating Mode, Curated Selector, Copy Link */}
        <div className="flex flex-wrap items-center gap-2">
          {/* In-App Theater Mode */}
          <button
            onClick={() => setIsTheaterMode(true)}
            title="Ver en pantalla ampliada dentro de la página"
            className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Film className="w-3.5 h-3.5" />
            <span>Modo Cine</span>
          </button>

          {/* In-App Floating Companion Mode */}
          <button
            onClick={handleActivateFloating}
            title="Mantener video flotante mientras usas el Afinador o Metrónomo"
            className="px-3 py-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <Tv className="w-3.5 h-3.5" />
            <span>Modo Flotante</span>
          </button>

          {/* Curated Alternatives Selector Button */}
          {curatedOptions.length > 1 && (
            <button
              onClick={() => setShowCuratedSelector(!showCuratedSelector)}
              title="Cambiar a otro tutorial en español o inglés"
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ListVideo className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Más Tutoriales</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCuratedSelector ? 'rotate-180' : ''}`} />
            </button>
          )}

          {/* Copy Link Button */}
          <button
            onClick={handleCopyLink}
            title="Copiar enlace completo al portapapeles sin salir"
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            {copiedUrl ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copiar Enlace</span>
              </>
            )}
          </button>

          {/* Change Custom Link */}
          <button
            onClick={() => {
              setCustomInputVal(rawVideoInput);
              setIsEditingVideo(!isEditingVideo);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Pegar enlace personalizado de YouTube para esta lección"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* In-App Curated Videos Dropdown */}
      {showCuratedSelector && (
        <div className="bg-slate-950/95 border border-amber-500/30 rounded-2xl p-4 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ListVideo className="w-4 h-4 text-amber-400" /> Selecciona un Video para Reproducir en Esta Página
            </span>
            <span className="text-[11px] text-slate-400">
              No tienes que salir de la página
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {curatedOptions.map((opt) => {
              const isSelected = activeVideoId === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectCuratedVideo(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1 ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-bold">
                    <span className="truncate">{opt.title}</span>
                    <span className="text-[10px] px-1 py-0.2 bg-slate-800 rounded font-mono text-slate-400 ml-1">
                      {opt.duration}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="text-amber-400">{opt.channel}</span>
                    <span className="uppercase">{opt.language === 'es' ? 'Español' : 'Inglés'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Video Form Banner */}
      {isEditingVideo && (
        <form
          onSubmit={handleSaveCustomVideo}
          className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-amber-400" /> Personalizar Enlace de YouTube para esta Lección
            </span>
            <span className="text-[11px] text-slate-400">
              Se reproducirá directamente aquí dentro
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Pega aquí el enlace: ej. https://www.youtube.com/watch?v=... o https://youtu.be/..."
              value={customInputVal}
              onChange={(e) => setCustomInputVal(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:border-amber-500 outline-none"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Guardar y Reproducir
              </button>
              <button
                type="button"
                onClick={handleResetDefaultVideo}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Restaurar Original
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Embedded YouTube IFrame Inside App */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
        <iframe
          ref={iframeRef}
          key={`${playerKey}_${activeVideoId}`}
          src={embedUrl}
          title={`Video de apoyo - ${lesson.titulo}`}
          className="absolute inset-0 w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>

      {/* DAW Practice Controls Bar: Speed & Looper */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        {/* Speed Controls */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-amber-400" /> Velocidad:
          </span>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
            {[0.5, 0.75, 1.0, 1.25].map((spd) => (
              <button
                key={spd}
                onClick={() => handleSpeedChange(spd)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                  playbackSpeed === spd
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Looper mode */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              isLooping
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
            }`}
          >
            <Repeat className={`w-3.5 h-3.5 ${isLooping ? 'animate-spin' : ''}`} />
            <span>{isLooping ? 'Bucle A-B Activo' : 'Modo Bucle'}</span>
          </button>
        </div>
      </div>

      {/* Interactive Timestamps Jump Markers */}
      {lesson.videoTimestamps && lesson.videoTimestamps.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span className="flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5 text-amber-400" /> Marcadores de Práctica por Minuto
            </span>
            <span className="text-[11px] text-slate-500 font-normal">Haz clic para saltar al ejercicio directamente en el video</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {lesson.videoTimestamps.map((ts, idx) => {
              const isActive = activeTimestamp === ts.seconds;
              return (
                <div
                  key={idx}
                  onClick={() => handleJumpToTimestamp(ts.seconds)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                    isActive
                      ? 'bg-amber-500/20 border-amber-500 text-amber-200 shadow-md ring-1 ring-amber-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="font-bold text-xs block group-hover:text-amber-400 transition-colors truncate">
                      {ts.label}
                    </span>
                    {ts.description && (
                      <span className="text-[11px] text-slate-400 block leading-tight line-clamp-2">
                        {ts.description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    <Play className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* In-App Theater Mode Modal */}
      {isTheaterMode && (
        <VideoTheaterModal lesson={lesson} onClose={() => setIsTheaterMode(false)} />
      )}
    </div>
  );
};
