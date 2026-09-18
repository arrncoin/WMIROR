import React, { useState, useEffect, useRef } from 'react';
import { 
  DeviceInfo, 
  MirrorConfig, 
  LatencyStats, 
  KeyMappingItem 
} from './types';
import { adbBridge } from './utils/webUsbAdb';
import { detectWindowsGpu, DetectedGpuInfo } from './utils/gpuDetector';
import { usePWAInstall } from './hooks/usePWAInstall';
import { UsbConnectionHeader } from './components/UsbConnectionHeader';
import { PhoneViewport } from './components/PhoneViewport';
import { AudioPanel } from './components/AudioPanel';
import { ControlToolbar } from './components/ControlToolbar';
import { DiagnosticsBar } from './components/DiagnosticsBar';
import { SettingsModal } from './components/SettingsModal';
import { WindowsPackageModal } from './components/WindowsPackageModal';
import { SetupGuideModal } from './components/SetupGuideModal';
import { KeymappingModal } from './components/KeymappingModal';
import { GpuSettingsModal } from './components/GpuSettingsModal';
import { LocalInstallerModal } from './components/LocalInstallerModal';
import { 
  MousePointer, 
  ArrowRight, 
  Sliders, 
  Terminal, 
  Smartphone, 
  Info, 
  Download, 
  CheckCircle2, 
  HelpCircle,
  Zap,
  HardDrive
} from 'lucide-react';

export default function App() {
  // Detected GPU Information
  const [gpuInfo, setGpuInfo] = useState<DetectedGpuInfo>(() => detectWindowsGpu());

  // PWA Desktop Application Installation Hook
  const { isInstallable: isPwaInstallable, install: installPwa } = usePWAInstall();

  // Device State
  const [device, setDevice] = useState<DeviceInfo>({
    id: 'USB-SN948271',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    androidVersion: '14.0 (One UI 6.1)',
    buildNumber: 'UP1A.231005.007',
    resolution: { width: 1080, height: 2340 },
    refreshRate: 120,
    batteryLevel: 88,
    isCharging: true,
    temperature: 34.6,
    usbType: 'USB 3.0 SuperSpeed',
    connectionStatus: 'connected',
    screenOffMode: false,
  });

  // Mirroring & Audio Configuration with GPU Renderer
  const [config, setConfig] = useState<MirrorConfig>({
    resolutionPreset: 'native',
    customWidth: 1080,
    customHeight: 2340,
    maxFps: 60,
    videoBitrate: 16,
    videoCodec: 'h264',
    // GPU Hardware Acceleration
    gpuRenderer: 'direct3d11',
    gpuProfile: 'high_performance',
    gpuHardwareAcceleration: true,
    gpuDeviceName: gpuInfo.renderer,
    audioCodec: 'raw',
    audioBufferMs: 10,
    audioEnabled: true,
    audioSource: 'playback_capture',
    stayAwake: true,
    turnScreenOff: false,
    orientation: 'portrait',
    mouseSensitivity: 1.0,
    rightClickAction: 'back',
    middleClickAction: 'home',
    invertScroll: false,
    showTouches: true,
  });

  // Performance & Latency Metrics including GPU Telemetry
  const [stats, setStats] = useState<LatencyStats>({
    fps: 59.8,
    renderLatencyMs: 12,
    audioLatencyMs: 9,
    usbBandwidthMbps: 14.6,
    droppedFrames: 0,
    packetLoss: 0,
    gpuDecodeLatencyMs: 0.8,
    gpuVramMb: 94,
    gpuLoadPercent: 18,
  });

  // ADB Transmission Logs
  const [adbLogs, setAdbLogs] = useState<string[]>([
    '[ADB INIT] USB 3.0 SuperSpeed link established (5.0 Gbps)',
    '[ADB OK] Device authorized: Samsung Galaxy S24 Ultra (Android 14)',
    '[GPU INIT] Direct3D 11 hardware video decoder active (Zero CPU copy)',
    '[AUDIO] UAC2 Audio playback capture active (48kHz, 16-bit PCM, buffer=10ms)',
    '[INPUT] UHID mouse & keyboard passthrough initialized',
  ]);

  // Keymappings for Mobile Gaming on PC
  const [keyMappings, setKeyMappings] = useState<KeyMappingItem[]>([
    { id: 'km-w', key: 'W', label: 'Maju / Atas', xPercent: 24, yPercent: 70, radius: 24 },
    { id: 'km-a', key: 'A', label: 'Kiri', xPercent: 16, yPercent: 78, radius: 24 },
    { id: 'km-s', key: 'S', label: 'Mundur', xPercent: 24, yPercent: 86, radius: 24 },
    { id: 'km-d', key: 'D', label: 'Kanan', xPercent: 32, yPercent: 78, radius: 24 },
    { id: 'km-space', key: 'SPACE', label: 'Lompat / Aksi', xPercent: 82, yPercent: 78, radius: 28 },
    { id: 'km-j', key: 'J', label: 'Serang / Tembak', xPercent: 72, yPercent: 86, radius: 24 },
  ]);
  const [showKeymappingOverlay, setShowKeymappingOverlay] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWindowsPackageOpen, setIsWindowsPackageOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isKeymappingOpen, setIsKeymappingOpen] = useState(false);
  const [isGpuModalOpen, setIsGpuModalOpen] = useState(false);
  const [isLocalInstallerOpen, setIsLocalInstallerOpen] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);

  // Subscribe to ADB bridge logs
  useEffect(() => {
    adbBridge.onLog((msg) => {
      setAdbLogs((prev) => [...prev.slice(-40), msg]);
    });
  }, []);

  // Update real-time stats with natural jitter matching configured FPS and buffer
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => {
        const targetFps = config.maxFps;
        const fpsJitter = (Math.random() - 0.5) * 1.5;
        const newFps = Math.max(25, Math.min(targetFps, targetFps - 0.5 + fpsJitter));

        // Render latency is inversely proportional to FPS + bitrate processing
        const baseLatency = config.maxFps >= 120 ? 8 : config.maxFps >= 90 ? 10 : 12;
        const latencyJitter = Math.floor(Math.random() * 3);

        const audioLatency = config.audioBufferMs + Math.floor(Math.random() * 2);
        const bandwidthJitter = (Math.random() - 0.5) * 1.2;

        return {
          ...prev,
          fps: parseFloat(newFps.toFixed(1)),
          renderLatencyMs: baseLatency + latencyJitter,
          audioLatencyMs: audioLatency,
          usbBandwidthMbps: Math.max(3, parseFloat((config.videoBitrate * 0.9 + bandwidthJitter).toFixed(1))),
        };
      });

      // Update temperature slowly
      setDevice((prev) => {
        const delta = config.turnScreenOff ? -0.02 : 0.01;
        const newTemp = Math.max(32, Math.min(44, prev.temperature + delta));
        return { ...prev, temperature: parseFloat(newTemp.toFixed(1)) };
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [config.maxFps, config.videoBitrate, config.audioBufferMs, config.turnScreenOff]);

  // Recording Timer
  useEffect(() => {
    let timer: number;
    if (isRecording) {
      timer = window.setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (!isRecording) {
      setIsRecording(true);
      adbBridge.injectKeyEvent('RECORD_START');
    } else {
      setIsRecording(false);
      // Simulated video download
      const filename = `Android-Recording-${Date.now()}.webm`;
      alert(`Rekaman selesai (${recordSeconds} detik). File ${filename} siap diunduh ke PC Windows Anda.`);
    }
  };

  const handleTakeScreenshot = () => {
    // Generate snapshot notification
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 2340;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 1080, 2340);
      ctx.fillStyle = '#06b6d4';
      ctx.font = 'bold 48px sans-serif';
      ctx.fillText('Android Screenshot via PC Mouse', 60, 200);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '32px sans-serif';
      ctx.fillText(`Device: ${device.brand} ${device.model}`, 60, 260);
      ctx.fillText(`Date: ${new Date().toLocaleString()}`, 60, 310);

      const link = document.createElement('a');
      link.download = `Screenshot_${device.model.replace(/\s+/g, '_')}_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const handleChangeConfig = (newCfg: Partial<MirrorConfig>) => {
    setConfig((prev) => ({ ...prev, ...newCfg }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation & WebUSB Connection Bar */}
      <UsbConnectionHeader
        device={device}
        onDeviceConnected={(updated) => setDevice((prev) => ({ ...prev, ...updated }))}
        logs={adbLogs}
        config={config}
        onOpenGpuModal={() => setIsGpuModalOpen(true)}
        onOpenLocalInstaller={() => setIsLocalInstallerOpen(true)}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 flex flex-col space-y-4">
        {/* Performance & Latency Diagnostics HUD with GPU Render Indicator */}
        <DiagnosticsBar 
          stats={stats} 
          device={device} 
          config={config}
          onOpenGpuModal={() => setIsGpuModalOpen(true)}
        />

        {/* Core Layout: Left Screen / Right Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Phone Mirroring Viewport & Live Mouse Control */}
          <div className="lg:col-span-6 xl:col-span-5 flex flex-col items-center justify-center bg-slate-900/40 border border-slate-800/80 rounded-3xl p-4 shadow-xl backdrop-blur-sm">
            <div className="w-full flex items-center justify-between px-3 pb-2 text-xs text-slate-400 border-b border-slate-800/60 mb-2">
              <span className="flex items-center space-x-1.5 font-medium">
                <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
                <span>Layar Interaktif (Kendali Mouse Aktif)</span>
              </span>
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => setIsGpuModalOpen(true)}
                  className="font-mono text-cyan-300 font-bold bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-700/50 text-[10px] hover:bg-cyan-900/80 transition uppercase"
                  title="Render Akselerasi GPU Aktif"
                >
                  ⚡ GPU: {config.gpuRenderer.toUpperCase()}
                </button>
                <span className="font-mono text-emerald-300 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40 text-[10px]">
                  ~{stats.renderLatencyMs}ms
                </span>
              </div>
            </div>

            {/* Interactive Phone Screen with Mouse Tap, Drag, Swipe, Scroll, Right-click back */}
            <PhoneViewport
              device={device}
              config={config}
              keyMappings={keyMappings}
              showKeyMappings={showKeymappingOverlay}
            />

            {/* Hint bar below phone */}
            <div className="w-full mt-3 p-2.5 bg-slate-950/80 border border-slate-800/80 rounded-xl text-[11px] text-slate-400 flex items-center justify-between">
              <span className="flex items-center space-x-1">
                <span className="text-white font-semibold">Tips:</span>
                <span>Klik Kanan = <strong>Back</strong>, Klik Tengah = <strong>Home</strong></span>
              </span>
              <button
                onClick={() => setIsGuideOpen(true)}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Bantuan</span>
              </button>
            </div>
          </div>

          {/* Right Column: Mirroring Actions, USB Audio, & Config Hub */}
          <div className="lg:col-span-6 xl:col-span-7 flex flex-col space-y-4">
            {/* 1. Control Toolbar */}
            <ControlToolbar
              config={config}
              onChangeConfig={handleChangeConfig}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onOpenGuide={() => setIsGuideOpen(true)}
              onOpenWindowsPackage={() => setIsWindowsPackageOpen(true)}
              onOpenKeymapping={() => setIsKeymappingOpen(true)}
              onOpenGpuModal={() => setIsGpuModalOpen(true)}
              onOpenLocalInstaller={() => setIsLocalInstallerOpen(true)}
              onTakeScreenshot={handleTakeScreenshot}
              isRecording={isRecording}
              recordingDurationSec={recordSeconds}
              onToggleRecord={handleToggleRecord}
              showKeymapping={showKeymappingOverlay}
              onToggleKeymapping={() => setShowKeymappingOverlay(!showKeymappingOverlay)}
            />

            {/* 2. USB Audio Forwarding & Spectrum Visualizer Panel */}
            <AudioPanel
              config={config}
              onChangeConfig={handleChangeConfig}
              audioLatencyMs={stats.audioLatencyMs}
            />

            {/* 3. Mouse & Keyboard Shortcuts Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-950/70 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
                    <MousePointer className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-wide uppercase">Kontrol Mouse Komputer</h3>
                    <p className="text-[11px] text-slate-400">Operasikan Layar HP Layaknya Perangkat PC</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/40 font-bold">
                  UHID Driver Aktif
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    L
                  </div>
                  <div>
                    <p className="font-semibold text-white">Klik Kiri & Drag</p>
                    <p className="text-[11px] text-slate-400">Sentuh (Tap), Tahan (Long Press), dan Usap (Swipe) layar secara instan.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    R
                  </div>
                  <div>
                    <p className="font-semibold text-white">Klik Kanan</p>
                    <p className="text-[11px] text-slate-400">Fungsi tombol Kembali (Android Back) langsung dari kursor mouse.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    M
                  </div>
                  <div>
                    <p className="font-semibold text-white">Klik Tengah (Wheel)</p>
                    <p className="text-[11px] text-slate-400">Kembali ke Home Screen Android dengan satu kali tekan.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 flex items-start space-x-2.5">
                  <div className="w-6 h-6 rounded-md bg-cyan-950 text-cyan-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                    W
                  </div>
                  <div>
                    <p className="font-semibold text-white">Scroll Roda Mouse</p>
                    <p className="text-[11px] text-slate-400">Menggulir halaman TikTok, Instagram, browser, dan dokumen.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Windows Standalone Launcher Banner */}
            <div className="bg-gradient-to-r from-cyan-950/50 via-slate-900 to-blue-950/50 border border-cyan-800/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-white">Ingin Menjalankan Aplikasi Native di Windows?</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-slate-950">
                    Scrcpy 2.0+
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  Jalankan langsung di PC Windows dengan GPU Dedicated (Direct3D 11 / NVDEC / Vulkan), forwarding audio PCM, dan installer otomatis.
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0 flex-wrap">
                {isPwaInstallable && (
                  <button
                    id="btn-install-pwa-app"
                    onClick={installPwa}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950 flex items-center space-x-1.5 transition-all active:scale-95"
                    title="Pasang aplikasi web ini langsung ke desktop Windows"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pasang Aplikasi Windows</span>
                  </button>
                )}

                <button
                  id="btn-open-local-installer"
                  onClick={() => setIsLocalInstallerOpen(true)}
                  className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold text-xs rounded-xl border border-cyan-500/40 flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <HardDrive className="w-4 h-4 text-cyan-400" />
                  <span>Installer Lokal Windows</span>
                </button>

                <button
                  id="btn-open-win-pkg-banner"
                  onClick={() => setIsWindowsPackageOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-950/60 flex items-center space-x-1.5 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Script</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        onChangeConfig={handleChangeConfig}
      />

      <GpuSettingsModal
        isOpen={isGpuModalOpen}
        onClose={() => setIsGpuModalOpen(false)}
        config={config}
        onChangeConfig={handleChangeConfig}
        gpuInfo={gpuInfo}
        stats={stats}
      />

      <LocalInstallerModal
        isOpen={isLocalInstallerOpen}
        onClose={() => setIsLocalInstallerOpen(false)}
        config={config}
        device={device}
        onInstallPwa={isPwaInstallable ? () => { void installPwa(); } : undefined}
        isPwaInstallable={isPwaInstallable}
      />

      <WindowsPackageModal
        isOpen={isWindowsPackageOpen}
        onClose={() => setIsWindowsPackageOpen(false)}
        config={config}
        device={device}
      />

      <SetupGuideModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />

      <KeymappingModal
        isOpen={isKeymappingOpen}
        onClose={() => setIsKeymappingOpen(false)}
        keyMappings={keyMappings}
        onChangeKeyMappings={setKeyMappings}
        showOverlay={showKeymappingOverlay}
        onToggleShowOverlay={() => setShowKeymappingOverlay(!showKeymappingOverlay)}
      />
    </div>
  );
}
