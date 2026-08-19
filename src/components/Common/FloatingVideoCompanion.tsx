import React, { useRef, useState } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import { getYouTubeEmbedUrl, extractYouTubeVideoId } from '../../utils/youtubeHelper';
import {
  Minimize2,
  Maximize2,
  X,
  Play,
  Gauge,
  Tv,
  Film,
  Sparkles,
  Layers,
  Volume2
} from 'lucide-react';

export const FloatingVideoCompanion: React.FC = () => {
  const {
    floatingVideo,
    setFloatingVideo,
    isFloatingMinimized,
    setIsFloatingMinimized,
    setIsTheaterMode,
    setActiveTab
  } = useGuitar();

  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  if (!floatingVideo) return null;

  const cleanVideoId = extractYouTubeVideoId(floatingVideo.videoId) || 'kJvWq6q3sEQ';
  const embedUrl = getYouTubeEmbedUrl(cleanVideoId, floatingVideo.timestamp || 0);

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

  const handleOpenTheater = () => {
    setIsTheaterMode(true);
    setIsFloatingMinimized(false);
  };

  return (
    <div
      className={`fixed z-50 transition-all duration-300 ease-out shadow-2xl rounded-2xl border border-amber-500/40 bg-slate-950/95 backdrop-blur-xl ${
        isFloatingMinimized
          ? 'bottom-4 right-4 w-72 p-3'
          : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[92vw] max-w-sm sm:max-w-md p-3.5'
      }`}
      style={{
        boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px rgba(245,158,11,0.15)'
      }}
    >
      {/* Top Floating Control Bar */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
        <div className="flex items-center gap-2 min-w-0 pr-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
          <span className="font-bold text-slate-200 truncate">
            {floatingVideo.title}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Theater Mode in App */}
          {!isFloatingMinimized && (
            <button
              onClick={handleOpenTheater}
              title="Modo Cine Integrado"
              className="p-1 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <Film className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Minimize / Expand */}
          <button
            onClick={() => setIsFloatingMinimized(!isFloatingMinimized)}
            title={isFloatingMinimized ? 'Expandir reproductor' : 'Minimizar reproductor'}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            {isFloatingMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>

          {/* Close Floating Player */}
          <button
            onClick={() => setFloatingVideo(null)}
            title="Cerrar video flotante"
            className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      {!isFloatingMinimized ? (
        <div className="space-y-2.5">
          <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
            <iframe
              ref={iframeRef}
              src={embedUrl}
              title="Video Flotante de Práctica"
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          {/* Quick Floating Controls */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <span className="text-[10px] text-slate-400 px-1 font-semibold flex items-center gap-1">
                <Gauge className="w-3 h-3 text-amber-400" /> Vel:
              </span>
              {[0.5, 0.75, 1.0, 1.25].map((spd) => (
                <button
                  key={spd}
                  onClick={() => handleSpeedChange(spd)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    playbackSpeed === spd
                      ? 'bg-amber-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setActiveTab('course');
                setIsFloatingMinimized(false);
              }}
              className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 rounded-lg text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Layers className="w-3 h-3" />
              <span>Ver Lección</span>
            </button>
          </div>
        </div>
      ) : (
        /* Minimized State */
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1">
            <Volume2 className="w-3 h-3 animate-pulse" /> Reproductor en segundo plano
          </span>
          <button
            onClick={() => setIsFloatingMinimized(false)}
            className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
          >
            Ver Video
          </button>
        </div>
      )}
    </div>
  );
};
