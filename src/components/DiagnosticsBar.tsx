import React from 'react';
import { 
  Activity, 
  Cpu, 
  Zap, 
  Flame, 
  Usb, 
  Clock, 
  Gauge, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { DeviceInfo, LatencyStats } from '../types';

interface DiagnosticsBarProps {
  stats: LatencyStats;
  device: DeviceInfo;
}

export const DiagnosticsBar: React.FC<DiagnosticsBarProps> = ({ stats, device }) => {
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

      {/* 2. Video Latency */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-400 text-[11px]">Latensi Video:</span>
        </div>
        <span className="font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-800/30 px-1.5 py-0.5 rounded">
          ~{stats.renderLatencyMs} ms
        </span>
      </div>

      {/* 3. Audio Latency */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400 text-[11px]">Latensi Audio:</span>
        </div>
        <span className="font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/30 px-1.5 py-0.5 rounded">
          ~{stats.audioLatencyMs} ms
        </span>
      </div>

      {/* 4. USB Bandwidth */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Usb className="w-4 h-4 text-blue-400" />
          <span className="text-slate-400 text-[11px]">USB Speed:</span>
        </div>
        <span className="font-mono font-bold text-blue-300 bg-blue-950/60 border border-blue-800/30 px-1.5 py-0.5 rounded text-[11px]">
          {stats.usbBandwidthMbps.toFixed(1)} Mb/s
        </span>
      </div>

      {/* 5. Device Temperature */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Flame className="w-4 h-4 text-rose-400" />
          <span className="text-slate-400 text-[11px]">Suhu HP:</span>
        </div>
        <span className={`font-mono font-bold px-1.5 py-0.5 rounded border text-[11px] ${getTempColor(device.temperature)}`}>
          {device.temperature.toFixed(1)}°C
        </span>
      </div>

      {/* 6. Connection Mode */}
      <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {device.connectionStatus === 'connected' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400" />
          )}
          <span className="text-slate-400 text-[11px]">Koneksi:</span>
        </div>
        <span className="font-mono font-bold text-cyan-300 truncate max-w-[85px] text-[10px]">
          {device.usbType.includes('3.0') ? 'USB 3.0' : 'USB 2.0'}
        </span>
      </div>
    </div>
  );
};
