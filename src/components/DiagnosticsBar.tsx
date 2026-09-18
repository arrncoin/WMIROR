import React from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Flame, 
  Usb, 
  Gauge, 
  CheckCircle2, 
  AlertCircle,
  Monitor
} from 'lucide-react';
import { DeviceInfo, LatencyStats, MirrorConfig } from '../types';

interface DiagnosticsBarProps {
  stats: LatencyStats;
  device: DeviceInfo;
  config?: MirrorConfig;
  onOpenGpuModal?: () => void;
}

export const DiagnosticsBar: React.FC<DiagnosticsBarProps> = ({ 
  stats, 
  device,
  config,
  onOpenGpuModal 
}) => {
  const getTempColor = (t: number) => {
    if (t < 38) return 'text-emerald-400 bg-emerald-950/60 border-emerald-800/40';
    if (t < 43) return 'text-amber-400 bg-amber-950/60 border-amber-800/40';
    return 'text-rose-400 bg-rose-950/60 border-rose-800/40';
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
      {/* 1. FPS Monitor */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Gauge className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-400 text-[11px]">FPS Stream:</span>
        </div>
        <span className="font-mono font-bold text-white bg-slate-800/60 px-1.5 py-0.5 rounded">
          {stats.fps.toFixed(1)}
        </span>
      </div>

      {/* 2. GPU Hardware Video Decoder */}
      <button 
        onClick={onOpenGpuModal}
        className="bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/50 transition rounded-xl p-2.5 flex items-center justify-between text-left group"
        title="Klik untuk konfigurasi GPU Hardware Acceleration"
      >
        <div className="flex items-center space-x-1.5">
          <Monitor className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300" />
          <span className="text-slate-400 text-[11px]">Render GPU:</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-800/30 px-1.5 py-0.5 rounded text-[10px] uppercase">
            {config ? config.gpuRenderer.toUpperCase() : 'D3D11'}
          </span>
        </div>
      </button>

      {/* 3. Video Latency */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">Latensi Video:</span>
        </div>
        <span className="font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/30 px-1.5 py-0.5 rounded">
          ~{stats.renderLatencyMs} ms
        </span>
      </div>

      {/* 4. Audio Latency */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 text-[11px]">Latensi Audio:</span>
        </div>
        <span className="font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/30 px-1.5 py-0.5 rounded">
          ~{stats.audioLatencyMs} ms
        </span>
      </div>

      {/* 5. USB Bandwidth */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Usb className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400 text-[11px]">USB Speed:</span>
        </div>
        <span className="font-mono font-bold text-blue-300 bg-blue-950/60 border border-blue-800/30 px-1.5 py-0.5 rounded text-[11px]">
          {stats.usbBandwidthMbps.toFixed(1)} Mb/s
        </span>
      </div>

      {/* 6. Device Temperature */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span className="text-slate-400 text-[11px]">Suhu HP:</span>
        </div>
        <span className={`font-mono font-bold px-1.5 py-0.5 rounded border text-[11px] ${getTempColor(device.temperature)}`}>
          {device.temperature.toFixed(1)}°C
        </span>
      </div>
    </div>
  );
};
