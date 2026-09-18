import React, { useState } from 'react';
import { X, Download, Copy, Check, Terminal, FileCode, Monitor, Sparkles, ExternalLink } from 'lucide-react';
import { MirrorConfig, DeviceInfo } from '../types';
import { generateScrcpyBat, generatePowerShellScript, downloadFile } from '../utils/scriptGenerator';

interface WindowsPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MirrorConfig;
  device: DeviceInfo;
}

export const WindowsPackageModal: React.FC<WindowsPackageModalProps> = ({
  isOpen,
  onClose,
  config,
  device,
}) => {
  const [copiedBat, setCopiedBat] = useState(false);
  const [copiedPs, setCopiedPs] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'bat' | 'ps' | 'scrcpy_info'>('bat');

  if (!isOpen) return null;

  const batContent = generateScrcpyBat(config, device.connectionStatus === 'connected' ? device.id : undefined);
  const psContent = generatePowerShellScript(config);

  const rawCmd = `scrcpy --audio-codec=${config.audioCodec} --audio-buffer=${config.audioBufferMs} --max-fps=${config.maxFps} -b ${config.videoBitrate}M --keyboard=uhid --mouse=uhid ${config.turnScreenOff ? '--turn-screen-off ' : ''}--stay-awake`;

  const handleDownloadBat = () => {
    downloadFile('Start-Android-USB-Mirror.bat', batContent);
  };

  const handleDownloadPs = () => {
    downloadFile('Start-Android-USB-Mirror.ps1', psContent);
  };

  const copyToClipboard = (text: string, type: 'bat' | 'ps' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'bat') {
      setCopiedBat(true);
      setTimeout(() => setCopiedBat(false), 2000);
    } else if (type === 'ps') {
      setCopiedPs(true);
      setTimeout(() => setCopiedPs(false), 2000);
    } else {
      setCopiedCmd(true);
      setTimeout(() => setCopiedCmd(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/50 flex items-center justify-center text-blue-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Paket Eksekusi Standalone Windows (.bat)</h2>
              <p className="text-xs text-slate-400">Jalankan Mirroring & Audio Latensi Super Rendah di PC Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Tabs */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/40">
          <button
            onClick={() => setActiveTab('bat')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'bat'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>File Batch (.bat)</span>
          </button>

          <button
            onClick={() => setActiveTab('ps')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'ps'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>PowerShell (.ps1)</span>
          </button>

          <button
            onClick={() => setActiveTab('scrcpy_info')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'scrcpy_info'
                ? 'border-cyan-500 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Parameter Scrcpy 2.0+</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 space-y-4">
          {activeTab === 'bat' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-cyan-950/40 border border-cyan-800/40 p-3.5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-cyan-300">File Peluncur Sekali Klik Windows (.bat)</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    File ini otomatis mendeteksi HP Android via kabel USB, menjalankan audio forwarding raw PCM, dan mengaktifkan kontrol mouse.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(batContent, 'bat')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    {copiedBat ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedBat ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={handleDownloadBat}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-cyan-950 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .BAT</span>
                  </button>
                </div>
              </div>

              {/* Code Viewer */}
              <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-60 leading-relaxed">
                <pre>{batContent}</pre>
              </div>

              {/* Quick CLI command */}
              <div className="space-y-1.5">
                <p className="text-xs font-bold text-slate-300">Atau jalankan langsung di Command Prompt (CMD) Windows:</p>
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-2.5 space-x-2">
                  <code className="text-xs text-cyan-400 font-mono flex-1 overflow-x-auto">{rawCmd}</code>
                  <button
                    onClick={() => copyToClipboard(rawCmd, 'cmd')}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300"
                    title="Salin Perintah"
                  >
                    {copiedCmd ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ps' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-blue-950/40 border border-blue-800/40 p-3.5 rounded-2xl">
                <div>
                  <h4 className="text-xs font-bold text-blue-300">PowerShell Script Windows (.ps1)</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">
                    Cocok untuk Windows Terminal dan PowerShell dengan parameter modular.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(psContent, 'ps')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all"
                  >
                    {copiedPs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedPs ? 'Tersalin' : 'Salin'}</span>
                  </button>
                  <button
                    onClick={handleDownloadPs}
                    className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold flex items-center space-x-1.5 shadow-lg shadow-blue-950 hover:brightness-110 active:scale-95 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download .PS1</span>
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-slate-950 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-60 leading-relaxed">
                <pre>{psContent}</pre>
              </div>
            </div>
          )}

          {activeTab === 'scrcpy_info' && (
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-200">Mengapa Konfigurasi Ini Memberikan Latensi Terendah?</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <p className="font-bold text-cyan-400">--audio-codec=raw</p>
                  <p className="text-slate-400 mt-0.5">
                    Meneruskan audio stereo mentah tanpa kompresi enc/dec. Menghilangkan delay kompresi sehingga audio sinkron dengan video game/film.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <p className="font-bold text-cyan-400">--audio-buffer={config.audioBufferMs}</p>
                  <p className="text-slate-400 mt-0.5">
                    Mengatur buffer delay audio ke {config.audioBufferMs}ms (ultra-rendah), jauh lebih responsif dari standar 50ms.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <p className="font-bold text-cyan-400">--mouse=uhid & --keyboard=uhid</p>
                  <p className="text-slate-400 mt-0.5">
                    Mengemulasikan mouse fisik HID langsung ke kernel Linux Android via USB. Bebas lag dan mendeteksi klik kanan sebagai tombol Back.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/60">
                  <p className="font-bold text-cyan-400">--turn-screen-off</p>
                  <p className="text-slate-400 mt-0.5">
                    Mematikan panel fisik layar HP saat mirroring di PC. Mengurangi temperatur HP hingga 8°C dan menghemat daya baterai.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
          <span>Memerlukan Android 11+ (Audio) atau Android 12+ untuk Forwarding Suara Game</span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
