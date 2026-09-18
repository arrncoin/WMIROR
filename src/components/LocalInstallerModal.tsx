import React, { useState } from 'react';
import { 
  X, Download, Monitor, CheckCircle, Terminal, HardDrive, 
  Layers, ExternalLink, ShieldCheck, Copy, Check, FileCode, AppWindow, Cpu
} from 'lucide-react';
import { MirrorConfig, DeviceInfo } from '../types';
import { 
  generateLocalWindowsInstallerBat, 
  generateScrcpyBat, 
  generateWindowsRegGpu, 
  generateLocalPackageReadme, 
  downloadFile 
} from '../utils/scriptGenerator';

interface LocalInstallerModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: MirrorConfig;
  device?: DeviceInfo;
  onInstallPwa?: () => void;
  isPwaInstallable?: boolean;
}

export const LocalInstallerModal: React.FC<LocalInstallerModalProps> = ({
  isOpen,
  onClose,
  config,
  device,
  onInstallPwa,
  isPwaInstallable = false,
}) => {
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(id);
    setTimeout(() => setCopiedScript(null), 2500);
  };

  const handleDownloadInstallerBat = () => {
    const batContent = generateLocalWindowsInstallerBat(config);
    downloadFile('Setup-Android-Mirror-Local.bat', batContent);
  };

  const handleDownloadLauncherBat = () => {
    const batContent = generateScrcpyBat(config);
    downloadFile('Run-GPU-Mirror.bat', batContent);
  };

  const handleDownloadReg = () => {
    const regContent = generateWindowsRegGpu();
    downloadFile('Force-HighPerformance-GPU.reg', regContent);
  };

  const handleDownloadReadme = () => {
    const readmeContent = generateLocalPackageReadme(config);
    downloadFile('README-INSTALL.txt', readmeContent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl shadow-cyan-950/40 p-6 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                Paket Build & Instalasi Native Windows
                <span className="text-[10px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold">
                  Windows 10 / 11 64-bit
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Unduh file instalasi lokal mandiri lengkap dengan akselerasi GPU Direct3D11 dan audio latensi rendah
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

        {/* PWA Desktop App Quick Install Banner */}
        <div className="rounded-xl bg-gradient-to-r from-cyan-950/60 to-indigo-950/60 border border-cyan-500/30 p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-300">
              <AppWindow className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Instal sebagai Aplikasi Desktop Windows (.exe Mandiri)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Jalankan aplikasi ini di jendela desktop tanpa toolbar browser dengan ikon di Taskbar & Start Menu
              </p>
            </div>
          </div>
          {onInstallPwa && (
            <button
              onClick={onInstallPwa}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition shrink-0 flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <Download className="w-4 h-4" />
              {isPwaInstallable ? 'Instal Sekarang' : 'Instal App di PC'}
            </button>
          )}
        </div>

        {/* Downloadable Local Native Files */}
        <div className="space-y-4 mb-6">
          <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider text-[11px] font-mono">
            File Installer & Peluncur Lokal Windows (Siap Pakai)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Setup-Android-Mirror-Local.bat */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-cyan-500/40 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4" />
                    Setup-Android-Mirror-Local.bat
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                    Otomatis 1-Klik
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Script instalasi otomatis: membuat direktori <code className="text-slate-300">C:\AndroidMirrorPC</code>, menambahkan registri GPU High Performance, dan membuat Shortcut di Desktop Windows.
                </p>
              </div>
              <button
                onClick={handleDownloadInstallerBat}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Installer (.bat)
              </button>
            </div>

            {/* 2. Run-GPU-Mirror.bat */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Terminal className="w-4 h-4" />
                    Run-GPU-Mirror.bat
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    GPU D3D11
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Peluncur mirroring instan dengan flag akselerasi grafis GPU Direct3D 11, forwarding audio internal RAW PCM, dan input mouse komputer.
                </p>
              </div>
              <button
                onClick={handleDownloadLauncherBat}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Launcher GPU (.bat)
              </button>
            </div>

            {/* 3. Force-HighPerformance-GPU.reg */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                    <Cpu className="w-4 h-4" />
                    Force-HighPerformance-GPU.reg
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    Registry Tweak
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Mengatur Windows DirectX Graphics Preference ke mode High Performance GPU (NVIDIA GeForce / AMD Radeon) untuk latensi render terendah.
                </p>
              </div>
              <button
                onClick={handleDownloadReg}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Registry (.reg)
              </button>
            </div>

            {/* 4. README-INSTALL.txt */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 transition flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-4 h-4" />
                    README-INSTALL.txt
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    Panduan Lengkap
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Dokumentasi tata cara instalasi offline lokal, verifikasi koneksi USB debugging, dan troubleshooting latensi di Windows.
                </p>
              </div>
              <button
                onClick={handleDownloadReadme}
                className="mt-3 w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Petunjuk (.txt)
              </button>
            </div>
          </div>
        </div>

        {/* Step by Step Execution Instructions */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 mb-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2 font-mono">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            Langkah 3 Menit Instalasi di Komputer Windows
          </h4>
          <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
            <li>
              Unduh file <strong className="text-cyan-400 font-mono">Setup-Android-Mirror-Local.bat</strong> di atas.
            </li>
            <li>
              Klik kanan file tersebut di Windows Explorer dan pilih <strong className="text-white">Run as administrator</strong> (Jalankan sebagai administrator).
            </li>
            <li>
              Script otomatis mengkonfigurasi folder sistem di <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300 font-mono">C:\AndroidMirrorPC</code> dan membuat shortcut di Desktop Windows Anda.
            </li>
            <li>
              Colokkan HP Android via kabel USB Type-C ke port USB 3.0 PC (pastikan <em>USB Debugging</em> di HP sudah diizinkan).
            </li>
            <li>
              Klik dua kali shortcut <strong className="text-white">"Android USB Mirror"</strong> di Desktop untuk mulai mirroring dengan render GPU dan audio USB!
            </li>
          </ol>
        </div>

        {/* One-Click Package Command snippet */}
        <div className="rounded-xl bg-slate-950 border border-slate-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-300 font-mono">
              Perintah PowerShell untuk Menjalankan Scrcpy GPU Langsung:
            </span>
            <button
              onClick={() => handleCopy(`scrcpy --render-driver=direct3d11 --video-decoder=auto --max-fps=${config.maxFps} -b ${config.videoBitrate}M --audio-codec=${config.audioCodec} --audio-buffer=${config.audioBufferMs} --keyboard=uhid --mouse=uhid --turn-screen-off`, 'cmd')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition"
            >
              {copiedScript === 'cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedScript === 'cmd' ? 'Tersalin!' : 'Salin Perintah'}
            </button>
          </div>
          <pre className="p-3 rounded-lg bg-slate-900 font-mono text-[11px] text-cyan-300 overflow-x-auto border border-slate-800">
            scrcpy --render-driver=direct3d11 --video-decoder=auto --max-fps={config.maxFps} -b {config.videoBitrate}M --audio-codec={config.audioCodec} --audio-buffer={config.audioBufferMs} --keyboard=uhid --mouse=uhid --turn-screen-off
          </pre>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            100% Bebas Malware & Sumber Terbuka (Open Source)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition"
          >
            Tutup Jendela
          </button>
        </div>
      </div>
    </div>
  );
};
