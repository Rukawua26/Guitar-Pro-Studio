import React, { useState, useRef, useEffect } from 'react';
import { Lesson, VideoTimestamp } from '../../types/course';
import { useGuitar } from '../../context/GuitarContext';
import {
  extractYouTubeVideoId,
  getYouTubeWatchUrl,
  getYouTubeEmbedUrl,
  getYouTubeThumbnailUrl,
  getCleanYouTubeSearchUrl
} from '../../utils/youtubeHelper';
import {
  Play,
  Gauge,
  Repeat,
  ExternalLink,
  Youtube,
  Bookmark,
  Copy,
  Check,
  Edit3,
  RotateCcw,
  AlertTriangle,
  Sparkles,
  Link2,
  CheckCircle2
} from 'lucide-react';

interface InteractiveVideoPlayerProps {
  lesson: Lesson;
}

export const InteractiveVideoPlayer: React.FC<InteractiveVideoPlayerProps> = ({ lesson }) => {
  const { profile, setCustomLessonVideo, addNotification } = useGuitar();

  // Determine active video ID: custom user override first, then lesson default
  const rawVideoInput = profile.customVideoUrls?.[lesson.id] || lesson.youtubeVideoId || 'kJvWq6q3sEQ';
  const activeVideoId = extractYouTubeVideoId(rawVideoInput) || 'kJvWq6q3sEQ';

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [activeTimestamp, setActiveTimestamp] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [isEditingVideo, setIsEditingVideo] = useState<boolean>(false);
  const [customInputVal, setCustomInputVal] = useState<string>('');
  const [embedHasError, setEmbedHasError] = useState<boolean>(false);
  const [playerKey, setPlayerKey] = useState<number>(0);

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  // Full, uncut direct links
  const fullWatchUrl = getYouTubeWatchUrl(activeVideoId, activeTimestamp);
  const baseWatchUrl = getYouTubeWatchUrl(activeVideoId, 0);
  const searchUrl = getCleanYouTubeSearchUrl(lesson.cancion_referencia, lesson.canal_youtube);
  const embedUrl = getYouTubeEmbedUrl(activeVideoId);
  const thumbnailUrl = getYouTubeThumbnailUrl(activeVideoId, 'hqdefault');

  // Jump to specific timestamp in iframe
  const handleJumpToTimestamp = (seconds: number) => {
    setActiveTimestamp(seconds);
    setEmbedHasError(false);

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

  // Copy full unbroken URL to clipboard
  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(fullWatchUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2200);
      addNotification('Enlace Copiado', 'Se copió el enlace completo de YouTube al portapapeles.', 'success');
    }
  };

  // Save custom video URL or ID
  const handleSaveCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = extractYouTubeVideoId(customInputVal);
    if (cleanId) {
      setCustomLessonVideo(lesson.id, cleanId);
      setIsEditingVideo(false);
      setEmbedHasError(false);
      setPlayerKey(prev => prev + 1);
    } else {
      addNotification('Enlace No Válido', 'Por favor ingresa un enlace o ID de YouTube válido.', 'warning');
    }
  };

  // Reset to default course video
  const handleResetDefaultVideo = () => {
    setCustomLessonVideo(lesson.id, lesson.youtubeVideoId || 'kJvWq6q3sEQ');
    setIsEditingVideo(false);
    setEmbedHasError(false);
    setPlayerKey(prev => prev + 1);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl backdrop-blur-md space-y-5">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-2xl border border-rose-500/30 shadow-inner">
            <Youtube className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Reproductor Interactivo de Práctica</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/25">
                HD Video & Looper
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Canal de Referencia: <span className="text-amber-400 font-medium">{lesson.canal_youtube}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons: Copy, Edit, Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Direct Link Button */}
          <a
            href={fullWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir video completo en YouTube sin restricciones"
            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>Ver en YouTube</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </a>

          {/* Copy Full Link */}
          <button
            onClick={handleCopyLink}
            title="Copiar enlace completo de YouTube"
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

          {/* Change / Custom Video */}
          <button
            onClick={() => {
              setCustomInputVal(rawVideoInput);
              setIsEditingVideo(!isEditingVideo);
            }}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Cambiar o personalizar enlace de YouTube para esta lección"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Edit Video Form Banner */}
      {isEditingVideo && (
        <form
          onSubmit={handleSaveCustomVideo}
          className="bg-slate-950/90 border border-amber-500/40 rounded-2xl p-4 space-y-3 animate-fadeIn"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-amber-400" /> Personalizar Enlace o ID de YouTube
            </span>
            <span className="text-[11px] text-slate-400">
              Acepta cualquier formato: enlace normal, youtu.be, shorts o ID
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
                Guardar Enlace
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

      {/* Embedded YouTube IFrame with Fail-Safe Fallback */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl group">
        {!embedHasError ? (
          <iframe
            ref={iframeRef}
            key={`${playerKey}_${activeVideoId}`}
            src={embedUrl}
            title={`Video de apoyo - ${lesson.titulo}`}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          /* Error / Restriction Fallback Card */
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-950 relative overflow-hidden">
            <img
              src={thumbnailUrl}
              alt="Miniatura de lección"
              className="absolute inset-0 w-full h-full object-cover opacity-20 filter blur-sm pointer-events-none"
            />
            <div className="relative z-10 max-w-md space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <Youtube className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-100">
                Reproducción Externa en YouTube
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Este video tiene restricciones de inserción del autor o requiere reproducirse directamente. Puedes verlo en pantalla completa haciendo clic abajo:
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                <a
                  href={fullWatchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Youtube className="w-4 h-4" />
                  <span>Ver en YouTube Oficial</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setEmbedHasError(false)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Reintentar Inserción
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Unbroken Link Information Bar */}
      <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 min-w-0 max-w-full overflow-hidden">
          <span className="text-slate-500 font-bold whitespace-nowrap">URL Completa:</span>
          <a
            href={fullWatchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-400 hover:text-amber-300 font-mono underline truncate break-all transition-colors cursor-pointer"
          >
            {fullWatchUrl}
          </a>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <a
            href={searchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>Buscar Más Tutoriales</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => setEmbedHasError(!embedHasError)}
            className="text-[11px] text-slate-500 hover:text-slate-400 underline cursor-pointer"
          >
            {embedHasError ? 'Modo Normal' : '¿Error de inserción?'}
          </button>
        </div>
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
            <span className="text-[11px] text-slate-500 font-normal">Haz clic para saltar al ejercicio</span>
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
    </div>
  );
};
