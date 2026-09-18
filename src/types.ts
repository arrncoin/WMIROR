export interface DeviceInfo {
  id: string;
  name: string;
  brand: string;
  model: string;
  androidVersion: string;
  buildNumber: string;
  resolution: {
    width: number;
    height: number;
  };
  refreshRate: number; // Hz (60, 90, 120)
  batteryLevel: number;
  isCharging: boolean;
  temperature: number; // Celsius
  usbType: 'USB 3.0 SuperSpeed' | 'USB 2.0 High-Speed';
  connectionStatus: 'connected' | 'connecting' | 'authorizing' | 'disconnected';
  ipAddress?: string;
  screenOffMode: boolean;
}

export interface MirrorConfig {
  resolutionPreset: 'native' | '1080p' | '720p' | '480p';
  customWidth: number;
  customHeight: number;
  maxFps: 30 | 60 | 90 | 120;
  videoBitrate: number; // Mbps
  videoCodec: 'h264' | 'h265' | 'av1';
  audioCodec: 'raw' | 'opus' | 'aac';
  audioBufferMs: number; // 5 - 50 ms
  audioEnabled: boolean;
  audioSource: 'playback_capture' | 'uac2' | 'mic_forward';
  stayAwake: boolean;
  turnScreenOff: boolean;
  orientation: 'portrait' | 'landscape';
  mouseSensitivity: number; // 0.5 to 2.0
  rightClickAction: 'back' | 'context' | 'power';
  middleClickAction: 'home' | 'switch' | 'none';
  invertScroll: boolean;
  showTouches: boolean;
}

export interface LatencyStats {
  fps: number;
  renderLatencyMs: number;
  audioLatencyMs: number;
  usbBandwidthMbps: number;
  droppedFrames: number;
  packetLoss: number;
}

export interface TouchRipple {
  id: number;
  x: number;
  y: number;
  type: 'tap' | 'drag' | 'release';
}

export interface KeyMappingItem {
  id: string;
  key: string;
  label: string;
  xPercent: number;
  yPercent: number;
  radius: number;
}

export type SimulatedAppType = 'home' | 'tiktok' | 'whatsapp' | 'game' | 'music' | 'settings' | 'camera';
