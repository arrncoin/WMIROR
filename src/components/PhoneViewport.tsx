import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Wifi, 
  BatteryCharging, 
  Smartphone, 
  ChevronLeft, 
  Circle, 
  Square, 
  MessageSquare, 
  Play, 
  Pause, 
  SkipForward, 
  Music, 
  Camera, 
  Settings as SettingsIcon, 
  Send,
  Gamepad2,
  Video,
  Volume2,
  Lock,
  RotateCw
} from 'lucide-react';
import { DeviceInfo, MirrorConfig, TouchRipple, SimulatedAppType, KeyMappingItem } from '../types';
import { adbBridge } from '../utils/webUsbAdb';
import { audioEngine } from '../utils/audioEngine';

interface PhoneViewportProps {
  device: DeviceInfo;
  config: MirrorConfig;
  onRecordCapture?: (canvas: HTMLCanvasElement) => void;
  keyMappings?: KeyMappingItem[];
  showKeyMappings?: boolean;
}

export const PhoneViewport: React.FC<PhoneViewportProps> = ({
  device,
  config,
  keyMappings = [],
  showKeyMappings = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<TouchRipple[]>([]);
  const [isMouseDown, setIsMouseDown] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTouchRef = useRef<{ x: number; y: number } | null>(null);

  // Simulated App State
  const [currentApp, setCurrentApp] = useState<SimulatedAppType>('home');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'me' | 'other'; text: string; time: string }>>([
    { sender: 'other', text: 'Halo! Apakah USB Mirroring ke PC sudah aktif?', time: '21:35' },
    { sender: 'me', text: 'Sudah bro, latensinya kenceng banget di bawah 15ms!', time: '21:36' },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [videoIndex, setVideoIndex] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gamePlayerX, setGamePlayerX] = useState(50); // percentage 0-100
  const [cameraFacing, setCameraFacing] = useState<'back' | 'front'>('back');
  const [isLocked, setIsLocked] = useState(false);

  // Status bar time
  const [currentTimeStr, setCurrentTimeStr] = useState('21:40');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  // Sync music state with audio engine
  useEffect(() => {
    if (isPlayingMusic && config.audioEnabled) {
      audioEngine.startSimulatedPhoneAudio('Cyberpunk Groove');
    } else {
      audioEngine.stopAudio();
    }
  }, [isPlayingMusic, config.audioEnabled]);

  // Translate Mouse Coordinates to Phone Screen Coordinates
  const getRelativeCoords = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return { x: 0, y: 0, normX: 0, normY: 0, pxX: 0, pxY: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const relX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const relY = Math.max(0, Math.min(rect.height, e.clientY - rect.top));

    const normX = relX / rect.width;
    const normY = relY / rect.height;

    const phoneX = normX * device.resolution.width;
    const phoneY = normY * device.resolution.height;

    return { x: phoneX, y: phoneY, normX, normY, pxX: relX, pxY: relY };
  }, [device.resolution]);

  const addRipple = useCallback((x: number, y: number, type: 'tap' | 'drag' | 'release') => {
    if (!config.showTouches) return;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev.slice(-8), { id, x, y, type }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 450);
  }, [config.showTouches]);

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button === 2) {
      // Right Click
      handleRightClick(e);
      return;
    }
    if (e.button === 1) {
      // Middle Click
      handleMiddleClick(e);
      return;
    }
    if (e.button !== 0) return; // Left Click only for touches

    const { x, y, pxX, pxY, normX } = getRelativeCoords(e);
    setIsMouseDown(true);
    dragStartRef.current = { x, y, time: performance.now() };
    lastTouchRef.current = { x, y };

    addRipple(pxX, pxY, 'tap');

    // Interactive arcade game control
    if (currentApp === 'game') {
      setGamePlayerX(normX * 100);
      setGameScore((s) => s + 10);
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    const { x, y, pxX, pxY, normX } = getRelativeCoords(e);
    lastTouchRef.current = { x, y };

    if (config.showTouches && Math.random() > 0.4) {
      addRipple(pxX, pxY, 'drag');
    }

    if (currentApp === 'game') {
      setGamePlayerX(Math.max(10, Math.min(90, normX * 100)));
    }
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isMouseDown) return;
    setIsMouseDown(false);

    const { x, y, pxX, pxY } = getRelativeCoords(e);
    addRipple(pxX, pxY, 'release');

    if (dragStartRef.current) {
      const dx = x - dragStartRef.current.x;
      const dy = y - dragStartRef.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const elapsed = performance.now() - dragStartRef.current.time;

      if (dist < 15 && elapsed < 350) {
        // Tap Gesture
        adbBridge.injectTap(x, y);
      } else {
        // Swipe Gesture
        adbBridge.injectSwipe(
          dragStartRef.current.x,
          dragStartRef.current.y,
          x,
          y,
          Math.max(100, Math.min(400, Math.round(elapsed)))
        );

        // In TikTok app: swipe down/up changes video
        if (currentApp === 'tiktok') {
          if (dy < -40) {
            setVideoIndex((v) => (v + 1) % 4);
          } else if (dy > 40) {
            setVideoIndex((v) => (v > 0 ? v - 1 : 3));
          }
        }
      }
    }
    dragStartRef.current = null;
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (config.rightClickAction === 'back') {
      handleAndroidBack();
    } else if (config.rightClickAction === 'power') {
      setIsLocked((l) => !l);
    }
  };

  const handleMiddleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (config.middleClickAction === 'home') {
      handleAndroidHome();
    } else if (config.middleClickAction === 'switch') {
      setCurrentApp('home');
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const delta = e.deltaY;
    const direction = config.invertScroll ? -delta : delta;

    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = device.resolution.width / 2;
      const centerY = device.resolution.height / 2;
      const swipeDistance = direction > 0 ? -300 : 300;

      adbBridge.injectSwipe(centerX, centerY, centerX, centerY + swipeDistance, 120);

      // Scroll TikTok videos
      if (currentApp === 'tiktok') {
        if (direction > 0) setVideoIndex((v) => (v + 1) % 4);
        else setVideoIndex((v) => (v > 0 ? v - 1 : 3));
      }
    }
  };

  // Android Navigation Controls
  const handleAndroidBack = () => {
    adbBridge.injectKeyEvent('KEYCODE_BACK');
    if (currentApp !== 'home') {
      setCurrentApp('home');
    }
  };

  const handleAndroidHome = () => {
    adbBridge.injectKeyEvent('KEYCODE_HOME');
    setCurrentApp('home');
  };

  const handleAndroidRecents = () => {
    adbBridge.injectKeyEvent('KEYCODE_APP_SWITCH');
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg = { sender: 'me' as const, text: chatInput, time: currentTimeStr };
    setChatMessages((prev) => [...prev, newMsg]);
    adbBridge.injectText(chatInput);
    setChatInput('');

    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'other',
          text: 'Pesan diterima lewat keyboard PC Windows via ADB!',
          time: currentTimeStr,
        },
      ]);
    }, 900);
  };

  const videos = [
    {
      author: '@tech_creator',
      title: 'Setup USB Mirroring Android 120 FPS dengan Audio Raw 10ms',
      bg: 'from-emerald-900 to-slate-900',
      tag: '#Windows #Android #Mirroring',
      likes: '14.2K',
    },
    {
      author: '@gamer_pro',
      title: 'Main Game HP di Layar Monitor PC Pakai Mouse dan Keyboard!',
      bg: 'from-purple-900 to-indigo-950',
      tag: '#MobileGaming #USB3 #LowLatency',
      likes: '38.9K',
    },
    {
      author: '@developer_id',
      title: 'Trik aktifkan USB Debugging & scrcpy 2.0 Audio forwarding',
      bg: 'from-cyan-950 to-blue-900',
      tag: '#Tutorial #ADB #PCMasterRace',
      likes: '9.8K',
    },
    {
      author: '@audiophile_hub',
      title: 'Testing Real-time Stereo Audio UAC2 tanpa delay terasa',
      bg: 'from-rose-950 to-slate-900',
      tag: '#HiResAudio #AudioBuffer #USB',
      likes: '22.5K',
    },
  ];

  const isLandscape = config.orientation === 'landscape';

  return (
    <div className="flex flex-col items-center justify-center select-none w-full py-2">
      {/* Phone Body Container */}
      <div 
        className={`relative transition-all duration-300 rounded-[44px] p-3 shadow-2xl border-4 ${
          device.connectionStatus === 'connected' 
            ? 'border-slate-800/90 shadow-cyan-950/40' 
            : 'border-slate-800/60'
        } bg-slate-900/95 flex flex-col items-center`}
        style={{
          width: isLandscape ? '760px' : '390px',
          height: isLandscape ? '440px' : '770px',
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8), 0 0 40px 0 rgba(6, 182, 212, 0.12)',
        }}
      >
        {/* Physical hardware buttons on side */}
        <div className="absolute -left-4 top-28 w-1 h-12 bg-slate-700 rounded-l-sm cursor-pointer hover:bg-cyan-500 transition-colors" title="Volume Up" />
        <div className="absolute -left-4 top-44 w-1 h-12 bg-slate-700 rounded-l-sm cursor-pointer hover:bg-cyan-500 transition-colors" title="Volume Down" />
        <div className="absolute -right-4 top-36 w-1 h-16 bg-slate-700 rounded-r-sm cursor-pointer hover:bg-red-500 transition-colors" title="Power Button" onClick={() => setIsLocked(!isLocked)} />

        {/* Screen Bezel & Display */}
        <div
          ref={containerRef}
          id="phone-viewport-screen"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onContextMenu={handleRightClick}
          onWheel={handleWheel}
          className="relative w-full h-full rounded-[34px] overflow-hidden bg-black flex flex-col justify-between cursor-crosshair group"
        >
          {/* Top Status Bar */}
          <div className="relative z-30 flex items-center justify-between px-6 pt-3 pb-1 text-xs text-white/90 font-medium tracking-tight">
            <span className="font-semibold text-[13px]">{currentTimeStr}</span>

            {/* Front Camera Punch-hole */}
            <div className="absolute left-1/2 -translate-x-1/2 top-2.5 w-4 h-4 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-950/80 ring-1 ring-blue-500/30" />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">5G</span>
              <Wifi className="w-3.5 h-3.5 text-white/90" />
              <div className="flex items-center space-x-1">
                <span className="text-[11px]">{device.batteryLevel}%</span>
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Locked Screen Overlay */}
          {isLocked ? (
            <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-cyan-400 animate-pulse" />
              </div>
              <h3 className="text-3xl font-extrabold text-white mb-1">{currentTimeStr}</h3>
              <p className="text-sm text-slate-400 mb-6">Layar Terkunci (Klik untuk Buka)</p>
              <button
                id="btn-unlock-phone"
                onClick={() => setIsLocked(false)}
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-sm rounded-full shadow-lg shadow-cyan-900/40 hover:brightness-110 active:scale-95 transition-all"
              >
                Usap / Klik untuk Membuka
              </button>
            </div>
          ) : null}

          {/* Turn Screen Off Mode Overlay (Saves phone battery & heat) */}
          {config.turnScreenOff && (
            <div className="absolute top-10 right-3 z-30 bg-black/70 backdrop-blur-sm border border-emerald-500/30 px-2.5 py-1 rounded-full flex items-center space-x-1.5 text-[11px] text-emerald-300">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Layar Fisik HP Mati (Hemat Baterai)</span>
            </div>
          )}

          {/* Active Application Content */}
          <div className="relative flex-1 w-full overflow-hidden flex flex-col">
            {/* APP 1: HOME SCREEN */}
            {currentApp === 'home' && (
              <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-indigo-950/70">
                {/* Search Bar Widget */}
                <div className="w-full bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-4 py-2.5 flex items-center space-x-2.5 shadow-md">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 via-red-500 to-amber-400 flex items-center justify-center text-[10px] font-black text-white">G</div>
                  <span className="text-xs text-white/60">Cari aplikasi atau web...</span>
                </div>

                {/* App Grid */}
                <div className="grid grid-cols-4 gap-4 py-6">
                  {/* WhatsApp */}
                  <button
                    id="app-icon-whatsapp"
                    onClick={() => setCurrentApp('whatsapp')}
                    className="flex flex-col items-center space-y-1.5 group/app focus:outline-none"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/40 group-hover/app:scale-105 transition-transform">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">WhatsApp</span>
                  </button>

                  {/* TikTok / Shorts */}
                  <button
                    id="app-icon-tiktok"
                    onClick={() => setCurrentApp('tiktok')}
                    className="flex flex-col items-center space-y-1.5 group/app focus:outline-none"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-black border border-white/20 flex items-center justify-center text-white shadow-lg shadow-purple-900/30 group-hover/app:scale-105 transition-transform">
                      <Video className="w-7 h-7 text-cyan-400" />
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">TikTok</span>
                  </button>

                  {/* Music Player */}
                  <button
                    id="app-icon-music"
                    onClick={() => setCurrentApp('music')}
                    className="flex flex-col items-center space-y-1.5 group/app focus:outline-none"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-lg shadow-violet-900/40 group-hover/app:scale-105 transition-transform">
                      <Music className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">Musik</span>
                  </button>

                  {/* Game Arcade */}
                  <button
                    id="app-icon-game"
                    onClick={() => setCurrentApp('game')}
                    className="flex flex-col items-center space-y-1.5 group/app focus:outline-none"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg shadow-orange-900/40 group-hover/app:scale-105 transition-transform">
                      <Gamepad2 className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">Arcade 120Hz</span>
                  </button>

                  {/* Camera */}
                  <button
                    id="app-icon-camera"
                    onClick={() => setCurrentApp('camera')}
                    className="flex flex-col items-center space-y-1.5 group/app focus:outline-none"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 shadow-lg group-hover/app:scale-105 transition-transform">
                      <Camera className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">Kamera</span>
                  </button>

                  {/* Settings */}
                  <button
                    id="app-icon-settings"
                    onClick={() => setCurrentApp('settings')}
                    className="flex flex-col items-center space-y-1.5 group/app focus:outline-none"
                  >
                    <div className="w-13 h-13 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-200 shadow-lg group-hover/app:scale-105 transition-transform">
                      <SettingsIcon className="w-7 h-7" />
                    </div>
                    <span className="text-[11px] text-white/90 font-medium">Pengaturan</span>
                  </button>
                </div>

                {/* Bottom Dock */}
                <div className="bg-white/10 backdrop-blur-lg border border-white/15 rounded-3xl p-3 flex justify-around items-center">
                  <div className="w-11 h-11 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow cursor-pointer">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow cursor-pointer" onClick={() => setCurrentApp('whatsapp')}>
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow cursor-pointer" onClick={() => setCurrentApp('music')}>
                    <Music className="w-6 h-6" />
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 shadow cursor-pointer" onClick={() => setCurrentApp('camera')}>
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
              </div>
            )}

            {/* APP 2: TIKTOK / SHORTS VIDEO FEED */}
            {currentApp === 'tiktok' && (
              <div className={`flex-1 relative flex flex-col justify-between p-4 bg-gradient-to-b ${videos[videoIndex].bg}`}>
                <div className="flex items-center justify-between text-white/80 z-10">
                  <button onClick={() => setCurrentApp('home')} className="p-1 hover:bg-white/10 rounded-full">
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="flex space-x-4 text-xs font-bold">
                    <span className="text-white/60">Mengikuti</span>
                    <span className="text-white border-b-2 border-white pb-0.5">Untuk Anda</span>
                  </div>
                  <div className="w-6" />
                </div>

                {/* Center Animation Visual */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div className="w-24 h-24 rounded-full border-4 border-cyan-400/30 border-t-cyan-400 animate-spin flex items-center justify-center">
                    <Play className="w-10 h-10 text-white fill-white/80 ml-1" />
                  </div>
                  <span className="text-xs text-white/70 mt-3 font-mono">Scroll Mouse / Swipe Atas untuk Video Berikutnya</span>
                </div>

                {/* Video Info and Controls */}
                <div className="z-10 flex items-end justify-between">
                  <div className="space-y-1 text-left max-w-[240px]">
                    <p className="text-xs font-bold text-white">{videos[videoIndex].author}</p>
                    <p className="text-xs text-white/90 leading-tight">{videos[videoIndex].title}</p>
                    <p className="text-[11px] text-cyan-300 font-medium">{videos[videoIndex].tag}</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-rose-500">
                        ❤️
                      </div>
                      <span className="text-[10px] text-white font-bold">{videos[videoIndex].likes}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white">
                        💬
                      </div>
                      <span className="text-[10px] text-white font-bold">1.2K</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APP 3: WHATSAPP CHAT */}
            {currentApp === 'whatsapp' && (
              <div className="flex-1 flex flex-col bg-slate-950">
                {/* Header */}
                <div className="bg-emerald-900/90 text-white px-3 py-2 flex items-center space-x-3 border-b border-emerald-800/60">
                  <button onClick={() => setCurrentApp('home')} className="p-1 hover:bg-emerald-800 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-8 h-8 rounded-full bg-cyan-700 flex items-center justify-center font-bold text-xs">
                    TC
                  </div>
                  <div className="flex-1 text-left">
                    <div className="text-xs font-bold">Teman Kantor</div>
                    <div className="text-[10px] text-emerald-200">Online via PC Keyboard</div>
                  </div>
                </div>

                {/* Messages List */}
                <div className="flex-1 p-3 overflow-y-auto space-y-2 flex flex-col">
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`max-w-[80%] rounded-xl px-3 py-1.5 text-xs ${
                        msg.sender === 'me'
                          ? 'ml-auto bg-emerald-700 text-white rounded-tr-none'
                          : 'mr-auto bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span className="text-[9px] opacity-70 block text-right mt-0.5">{msg.time}</span>
                    </div>
                  ))}
                </div>

                {/* Chat Input Box */}
                <div className="p-2 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
                  <input
                    id="input-whatsapp-msg"
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                    placeholder="Ketik teks lewat keyboard PC..."
                    className="flex-1 bg-slate-800 text-xs text-white px-3 py-2 rounded-full border border-slate-700 focus:outline-none focus:border-cyan-500"
                  />
                  <button
                    id="btn-send-whatsapp"
                    onClick={sendChatMessage}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* APP 4: ARCADE GAME 120HZ */}
            {currentApp === 'game' && (
              <div className="flex-1 relative bg-gradient-to-b from-indigo-950 via-slate-950 to-purple-950 flex flex-col justify-between p-4 overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <button onClick={() => setCurrentApp('home')} className="p-1 text-white bg-slate-800/80 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="bg-slate-900/90 border border-amber-500/40 px-3 py-1 rounded-full text-xs font-bold text-amber-300">
                    Skor: {gameScore}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono">120 FPS USB</div>
                </div>

                {/* Game Track Simulator */}
                <div className="relative flex-1 my-3 rounded-2xl border border-cyan-500/30 bg-slate-900/50 overflow-hidden flex items-end">
                  {/* Road Grid */}
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:16px_16px]" />

                  {/* Obstacles falling */}
                  <div className="absolute top-10 left-1/4 w-8 h-8 rounded-lg bg-rose-600 shadow-lg shadow-rose-900/60 animate-bounce flex items-center justify-center text-xs font-bold text-white">
                    ⚠️
                  </div>
                  <div className="absolute top-28 right-1/4 w-8 h-8 rounded-full bg-amber-500 shadow-lg shadow-amber-900/60 flex items-center justify-center text-xs font-bold text-white animate-pulse">
                    ⭐
                  </div>

                  {/* Controllable Player Ship (controlled by mouse swipe/drag) */}
                  <div
                    className="absolute bottom-6 w-12 h-12 -translate-x-1/2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-xl shadow-cyan-500/50 flex items-center justify-center text-white transition-all duration-75"
                    style={{ left: `${gamePlayerX}%` }}
                  >
                    <Gamepad2 className="w-7 h-7" />
                  </div>
                </div>

                <p className="text-[11px] text-center text-slate-400">
                  Gerakkan kursor mouse ke kiri/kanan untuk mengendalikan posisi pemain
                </p>
              </div>
            )}

            {/* APP 5: MUSIC PLAYER */}
            {currentApp === 'music' && (
              <div className="flex-1 p-5 flex flex-col justify-between bg-gradient-to-b from-purple-950 via-slate-950 to-slate-900 text-white">
                <div className="flex items-center justify-between">
                  <button onClick={() => setCurrentApp('home')} className="p-1 hover:bg-white/10 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs font-semibold text-purple-200">Audio USB Forwarding</span>
                  <div className="w-6" />
                </div>

                {/* Album Art & Visualizer */}
                <div className="flex flex-col items-center my-4">
                  <div className={`w-44 h-44 rounded-3xl bg-gradient-to-tr from-cyan-600 via-violet-600 to-rose-600 p-1 shadow-2xl ${isPlayingMusic ? 'shadow-cyan-500/30 ring-4 ring-cyan-400/20' : ''}`}>
                    <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center space-y-2">
                      <Music className={`w-16 h-16 text-cyan-400 ${isPlayingMusic ? 'animate-pulse' : ''}`} />
                      <span className="text-xs font-mono text-cyan-300">RAW PCM 48kHz</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-sm mt-4 text-white">Cyberpunk High-Speed Synth</h4>
                  <p className="text-xs text-slate-400">Low-Latency USB Audio Stream (8ms)</p>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center space-x-6">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <SkipForward className="w-5 h-5 rotate-180" />
                  </button>
                  <button
                    id="btn-toggle-music"
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className="w-14 h-14 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all"
                  >
                    {isPlayingMusic ? <Pause className="w-6 h-6 fill-slate-950" /> : <Play className="w-6 h-6 fill-slate-950 ml-0.5" />}
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <SkipForward className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* APP 6: SETTINGS */}
            {currentApp === 'settings' && (
              <div className="flex-1 bg-slate-950 text-white flex flex-col">
                <div className="px-4 py-3 border-b border-slate-800 flex items-center space-x-3">
                  <button onClick={() => setCurrentApp('home')} className="p-1 hover:bg-slate-800 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h3 className="text-sm font-bold">Opsi Pengembang & USB</h3>
                </div>

                <div className="p-4 space-y-3 overflow-y-auto text-xs text-left">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">USB Debugging</p>
                      <p className="text-[10px] text-slate-400">Diperlukan untuk kontrol mouse & audio</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold">AKTIF</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">USB Debugging (Security Settings)</p>
                      <p className="text-[10px] text-slate-400">Izin injeksi mouse & keyboard</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50 text-[10px] font-bold">DIIZINKAN</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-white">Audio Playback Capture</p>
                      <p className="text-[10px] text-slate-400">Forwarding audio internal tanpa kabel jack</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/50 text-[10px] font-bold">ANDROID 12+</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <p className="font-semibold text-white mb-1">Informasi Perangkat</p>
                    <div className="space-y-1 text-[11px] text-slate-400">
                      <div>Model: <span className="text-slate-200">{device.brand} {device.model}</span></div>
                      <div>Android: <span className="text-slate-200">v{device.androidVersion}</span></div>
                      <div>Resolusi: <span className="text-slate-200">{device.resolution.width} x {device.resolution.height}</span></div>
                      <div>Refresh Rate: <span className="text-cyan-400 font-bold">{device.refreshRate} Hz</span></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* APP 7: CAMERA PREVIEW */}
            {currentApp === 'camera' && (
              <div className="flex-1 bg-black flex flex-col justify-between p-4 relative overflow-hidden">
                <div className="flex justify-between items-center z-10">
                  <button onClick={() => setCurrentApp('home')} className="p-1 text-white bg-black/40 rounded-full">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-xs text-white/80 font-mono">1080p 60FPS</span>
                  <button 
                    onClick={() => setCameraFacing(c => c === 'back' ? 'front' : 'back')}
                    className="p-1.5 text-white bg-black/40 rounded-full hover:bg-white/20"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                </div>

                {/* Viewfinder Target */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-48 h-48 border border-white/30 rounded-2xl relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-cyan-400" />
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white" />
                    <div className="absolute bottom-2 left-2 w-3 h-2 border-b-2 border-l-2 border-white" />
                    <div className="absolute bottom-2 right-2 w-3 h-2 border-b-2 border-r-2 border-white" />
                  </div>
                </div>

                {/* Shutter Button */}
                <div className="flex items-center justify-around z-10 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800" />
                  <button
                    onClick={() => adbBridge.injectKeyEvent('KEYCODE_CAMERA')}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 active:scale-90 transition-transform"
                  >
                    <div className="w-full h-full rounded-full bg-white hover:bg-slate-200" />
                  </button>
                  <div className="w-8 h-8" />
                </div>
              </div>
            )}
          </div>

          {/* Mouse Touch Ripple Visualizers */}
          {ripples.map((ripple) => (
            <div
              key={ripple.id}
              className="absolute pointer-events-none rounded-full border border-cyan-400/80 bg-cyan-400/25 -translate-x-1/2 -translate-y-1/2 animate-ping"
              style={{
                left: `${ripple.x}px`,
                top: `${ripple.y}px`,
                width: ripple.type === 'tap' ? '32px' : '22px',
                height: ripple.type === 'tap' ? '32px' : '22px',
              }}
            />
          ))}

          {/* Optional Game Keymapping Overlay preview */}
          {showKeyMappings && (
            <div className="absolute inset-0 pointer-events-none z-30">
              {keyMappings.map((km) => (
                <div
                  key={km.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full border-2 border-cyan-400 bg-cyan-950/70 text-cyan-200 flex items-center justify-center font-bold text-xs shadow-lg shadow-cyan-950"
                  style={{
                    left: `${km.xPercent}%`,
                    top: `${km.yPercent}%`,
                  }}
                >
                  {km.key}
                </div>
              ))}
            </div>
          )}

          {/* Android Bottom Navigation Bar */}
          <div className="relative z-30 w-full h-11 bg-black/90 backdrop-blur-md flex items-center justify-around px-8 border-t border-white/5">
            {/* Back Button (Triangle / Arrow) */}
            <button
              id="btn-android-back"
              onClick={handleAndroidBack}
              title="Kembali (Klik Kanan Mouse)"
              className="p-2 text-white/70 hover:text-cyan-400 active:scale-90 transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Home Button (Circle) */}
            <button
              id="btn-android-home"
              onClick={handleAndroidHome}
              title="Home (Klik Tengah Mouse)"
              className="p-2 text-white/70 hover:text-cyan-400 active:scale-90 transition-all"
            >
              <Circle className="w-4 h-4" />
            </button>

            {/* Recent Apps Button (Square) */}
            <button
              id="btn-android-recents"
              onClick={handleAndroidRecents}
              title="Aplikasi Terbaru"
              className="p-2 text-white/70 hover:text-cyan-400 active:scale-90 transition-all"
            >
              <Square className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
