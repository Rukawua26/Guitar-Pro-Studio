import React, { useState, useEffect, useRef } from 'react';
import { useGuitar } from '../../context/GuitarContext';
import { audioBufferToWav } from '../../utils/wavEncoder';
import {
  Mic,
  Square,
  Play,
  Pause,
  Download,
  Trash2,
  Volume2,
  Clock,
  Radio,
  Share2,
  FileAudio,
  Activity,
  Sliders
} from 'lucide-react';

export const StudioRecorder: React.FC = () => {
  const { recordings, saveRecording, deleteRecording } = useGuitar();
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordTime, setRecordTime] = useState<number>(0);
  const [recordingTitle, setRecordingTitle] = useState<string>('');
  const [selectedLessonTag, setSelectedLessonTag] = useState<string>('Práctica Libre');
  const [activePlaybackId, setActivePlaybackId] = useState<string | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [gainLevel, setGainLevel] = useState<number>(1.0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const liveCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Clean up
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false
        }
      });
      streamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const blobUrl = URL.createObjectURL(audioBlob);

        const newRec = {
          id: 'rec_' + Date.now(),
          title: recordingTitle.trim() || `Toma ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
          createdAt: Date.now(),
          duration: recordTime,
          blobUrl,
          blobSize: audioBlob.size,
          tags: [selectedLessonTag]
        };

        saveRecording(newRec);
        setRecordingTitle('');
        setRecordTime(0);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = window.setInterval(() => {
        setRecordTime(prev => prev + 1);
      }, 1000);

      drawLiveVisualizer();
    } catch (e) {
      console.error("Recording error:", e);
      alert("No se pudo iniciar la grabación. Verifica los permisos de micrófono.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    }
  };

  const drawLiveVisualizer = () => {
    if (!analyserRef.current || !liveCanvasRef.current) return;
    const analyser = analyserRef.current;
    const canvas = liveCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgb(2, 6, 23)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        // Gradient color
        ctx.fillStyle = `hsl(${140 + (dataArray[i] / 255) * 40}, 80%, 50%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }

      animFrameRef.current = requestAnimationFrame(render);
    };
    render();
  };

  const handlePlayToggle = (recId: string, blobUrl: string) => {
    if (activePlaybackId === recId) {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      setActivePlaybackId(null);
    } else {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
      }
      const audio = new Audio(blobUrl);
      audio.playbackRate = playbackSpeed;
      audio.volume = gainLevel;
      audioElementRef.current = audio;

      audio.onended = () => {
        setActivePlaybackId(null);
      };

      audio.play();
      setActivePlaybackId(recId);
    }
  };

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Recording Studio Deck */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-100">
                Laboratorio de Grabación & Audio DAW
              </h2>
              <p className="text-xs text-slate-400">
                Captura tus ejercicios, riffs y solos. Controla velocidad y exporta a WAV.
              </p>
            </div>
          </div>

          {/* Tag & Title inputs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <select
              value={selectedLessonTag}
              onChange={(e) => setSelectedLessonTag(e.target.value)}
              disabled={isRecording}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="Práctica Libre">Práctica Libre</option>
              <option value="Nivel 1 - Araña y Acordes">Nivel 1 - Araña y Acordes</option>
              <option value="Nivel 2 - Rasgueo Universal">Nivel 2 - Rasgueo Universal</option>
              <option value="Nivel 3 - CAGED & Cejillas">Nivel 3 - CAGED & Cejillas</option>
              <option value="Nivel 4 - Pentatónica & Bends">Nivel 4 - Pentatónica & Bends</option>
              <option value="Nivel 5 - Fingerstyle">Nivel 5 - Fingerstyle</option>
              <option value="Nivel 6 - Picking Rápido">Nivel 6 - Picking Rápido</option>
              <option value="Nivel 7 - Sweeps & Modos">Nivel 7 - Sweeps & Modos</option>
            </select>

            <input
              type="text"
              placeholder="Nombre de la toma (ej. Solo Stairway #1)"
              value={recordingTitle}
              onChange={(e) => setRecordingTitle(e.target.value)}
              disabled={isRecording}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3.5 py-2 outline-none focus:border-emerald-500 min-w-[200px]"
            />
          </div>
        </div>

        {/* Visualizer Canvas & Time */}
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-2 px-2 text-xs font-mono text-slate-400">
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : 'bg-slate-600'}`} />
              {isRecording ? 'GRABANDO EN DIRECTO' : 'EN ESPERA'}
            </span>
            <span className="text-xl font-bold font-mono text-emerald-400">
              {formatDuration(recordTime)}
            </span>
          </div>

          <div className="h-28 w-full overflow-hidden rounded-xl bg-slate-950 flex items-center justify-center">
            {isRecording ? (
              <canvas ref={liveCanvasRef} width={800} height={110} className="w-full h-full block" />
            ) : (
              <div className="text-center text-slate-600 text-xs font-mono">
                Presiona "Iniciar Grabación" para capturar audio de guitarra
              </div>
            )}
          </div>
        </div>

        {/* Record Action Buttons */}
        <div className="flex items-center justify-center gap-4">
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="px-8 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-base rounded-2xl flex items-center gap-3 transition-all shadow-xl shadow-rose-600/30 cursor-pointer"
            >
              <Mic className="w-5 h-5" /> Iniciar Grabación
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-rose-400 font-bold text-base border border-rose-500/40 rounded-2xl flex items-center gap-3 transition-all cursor-pointer animate-pulse"
            >
              <Square className="w-5 h-5 fill-current" /> Detener y Guardar Toma
            </button>
          )}
        </div>
      </div>

      {/* Recordings Archive & Slow-Down Player */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2.5">
            <FileAudio className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-100">
              Tomas y Grabaciones Guardadas ({recordings.length})
            </h3>
          </div>

          {/* Playback speed selector for learning solos */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300">
            <span className="text-slate-500">Velocidad:</span>
            {[0.5, 0.75, 1.0, 1.25].map(speed => (
              <button
                key={speed}
                onClick={() => {
                  setPlaybackSpeed(speed);
                  if (audioElementRef.current) {
                    audioElementRef.current.playbackRate = speed;
                  }
                }}
                className={`px-2 py-0.5 rounded font-mono font-semibold transition-colors cursor-pointer ${
                  playbackSpeed === speed ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>
        </div>

        {recordings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No tienes grabaciones aún. ¡Prueba a grabar tu primer riff o ejercicio!
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((rec) => {
              const isPlaying = activePlaybackId === rec.id;

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isPlaying
                      ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <button
                      onClick={() => handlePlayToggle(rec.id, rec.blobUrl)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform hover:scale-105 cursor-pointer ${
                        isPlaying
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                      }`}
                    >
                      {isPlaying ? (
                        <Pause className="w-5 h-5 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-200">{rec.title}</span>
                        {rec.tags && rec.tags[0] && (
                          <span className="px-2 py-0.5 bg-slate-800 text-amber-400 text-[10px] font-semibold rounded-md border border-slate-700">
                            {rec.tags[0]}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5 flex items-center gap-3">
                        <span>{new Date(rec.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{formatDuration(rec.duration)}</span>
                        <span>•</span>
                        <span>{(rec.blobSize / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <a
                      href={rec.blobUrl}
                      download={`${rec.title.replace(/\s+/g, '_')}.webm`}
                      className="p-2 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-xl transition-colors text-xs flex items-center gap-1.5 cursor-pointer"
                      title="Descargar Audio"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Exportar</span>
                    </a>

                    <button
                      onClick={() => deleteRecording(rec.id)}
                      className="p-2 text-slate-500 hover:text-rose-400 bg-slate-900 border border-slate-800 hover:border-rose-500/40 rounded-xl transition-colors cursor-pointer"
                      title="Eliminar grabación"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
