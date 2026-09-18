import React, { useEffect, useRef, useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Activity, 
  Zap, 
  Headphones, 
  Radio, 
  Sliders, 
  Play, 
  Square 
} from 'lucide-react';
import { MirrorConfig } from '../types';
import { audioEngine } from '../utils/audioEngine';

interface AudioPanelProps {
  config: MirrorConfig;
  onChangeConfig: (newConfig: Partial<MirrorConfig>) => void;
  audioLatencyMs: number;
}

export const AudioPanel: React.FC<AudioPanelProps> = ({
  config,
  onChangeConfig,
  audioLatencyMs,
}) => {
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [measuredPing, setMeasuredPing] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Sync volume with audio engine
  useEffect(() => {
    audioEngine.setVolume(isMuted ? 0 : volume);
  }, [volume, isMuted]);

  // Render Real-time Oscilloscope & Frequency Spectrum
  useEffect(() => {
    let animationFrameId: number;

    const renderSpectrum = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { frequencyData, waveData } = audioEngine.getVisualizerData();
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid
      ctx.fillStyle = 'rgba(2, 6, 23, 0.6)';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Frequency Bars
      const barCount = 32;
      const barWidth = (width / barCount) - 2;
      for (let i = 0; i < barCount; i++) {
        const val = frequencyData[i] || 0;
        const percent = val / 255;
        const barHeight = Math.max(3, percent * (height - 8));

        const hue = 185 + (i / barCount) * 45; // cyan to blue
        ctx.fillStyle = `hsla(${hue}, 85%, 55%, ${0.3 + percent * 0.7})`;
        ctx.fillRect(i * (barWidth + 2), height - barHeight, barWidth, barHeight);
      }

      // 2. Draw Waveform Line
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#38bdf8';
      ctx.beginPath();

      const sliceWidth = width / waveData.length;
      let x = 0;
      for (let i = 0; i < waveData.length; i++) {
        const v = waveData[i] / 128.0;
        const y = (v * height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }
      ctx.stroke();

      animationFrameId = requestAnimationFrame(renderSpectrum);
    };

    animationFrameId = requestAnimationFrame(renderSpectrum);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleTestPing = async () => {
    setIsMeasuring(true);
    const latency = await audioEngine.playLatencyPing();
    setMeasuredPing(latency);
    setIsMeasuring(false);
  };

  const toggleTestStream = () => {
    if (isPlayingAudio) {
      audioEngine.stopAudio();
      setIsPlayingAudio(false);
    } else {
      audioEngine.startSimulatedPhoneAudio();
      setIsPlayingAudio(true);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-cyan-950/70 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white tracking-wide uppercase">USB Audio Forwarding</h3>
            <p className="text-[11px] text-slate-400">Low-Latency Sound Direct to Windows</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-800/40">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping mr-0.5" />
            {audioLatencyMs} ms
          </span>
          <button
            id="btn-toggle-audio-enabled"
            onClick={() => onChangeConfig({ audioEnabled: !config.audioEnabled })}
            className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
              config.audioEnabled 
                ? 'bg-cyan-600 text-white shadow-sm shadow-cyan-900/50' 
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            {config.audioEnabled ? 'Audio ON' : 'Audio OFF'}
          </button>
        </div>
      </div>

      {/* Real-time Spectrum & Waveform Canvas */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800/80 bg-slate-950">
        <canvas
          ref={canvasRef}
          width={360}
          height={64}
          className="w-full h-16 block"
        />
        <div className="absolute top-1.5 right-2 flex items-center space-x-1.5 text-[9px] text-cyan-300/80 font-mono">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>48kHz • 16-Bit Stereo</span>
        </div>
      </div>

      {/* Controls Bar: Volume & Mute */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
        {/* Volume Slider */}
        <div className="flex items-center space-x-2 bg-slate-950/60 p-2 rounded-xl border border-slate-800/60">
          <button
            id="btn-mute-audio"
            onClick={() => setIsMuted(!isMuted)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            )}
          </button>
          <input
            id="input-audio-volume"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              if (isMuted) setIsMuted(false);
            }}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] font-mono text-slate-400 w-8 text-right">
            {isMuted ? '0%' : `${Math.round(volume * 100)}%`}
          </span>
        </div>

        {/* Buffer Delay Slider (5ms - 50ms) */}
        <div className="flex items-center justify-between bg-slate-950/60 p-2 rounded-xl border border-slate-800/60 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-300">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px]">Buffer Delay:</span>
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="input-audio-buffer"
              type="range"
              min="5"
              max="50"
              step="5"
              value={config.audioBufferMs}
              onChange={(e) => onChangeConfig({ audioBufferMs: parseInt(e.target.value) })}
              className="w-20 accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="text-[11px] font-mono font-bold text-cyan-300 min-w-[34px] text-right">
              {config.audioBufferMs}ms
            </span>
          </div>
        </div>
      </div>

      {/* Codec Selection & Testing Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Codec Chips */}
        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] text-slate-400 font-semibold">Codec:</span>
          {(['raw', 'opus', 'aac'] as const).map((codec) => (
            <button
              key={codec}
              id={`btn-codec-${codec}`}
              onClick={() => onChangeConfig({ audioCodec: codec })}
              className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase transition-all ${
                config.audioCodec === codec
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {codec === 'raw' ? 'RAW PCM (0ms)' : codec}
            </button>
          ))}
        </div>

        {/* Audio Ping & Test Sound Buttons */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-test-audio-ping"
            onClick={handleTestPing}
            disabled={isMeasuring}
            className="flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 active:scale-95 transition-all"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>{isMeasuring ? 'Testing...' : measuredPing ? `Ping: ${measuredPing}ms` : 'Cek Ping'}</span>
          </button>

          <button
            id="btn-toggle-test-stream"
            onClick={toggleTestStream}
            className={`flex items-center space-x-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-all ${
              isPlayingAudio
                ? 'bg-rose-600 text-white'
                : 'bg-cyan-950 text-cyan-300 border border-cyan-800/50 hover:bg-cyan-900/60'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Square className="w-3 h-3 fill-white" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 fill-cyan-300" />
                <span>Tes Audio HP</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
