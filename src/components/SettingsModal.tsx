import React from 'react';
import { X, Sliders, Monitor, Mouse, Volume2, ShieldCheck, Check } from 'lucide-react';
import { MirrorConfig } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MirrorConfig;
  onChangeConfig: (newConfig: Partial<MirrorConfig>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onChangeConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Pengaturan Mirroring & Mouse USB</h2>
              <p className="text-xs text-slate-400">Optimalkan Latensi Render, FPS, Audio & Input Mouse</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Section 1: Video & FPS */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Monitor className="w-4 h-4" />
              <span>Video & Performa Layar</span>
            </h3>

            {/* Resolution Preset */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['native', '1080p', '720p', '480p'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => onChangeConfig({ resolutionPreset: res })}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    config.resolutionPreset === res
                      ? 'bg-cyan-950/80 border-cyan-500 text-white shadow-sm shadow-cyan-900/30'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <p className="font-bold text-xs uppercase">{res === 'native' ? 'Asli (FHD+)' : res}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {res === 'native' ? 'Resolusi Penuh' : res === '1080p' ? '1920x1080' : res === '720p' ? '1280x720 (Hemat)' : '854x480 (Cepat)'}
                  </p>
                </button>
              ))}
            </div>

            {/* Refresh Rate / Max FPS */}
            <div className="flex flex-col space-y-1.5 pt-2">
              <label className="text-xs font-medium text-slate-300">Target Framerate (FPS):</label>
              <div className="grid grid-cols-4 gap-2">
                {([30, 60, 90, 120] as const).map((fps) => (
                  <button
                    key={fps}
                    onClick={() => onChangeConfig({ maxFps: fps })}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold font-mono transition-all ${
                      config.maxFps === fps
                        ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                        : 'bg-slate-800/40 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {fps} FPS {fps >= 90 ? '⚡ Ultra' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Bitrate */}
            <div className="space-y-1 pt-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Video Bitrate USB:</span>
                <span className="font-mono font-bold text-cyan-300">{config.videoBitrate} Mbps</span>
              </div>
              <input
                type="range"
                min="4"
                max="32"
                step="2"
                value={config.videoBitrate}
                onChange={(e) => onChangeConfig({ videoBitrate: parseInt(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>4 Mbps (Low-end PC)</span>
                <span>16 Mbps (Rekomendasi USB 3)</span>
                <span>32 Mbps (Ultra Quality)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Mouse & Input Control */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center space-x-2">
              <Mouse className="w-4 h-4" />
              <span>Kontrol Mouse & Keyboard PC</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Right Click Action */}
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Aksi Klik Kanan Mouse:</label>
                <select
                  value={config.rightClickAction}
                  onChange={(e) => onChangeConfig({ rightClickAction: e.target.value as any })}
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  <option value="back">Tombol Kembali (Android BACK) - Disarankan</option>
                  <option value="power">Kunci Layar (Power)</option>
                  <option value="context">Menu Konteks Standar</option>
                </select>
              </div>

              {/* Middle Click Action */}
              <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Aksi Klik Roda Tengah (Wheel):</label>
                <select
                  value={config.middleClickAction}
                  onChange={(e) => onChangeConfig({ middleClickAction: e.target.value as any })}
                  className="w-full bg-slate-900 text-xs text-white p-2 rounded-lg border border-slate-700 focus:outline-none focus:border-cyan-500"
                >
                  <option value="home">Tombol Beranda (Android HOME)</option>
                  <option value="switch">Buka Task Switcher</option>
                  <option value="none">Tidak Ada</option>
                </select>
              </div>
            </div>

            {/* Mouse Sensitivity */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-300 font-medium">Sensitivitas Kursor Mouse:</span>
                <span className="font-mono font-bold text-cyan-300">{config.mouseSensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={config.mouseSensitivity}
                onChange={(e) => onChangeConfig({ mouseSensitivity: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
            </div>

            {/* Checkboxes */}
            <div className="space-y-2 pt-2">
              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.invertScroll}
                  onChange={(e) => onChangeConfig({ invertScroll: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Balik Arah Scroll Mouse (Invert Scroll Wheel)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.showTouches}
                  onChange={(e) => onChangeConfig({ showTouches: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Tampilkan Efek Gelombang Sentuhan (Visual Ripple Pointer)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.turnScreenOff}
                  onChange={(e) => onChangeConfig({ turnScreenOff: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Matikan Layar Fisik HP Saat Mirroring (Menghemat Baterai & Mencegah HP Panas)</span>
              </label>

              <label className="flex items-center space-x-2.5 cursor-pointer text-xs text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={config.stayAwake}
                  onChange={(e) => onChangeConfig({ stayAwake: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0"
                />
                <span>Cegah HP Masuk Mode Tidur (Stay Awake via USB)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-cyan-950 hover:brightness-110 active:scale-95 transition-all flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Simpan & Terapkan</span>
          </button>
        </div>
      </div>
    </div>
  );
};
