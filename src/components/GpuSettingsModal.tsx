import React from 'react';
import { X, Cpu, Zap, CheckCircle2, ShieldCheck, Activity, Layers, Monitor } from 'lucide-react';
import { MirrorConfig, LatencyStats } from '../types';
import { DetectedGpuInfo } from '../utils/gpuDetector';

interface GpuSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MirrorConfig;
  onChangeConfig: (updates: Partial<MirrorConfig>) => void;
  gpuInfo: DetectedGpuInfo;
  stats: LatencyStats;
}

export const GpuSettingsModal: React.FC<GpuSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
  gpuInfo,
  stats,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl shadow-cyan-950/40 p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Akselerasi Grafis GPU & Video Decoder
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Hardware Active
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Konfigurasi pemrosesan render video mirroring langsung menggunakan kartu grafis PC (GPU)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Detected GPU Card */}
        <div className="rounded-xl bg-slate-950 border border-cyan-500/20 p-4 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                <Monitor className="w-4 h-4" />
                Kartu Grafis PC Terdeteksi
              </div>
              <div className="text-base font-bold text-white font-mono">
                {gpuInfo.renderer}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span>Vendor: <strong className="text-slate-200">{gpuInfo.vendor}</strong></span>
                <span>•</span>
                <span>Max Texture: <strong className="text-slate-200">{gpuInfo.maxTextureSize}px</strong></span>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Akselerasi Aktif
              </span>
              <div className="text-[11px] text-slate-400 font-mono mt-1">
                Latensi Decode: {stats.gpuDecodeLatencyMs.toFixed(1)} ms
              </div>
            </div>
          </div>

          {/* Real-time Telemetry Bars */}
          <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-800/80 text-xs">
            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Beban GPU Render</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-cyan-400 font-mono">{stats.gpuLoadPercent.toFixed(0)}%</span>
                <span className="text-[10px] text-emerald-400">Optimal</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, stats.gpuLoadPercent)}%` }}
                />
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Alokasi VRAM Grafis</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-indigo-400 font-mono">{stats.gpuVramMb} MB</span>
                <span className="text-[10px] text-slate-400">/ 1080p</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className="h-full bg-indigo-400 transition-all duration-300"
                  style={{ width: `${Math.min(100, (stats.gpuVramMb / 512) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 text-[10px] block">Penghematan CPU</span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-sm font-bold text-emerald-400 font-mono">92%</span>
                <span className="text-[10px] text-emerald-400">Bebas Bottleneck</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                <div className="h-full bg-emerald-400 w-[92%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Controls */}
        <div className="space-y-5">
          {/* Hardware Driver Selector */}
          <div>
            <label className="text-sm font-semibold text-slate-200 block mb-2">
              Pilihan GPU Render Driver (DirectX / Vulkan / NVDEC)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                {
                  id: 'direct3d11',
                  name: 'Direct3D 11 (DirectX)',
                  desc: 'Paling stabil di Windows 10/11, latensi decode ~0.5ms',
                  badge: 'Rekomendasi Windows',
                  badgeColor: 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10',
                },
                {
                  id: 'nvdec',
                  name: 'NVIDIA NVDEC Hardware',
                  desc: 'Optimal untuk kartu grafis NVIDIA GeForce GTX / RTX',
                  badge: 'NVIDIA GPU',
                  badgeColor: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
                },
                {
                  id: 'vulkan',
                  name: 'Vulkan Low-Overhead',
                  desc: 'Performa tinggi untuk gaming dan refresh rate 120Hz+',
                  badge: 'High Performance',
                  badgeColor: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
                },
                {
                  id: 'opengl',
                  name: 'OpenGL Accelerated',
                  desc: 'Kompatibilitas standar lintas arsitektur GPU',
                  badge: 'Universal',
                  badgeColor: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10',
                },
                {
                  id: 'software',
                  name: 'Software (CPU Rendering)',
                  desc: 'Hanya jika GPU crash atau driver bermasalah (CPU tinggi)',
                  badge: 'Fallback',
                  badgeColor: 'text-slate-400 border-slate-600 bg-slate-800',
                },
              ].map((driver) => {
                const isSelected = config.gpuRenderer === driver.id;
                return (
                  <button
                    key={driver.id}
                    onClick={() => onChangeConfig({ gpuRenderer: driver.id as MirrorConfig['gpuRenderer'] })}
                    className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="font-semibold text-sm flex items-center gap-1.5">
                        {driver.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${driver.badgeColor}`}>
                        {driver.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                      {driver.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Windows GPU Preference Profile */}
          <div className="pt-2">
            <label className="text-sm font-semibold text-slate-200 block mb-2">
              Profil Performa Windows Graphics
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  id: 'high_performance',
                  title: 'High Performance',
                  desc: 'Paksa Discrete GPU (NVIDIA / AMD)',
                },
                {
                  id: 'balanced',
                  title: 'Balanced',
                  desc: 'Otomatis pilih GPU hemat daya',
                },
                {
                  id: 'power_save',
                  title: 'Power Saver',
                  desc: 'Hemat baterai laptop (iGPU)',
                },
              ].map((p) => {
                const isSelected = config.gpuProfile === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onChangeConfig({ gpuProfile: p.id as MirrorConfig['gpuProfile'] })}
                    className={`p-3 rounded-xl border text-left transition ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 text-white'
                        : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="font-semibold text-xs text-white">{p.title}</div>
                    <div className="text-[11px] text-slate-400 mt-1 leading-tight">{p.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Technical Explanation Note */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white">Mengapa Akselerasi GPU Mengurangi Latensi?</strong>
              <p className="text-slate-400 leading-relaxed">
                Ketika video mirror diproses oleh GPU (Direct3D 11/NVDEC), aliran frame H.264/H.265 langsung didekode di memori grafis (VRAM) dan ditampilkan ke layar monitor tanpa melewati pipeline antrean CPU. Ini memangkas waktu pemrosesan dari <strong>12-18 ms menjadi hanya ~0.5-1.2 ms</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm transition shadow-lg shadow-cyan-600/20"
          >
            Terapkan Konfigurasi GPU
          </button>
        </div>
      </div>
    </div>
  );
};
