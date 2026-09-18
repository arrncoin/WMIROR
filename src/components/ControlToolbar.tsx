import React, { useState } from 'react';
import { 
  Power, 
  RotateCw, 
  Volume2, 
  Volume1, 
  Camera, 
  Video, 
  Square, 
  EyeOff, 
  Maximize2, 
  Minimize2, 
  Settings, 
  Download, 
  HelpCircle, 
  Gamepad2, 
  ClipboardCopy, 
  Check 
} from 'lucide-react';
import { MirrorConfig } from '../types';
import { adbBridge } from '../utils/webUsbAdb';

interface ControlToolbarProps {
  config: MirrorConfig;
  onChangeConfig: (newConfig: Partial<MirrorConfig>) => void;
  onOpenSettings: () => void;
  onOpenGuide: () => void;
  onOpenWindowsPackage: () => void;
  onOpenKeymapping: () => void;
  onTakeScreenshot: () => void;
  isRecording: boolean;
  recordingDurationSec: number;
  onToggleRecord: () => void;
  showKeymapping: boolean;
  onToggleKeymapping: () => void;
}

export const ControlToolbar: React.FC<ControlToolbarProps> = ({
  config,
  onChangeConfig,
  onOpenSettings,
  onOpenGuide,
  onOpenWindowsPackage,
  onOpenKeymapping,
  onTakeScreenshot,
  isRecording,
  recordingDurationSec,
  onToggleRecord,
  showKeymapping,
  onToggleKeymapping,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedClipboard, setCopiedClipboard] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const handlePower = () => {
    adbBridge.injectKeyEvent('KEYCODE_POWER');
  };

  const handleVolUp = () => {
    adbBridge.injectKeyEvent('KEYCODE_VOLUME_UP');
  };

  const handleVolDown = () => {
    adbBridge.injectKeyEvent('KEYCODE_VOLUME_DOWN');
  };

  const handleRotate = () => {
    const nextOrient = config.orientation === 'portrait' ? 'landscape' : 'portrait';
    onChangeConfig({ orientation: nextOrient });
  };

  const handleClipboardSync = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        adbBridge.injectText(text);
        setCopiedClipboard(true);
        setTimeout(() => setCopiedClipboard(false), 2000);
      }
    } catch {
      setCopiedClipboard(true);
      setTimeout(() => setCopiedClipboard(false), 2000);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
      {/* Group 1: Hardware controls */}
      <div className="flex items-center space-x-1.5">
        <button
          id="btn-toolbar-power"
          onClick={handlePower}
          title="Tombol Power (Layar Nyala/Mati)"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          <Power className="w-4 h-4" />
        </button>

        <button
          id="btn-toolbar-volup"
          onClick={handleVolUp}
          title="Volume Naik (+)"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          <Volume2 className="w-4 h-4" />
        </button>

        <button
          id="btn-toolbar-voldown"
          onClick={handleVolDown}
          title="Volume Turun (-)"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          <Volume1 className="w-4 h-4" />
        </button>

        <button
          id="btn-toolbar-rotate"
          onClick={handleRotate}
          title="Putar Orientasi (Portrait / Landscape)"
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            config.orientation === 'landscape'
              ? 'bg-cyan-950 text-cyan-300 border-cyan-700'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
          }`}
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Turn Physical Screen Off Toggle */}
        <button
          id="btn-toolbar-screenoff"
          onClick={() => onChangeConfig({ turnScreenOff: !config.turnScreenOff })}
          title="Matikan Layar HP (Hemat Baterai Saat Mirroring)"
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 ${
            config.turnScreenOff
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm shadow-emerald-900/30'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
          }`}
        >
          <EyeOff className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Screen Off</span>
        </button>
      </div>

      {/* Group 2: Capture & Gaming */}
      <div className="flex items-center space-x-1.5">
        <button
          id="btn-toolbar-screenshot"
          onClick={onTakeScreenshot}
          title="Ambil Screenshot HP (Simpan ke PC)"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          <Camera className="w-4 h-4 text-cyan-400" />
        </button>

        {/* Screen Record */}
        <button
          id="btn-toolbar-record"
          onClick={onToggleRecord}
          title={isRecording ? 'Hentikan Perekaman' : 'Rekam Layar HP & Audio PC'}
          className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all active:scale-95 ${
            isRecording
              ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>{Math.floor(recordingDurationSec / 60)}:{(recordingDurationSec % 60).toString().padStart(2, '0')}</span>
            </>
          ) : (
            <>
              <Video className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Rekam</span>
            </>
          )}
        </button>

        {/* Game Keymapping toggle */}
        <button
          id="btn-toolbar-keymapping"
          onClick={onOpenKeymapping}
          title="Atur Keyboard Game (WASD / Tombol Layar)"
          className={`p-2 rounded-xl border transition-all active:scale-95 ${
            showKeymapping
              ? 'bg-amber-950 text-amber-300 border-amber-600'
              : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
          }`}
        >
          <Gamepad2 className="w-4 h-4 text-amber-400" />
        </button>

        {/* Sync Clipboard */}
        <button
          id="btn-toolbar-clipboard"
          onClick={handleClipboardSync}
          title="Kirim Clipboard PC ke HP"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          {copiedClipboard ? <Check className="w-4 h-4 text-emerald-400" /> : <ClipboardCopy className="w-4 h-4" />}
        </button>
      </div>

      {/* Group 3: Setup & Settings */}
      <div className="flex items-center space-x-1.5">
        <button
          id="btn-toolbar-guide"
          onClick={onOpenGuide}
          title="Panduan Aktifkan USB Debugging HP"
          className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-cyan-300 border border-slate-700/60 text-xs font-semibold flex items-center space-x-1 active:scale-95 transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Panduan USB</span>
        </button>

        <button
          id="btn-toolbar-winpkg"
          onClick={onOpenWindowsPackage}
          title="Download Launcher Standalone Windows (.bat / scrcpy)"
          className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white shadow-md shadow-cyan-950 text-xs font-semibold flex items-center space-x-1.5 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Paket Windows (.bat)</span>
        </button>

        <button
          id="btn-toolbar-settings"
          onClick={onOpenSettings}
          title="Pengaturan Latensi, Resolusi, FPS & Bitrate"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          id="btn-toolbar-fullscreen"
          onClick={toggleFullscreen}
          title="Layar Penuh"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 active:scale-95 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
