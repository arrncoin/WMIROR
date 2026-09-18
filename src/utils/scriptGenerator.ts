import { MirrorConfig } from '../types';

export function generateScrcpyBat(config: MirrorConfig, deviceSerial?: string): string {
  const serialArg = deviceSerial ? `-s ${deviceSerial} ` : '';
  const maxFpsArg = `--max-fps=${config.maxFps}`;
  const bitrateArg = `-b ${config.videoBitrate}M`;
  const codecArg = `--video-codec=${config.videoCodec}`;
  
  let sizeArg = '';
  if (config.resolutionPreset === '1080p') sizeArg = '-m 1920';
  else if (config.resolutionPreset === '720p') sizeArg = '-m 1280';
  else if (config.resolutionPreset === '480p') sizeArg = '-m 854';

  const audioArg = config.audioEnabled
    ? `--audio-codec=${config.audioCodec} --audio-buffer=${config.audioBufferMs}`
    : '--no-audio';

  const screenOffArg = config.turnScreenOff ? '--turn-screen-off' : '';
  const stayAwakeArg = config.stayAwake ? '--stay-awake' : '';
  const touchesArg = config.showTouches ? '--show-touches' : '';

  return `@echo off
title Android USB Ultra-Low Latency Mirror & Control (Windows)
color 0b
cls
echo ====================================================================
echo      ANDROID USB MIRRORING & PC MOUSE CONTROL - LOW LATENCY
echo ====================================================================
echo.
echo [*] Memeriksa koneksi perangkat ADB via USB...
adb devices
echo.
echo [*] Menjalankan Mirroring Layar dan Forwarding Audio USB...
echo [*] Kontrol Mouse: Klik Kiri = Tap/Drag, Klik Kanan = Back, Klik Tengah = Home
echo.

scrcpy ${serialArg}${sizeArg} ${bitrateArg} ${maxFpsArg} ${codecArg} ${audioArg} ${screenOffArg} ${stayAwakeArg} ${touchesArg} --keyboard=uhid --mouse=uhid --window-title="Android Phone (USB Low-Latency)"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Terjadi kesalahan saat menghubungkan ke HP.
    echo [!] Pastikan:
    echo     1. USB Debugging sudah aktif di HP Android.
    echo     2. Kabel USB mendukung transfer data (bukan hanya cas).
    echo     3. Izinkan popup otorisasi di layar HP Anda.
    pause
)
`;
}

export function generatePowerShellScript(config: MirrorConfig): string {
  return `# Android USB Mirror & Control One-Click PowerShell Launcher
Write-Host ">>> Memulai Android USB Mirroring dengan Low Latency Audio..." -ForegroundColor Cyan

$params = @(
    "--max-fps=${config.maxFps}",
    "--video-bit-rate=${config.videoBitrate}M",
    "--audio-codec=${config.audioCodec}",
    "--audio-buffer=${config.audioBufferMs}",
    "--keyboard=uhid",
    "--mouse=uhid",
    "--stay-awake"
)

if ("${config.turnScreenOff}" -eq "true") {
    $params += "--turn-screen-off"
}

Write-Host "Menjalankan scrcpy dengan parameter: $params" -ForegroundColor DarkGray
& scrcpy @params
`;
}

export function downloadFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
