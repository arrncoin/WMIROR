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
  const flags = [
    `--render-driver=${config.gpuRenderer}`,
    `--video-decoder=auto`,
    `--max-fps=${config.maxFps}`,
    `-b ${config.videoBitrate}M`,
    `--audio-codec=${config.audioCodec}`,
    `--audio-buffer=${config.audioBufferMs}`,
    `--keyboard=uhid`,
    `--mouse=uhid`,
    `--stay-awake`,
    config.turnScreenOff ? `--turn-screen-off` : '',
    `--window-title=\\"Android Phone (GPU ${config.gpuRenderer.toUpperCase()})\\"`
  ].filter(Boolean).join(' ');

  return `@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Setup & Instalasi Android USB Mirror (Windows Lokal)
color 0a

echo ====================================================================
echo       SETUP & INSTALASI ANDROID USB MIRROR & PC CONTROL WINDOWS
echo   Akselerasi Grafis GPU Direct3D 11 - Audio USB - Kendali Mouse PC
echo ====================================================================
echo.

:: 1. Tentukan direktori instalasi yang aman (tidak memerlukan izin Administrator khusus)
set "INSTALL_DIR=%USERPROFILE%\\AndroidMirrorPC"
echo [*] Mempersiapkan folder instalasi: !INSTALL_DIR!

if not exist "!INSTALL_DIR!" (
    mkdir "!INSTALL_DIR!" 2>nul
    if errorlevel 1 (
        echo [!] Mencoba jalur alternatif di AppData...
        set "INSTALL_DIR=%LOCALAPPDATA%\\AndroidMirrorPC"
        mkdir "!INSTALL_DIR!" 2>nul
    )
)
echo [+] Direktori instalasi aktif: !INSTALL_DIR!
echo.

:: 2. Konfigurasi Registry Windows untuk Akselerasi GPU (HKCU - Tidak perlu Administrator)
echo [*] Mengonfigurasi Akselerasi GPU ke Registry Windows...
reg add "HKCU\\Software\\Microsoft\\DirectX\\UserGpuPreferences" /v "!INSTALL_DIR!\\scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
reg add "HKCU\\Software\\Microsoft\\DirectX\\UserGpuPreferences" /v "scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
echo [+] Profil GPU High Performance berhasil didaftarkan di Windows.
echo.

:: 3. Mempersiapkan Run-GPU-Mirror.bat
echo [*] Membuat file peluncur utama (Run-GPU-Mirror.bat)...
if exist "%~dp0Run-GPU-Mirror.bat" (
    copy /y "%~dp0Run-GPU-Mirror.bat" "!INSTALL_DIR!\\Run-GPU-Mirror.bat" >nul 2>&1
    echo [+] Menyalin Run-GPU-Mirror.bat dari folder lokal.
) else (
    powershell -NoProfile -Command "@'
@echo off
title Android Mirror (GPU ${config.gpuRenderer.toUpperCase()} - Low Latency)
color 0b
cls

echo ====================================================================
echo   MEMULAI MIRRORING LAYAR ANDROID (GPU AKSELERASI & AUDIO USB)
echo ====================================================================
echo.
echo [*] Memeriksa koneksi kabel USB ke HP Android...
echo [*] Mode Render: ${config.gpuRenderer.toUpperCase()} Hardware Video Acceleration
echo [*] Mode Audio : UAC2 / RAW PCM Buffer ${config.audioBufferMs}ms
echo [*] Mode Mouse : UHID Virtual Touch Controller
echo.
echo Kontrol Mouse:
echo   - Klik Kiri   : Ketuk / Geser (Tap / Drag / Swipe)
echo   - Klik Kanan  : Tombol Kembali (BACK)
echo   - Klik Tengah : Tombol Beranda (HOME)
echo   - Scroll Roda : Gulir Layar (Scroll Up/Down)
echo.
echo Menghubungkan scrcpy...
cd /d \\"%~dp0\\"
scrcpy.exe ${flags}

if %%ERRORLEVEL%% NEQ 0 (
    echo.
    echo ====================================================================
    echo [!] PERINGATAN: Perangkat belum terdeteksi atau scrcpy.exe belum ada.
    echo.
    echo Pastikan:
    echo  1. Kabel USB HP sudah terhubung ke port PC Windows.
    echo  2. Opsi Pengembang (Developer Options) & USB Debugging aktif di HP.
    echo  3. Klik 'Selalu izinkan dari komputer ini' pada notifikasi di layar HP.
    echo ====================================================================
    pause
)
'@ | Set-Content -Path '!INSTALL_DIR!\\Run-GPU-Mirror.bat' -Encoding UTF8"
    echo [+] File Run-GPU-Mirror.bat berhasil dibuat.
)
echo.

:: 4. Memeriksa ketersediaan engine scrcpy & ADB
if exist "%~dp0scrcpy.exe" (
    echo [*] Ditemukan engine scrcpy.exe lokal, menyalin ke folder instalasi...
    copy /y "%~dp0*.*" "!INSTALL_DIR!\\" >nul 2>&1
    echo [+] Engine scrcpy berhasil disalin ke folder instalasi.
) else if not exist "!INSTALL_DIR!\\scrcpy.exe" (
    echo [*] Memeriksa engine scrcpy di folder instalasi...
    echo [i] Mengunduh engine scrcpy Windows 64-bit resmi (GitHub Releases)...
    powershell -NoProfile -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = 'https://github.com/Genymobile/scrcpy/releases/download/v2.4/scrcpy-win64-v2.4.zip'; $out = '$env:TEMP\\scrcpy.zip'; Write-Host 'Mengunduh scrcpy v2.4...'; (New-Object Net.WebClient).DownloadFile($url, $out); Write-Host 'Mengekstrak paket engine...'; Expand-Archive -Path $out -DestinationPath '$env:TEMP\\scrcpy_tmp' -Force; $exe = Get-ChildItem -Path '$env:TEMP\\scrcpy_tmp' -Recurse -Filter 'scrcpy.exe' | Select-Object -First 1; if ($exe) { Copy-Item -Path ($exe.Directory.FullName + '\\*') -Destination '!INSTALL_DIR!' -Recurse -Force; Write-Host '[+] Engine scrcpy & ADB berhasil dipasang!' -ForegroundColor Green }; Remove-Item $out -Force -ErrorAction SilentlyContinue; Remove-Item '$env:TEMP\\scrcpy_tmp' -Recurse -Force -ErrorAction SilentlyContinue; } catch { Write-Host '[!] Unduhan otomatis belum selesai: ' $_.Exception.Message -ForegroundColor Yellow; Write-Host '[i] Anda juga bisa mengekstrak scrcpy-win64 manual ke: !INSTALL_DIR!' -ForegroundColor Cyan; }"
) else (
    echo [+] Engine scrcpy.exe sudah siap di folder instalasi.
)
echo.

:: 5. Membuat Shortcut Desktop Menggunakan PowerShell
echo [*] Membuat Shortcut di Desktop Windows...
powershell -NoProfile -Command "try { $ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $lnk = $ws.CreateShortcut(\\"$desktop\\Android USB Mirror.lnk\\"); $lnk.TargetPath = '!INSTALL_DIR!\\Run-GPU-Mirror.bat'; $lnk.WorkingDirectory = '!INSTALL_DIR!'; $lnk.Description = 'Aplikasi Mirroring Android ke PC dengan Akselerasi GPU Direct3D 11 dan Audio USB'; if (Test-Path '!INSTALL_DIR!\\scrcpy.exe') { $lnk.IconLocation = '!INSTALL_DIR!\\scrcpy.exe,0' }; $lnk.Save(); Write-Host '[+] Shortcut Desktop berhasil dibuat!' -ForegroundColor Green; } catch { Write-Host '[!] Gagal membuat shortcut desktop: ' $_.Exception.Message -ForegroundColor Yellow; }"
echo.

echo ====================================================================
echo                   INSTALASI SELESAI DENGAN SUKSES!
echo ====================================================================
echo.
echo Folder Terpasang   : !INSTALL_DIR!
echo Peluncur Utama     : !INSTALL_DIR!\\Run-GPU-Mirror.bat
echo Pintasan Desktop   : Android USB Mirror.lnk
echo.
echo Langkah Selanjutnya:
echo  1. Hubungkan HP Android ke PC menggunakan kabel USB.
echo  2. Pastikan Opsi Pengembang (Developer Options) & USB Debugging AKTIF di HP.
echo  3. Klik dua kali shortcut 'Android USB Mirror' di Desktop Windows Anda!
echo.
echo ====================================================================
echo Tekan tombol apa saja untuk menutup jendela ini...
pause >nul
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
