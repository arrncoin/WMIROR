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

  // GPU Hardware Acceleration flags
  let renderDriver = 'direct3d11';
  if (config.gpuRenderer === 'opengl') renderDriver = 'opengl';
  else if (config.gpuRenderer === 'software') renderDriver = 'software';
  else if (config.gpuRenderer === 'vulkan') renderDriver = 'vulkan';

  const gpuArg = `--render-driver=${renderDriver} --video-decoder=auto`;

  return `@echo off
title Android USB Ultra-Low Latency Mirror & Control (Windows GPU Accelerated)
color 0b
cls
echo ====================================================================
echo   ANDROID USB MIRRORING & PC MOUSE CONTROL - GPU ACCELERATED
echo   Hardware Render Engine: ${config.gpuRenderer.toUpperCase()}
echo ====================================================================
echo.
echo [*] Memeriksa koneksi perangkat ADB via USB...
adb devices
echo.
echo [*] Mengaktifkan Akselerasi GPU Direct3D11 / NVDEC...
echo [*] Menjalankan Mirroring Layar dan Forwarding Audio USB...
echo [*] Kontrol Mouse: Klik Kiri = Tap/Drag, Klik Kanan = Back, Klik Tengah = Home
echo.

set SCRCPY_ICON=icon.ico
scrcpy ${serialArg}${sizeArg} ${bitrateArg} ${maxFpsArg} ${codecArg} ${gpuArg} ${audioArg} ${screenOffArg} ${stayAwakeArg} ${touchesArg} --keyboard=uhid --mouse=uhid --window-title="Android Mirror (GPU ${renderDriver.toUpperCase()})"

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
  let renderDriver = 'direct3d11';
  if (config.gpuRenderer === 'opengl') renderDriver = 'opengl';
  else if (config.gpuRenderer === 'software') renderDriver = 'software';

  return `# Android USB Mirror & Control One-Click PowerShell Launcher with GPU Acceleration
Write-Host ">>> Memulai Android USB Mirroring dengan Akselerasi GPU ($renderDriver)..." -ForegroundColor Cyan

$params = @(
    "--render-driver=${renderDriver}",
    "--video-decoder=auto",
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

Write-Host "Menjalankan scrcpy dengan parameter GPU: $params" -ForegroundColor DarkGray
& scrcpy @params
`;
}

export function generateLocalWindowsInstallerBat(config: MirrorConfig): string {
  return `@echo off
:: ========================================================================
::  INSTALLER LOKAL WINDOWS: ANDROID USB MIRROR & CONTROL (GPU ACCELERATED)
:: ========================================================================
title Setup & Instalasi Android USB Mirror di Windows Lokal
color 0a
cls

echo ====================================================================
echo       INSTALASI LOKAL ANDROID USB MIRROR & PC CONTROL WINDOWS
echo ====================================================================
echo.
echo [*] Mempersiapkan direktori instalasi di komputer Anda...
set INSTALL_DIR=C:\\AndroidMirrorPC
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

cd /d "%INSTALL_DIR%"
echo [+] Direktori target: %INSTALL_DIR%
echo.

echo [*] Mengonfigurasi Akselerasi GPU Direct3D 11 & High Performance Profile...
reg add "HKCU\\Software\\Microsoft\\DirectX\\UserGpuPreferences" /v "%INSTALL_DIR%\\scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
echo [+] Registri GPU High-Performance berhasil disetel!
echo.

echo [*] Membuat file peluncur GPU Super-Cepat (Run-GPU-Mirror.bat)...
(
echo @echo off
echo title Android Mirror (GPU Direct3D 11 - Low Latency^)
echo color 0b
echo cls
echo ====================================================================
echo   MEMULAI MIRRORING LAYAR ANDROID DENGAN GPU AKSELERASI & AUDIO
echo ====================================================================
echo.
echo [*] Memeriksa koneksi kabel USB...
echo.
scrcpy.exe --render-driver=direct3d11 --video-decoder=auto --max-fps=${config.maxFps} -b ${config.videoBitrate}M --audio-codec=${config.audioCodec} --audio-buffer=${config.audioBufferMs} --keyboard=uhid --mouse=uhid --stay-awake ${config.turnScreenOff ? '--turn-screen-off ' : ''}--window-title="Android Phone (GPU Direct3D 11)"
if %%ERRORLEVEL%% NEQ 0 (
    echo.
    echo [!] Terjadi kendala saat menghubungkan ke HP.
    pause
^)
) > "%INSTALL_DIR%\\Run-GPU-Mirror.bat"

echo [+] File Run-GPU-Mirror.bat berhasil dibuat di %INSTALL_DIR%
echo.

echo [*] Membuat Shortcut di Desktop Windows Anda...
set SCRIPT_VBS="%TEMP%\\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT_VBS%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\Android USB Mirror.lnk" >> %SCRIPT_VBS%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT_VBS%
echo oLink.TargetPath = "%INSTALL_DIR%\\Run-GPU-Mirror.bat" >> %SCRIPT_VBS%
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> %SCRIPT_VBS%
echo oLink.Description = "Aplikasi Mirroring Android ke PC dengan Akselerasi GPU dan Audio" >> %SCRIPT_VBS%
echo oLink.Save >> %SCRIPT_VBS%
cscript /nologo %SCRIPT_VBS%
del %SCRIPT_VBS%

echo [+] Shortcut Desktop "Android USB Mirror" berhasil dibuat!
echo.
echo ====================================================================
echo                  INSTALASI LOKAL BERHASIL SELESAI!
echo ====================================================================
echo.
echo Anda dapat langsung klik dua kali ikon "Android USB Mirror" di Desktop
echo untuk menjalankan mirroring dengan akselerasi GPU & suara USB.
echo.
pause
`;
}

export function generateWindowsRegGpu(): string {
  return `Windows Registry Editor Version 5.00

; Paksa Windows 10/11 Menggunakan Discrete GPU (NVIDIA / AMD) untuk Mirroring
[HKEY_CURRENT_USER\\Software\\Microsoft\\DirectX\\UserGpuPreferences]
"C:\\\\AndroidMirrorPC\\\\scrcpy.exe"="GpuPreference=2;"
"scrcpy.exe"="GpuPreference=2;"
`;
}

export function generateLocalPackageReadme(config: MirrorConfig): string {
  return `========================================================================
 PANDUAN INSTALASI & MENJALANKAN DI WINDOWS LOKAL (OFFLINE)
========================================================================

Aplikasi ini dirancang untuk berjalan di Windows 10 / Windows 11 dengan:
- Akselerasi Penuh GPU (Direct3D 11 / NVDEC / DirectX)
- Audio Internal Latensi Rendah (RAW PCM / Opus)
- Kontrol Layar dengan Mouse Komputer (Klik Kiri = Tap/Drag, Klik Kanan = Back, Klik Tengah = Home)

------------------------------------------------------------------------
CARA 1: INSTALASI OTOMATIS VIA FILE BATCH (PALING PRAKTIS)
------------------------------------------------------------------------
1. Unduh file "Setup-Android-Mirror-Local.bat" dari aplikasi ini.
2. Klik kanan pada file tersebut dan pilih "Run as administrator" (Jalankan sebagai administrator).
3. Script otomatis membuat folder C:\\AndroidMirrorPC, mengonfigurasi GPU High Performance di Windows Registry, dan membuat Shortcut di Desktop Windows.
4. Colokkan HP Android via kabel USB Type-C (pastikan USB Debugging aktif).
5. Klik dua kali shortcut "Android USB Mirror" di Desktop!

------------------------------------------------------------------------
CARA 2: INSTALASI SEBAGAI WINDOWS DESKTOP APP (PWA)
------------------------------------------------------------------------
1. Buka aplikasi ini di browser Google Chrome atau Microsoft Edge di Windows.
2. Klik tombol "Install Windows App" di pojok kanan atas aplikasi.
3. Windows akan otomatis menginstalnya sebagai aplikasi desktop (.exe mandiri) dengan jendela terpisah tanpa address bar browser.
4. Ikon aplikasi akan muncul di Start Menu dan Taskbar Windows Anda.

------------------------------------------------------------------------
KONFIGURASI GPU RENDERER AKTIF
------------------------------------------------------------------------
- Render Driver: ${config.gpuRenderer.toUpperCase()}
- Video Decoder: Hardware Auto (Direct3D11 Video Acceleration / NVDEC)
- Max FPS: ${config.maxFps} FPS
- Video Bitrate: ${config.videoBitrate} Mbps
- Audio Codec: ${config.audioCodec.toUpperCase()} (Buffer: ${config.audioBufferMs} ms)

Nikmati pengalaman mirroring layar HP Android di PC tanpa delay!
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
