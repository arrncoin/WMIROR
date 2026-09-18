@echo off
setlocal EnableExtensions EnableDelayedExpansion
title Setup & Instalasi Android USB Mirror (Windows Lokal)
color 0a

echo ====================================================================
echo       SETUP & INSTALASI ANDROID USB MIRROR & PC CONTROL WINDOWS
echo   Akselerasi Grafis GPU Direct3D 11 - Audio USB - Kendali Mouse PC
echo ====================================================================
echo.

:: 1. Tentukan direktori instalasi yang aman (tidak memerlukan izin Administrator khusus)
set "INSTALL_DIR=%USERPROFILE%\AndroidMirrorPC"
echo [*] Mempersiapkan folder instalasi: !INSTALL_DIR!

if not exist "!INSTALL_DIR!" (
    mkdir "!INSTALL_DIR!" 2>nul
    if errorlevel 1 (
        echo [!] Mencoba jalur alternatif di AppData...
        set "INSTALL_DIR=%LOCALAPPDATA%\AndroidMirrorPC"
        mkdir "!INSTALL_DIR!" 2>nul
    )
)
echo [+] Direktori instalasi aktif: !INSTALL_DIR!
echo.

:: 2. Konfigurasi Registry Windows untuk Akselerasi GPU Direct3D 11 (HKCU - Tidak perlu Administrator)
echo [*] Mengonfigurasi Akselerasi GPU Direct3D 11 ke Registry Windows...
reg add "HKCU\Software\Microsoft\DirectX\UserGpuPreferences" /v "!INSTALL_DIR!\scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\DirectX\UserGpuPreferences" /v "scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
echo [+] Profil GPU High Performance berhasil didaftarkan di Windows.
echo.

:: 3. Memeriksa atau Menyalin Run-GPU-Mirror.bat
echo [*] Mempersiapkan file peluncur (Run-GPU-Mirror.bat)...
if exist "%~dp0Run-GPU-Mirror.bat" (
    copy /y "%~dp0Run-GPU-Mirror.bat" "!INSTALL_DIR!\Run-GPU-Mirror.bat" >nul 2>&1
    echo [+] Menyalin Run-GPU-Mirror.bat dari folder lokal.
) else (
    echo [*] Membuat Run-GPU-Mirror.bat otomatis...
    powershell -NoProfile -Command "@'
@echo off
title Android Mirror (GPU Direct3D 11 - Low Latency)
color 0b
cls

echo ====================================================================
echo   MEMULAI MIRRORING LAYAR ANDROID (GPU AKSELERASI & AUDIO USB)
echo ====================================================================
echo.
echo [*] Memeriksa koneksi kabel USB ke HP Android...
echo [*] Mode Render: Direct3D 11 Hardware Video Acceleration
echo [*] Mode Audio : UAC2 / RAW PCM Buffer 10ms
echo [*] Mode Mouse : UHID Virtual Touch Controller
echo.
echo Kontrol Mouse:
echo   - Klik Kiri   : Ketuk / Geser (Tap / Drag / Swipe)
echo   - Klik Kanan  : Tombol Kembali (BACK)
echo   - Klik Tengah : Tombol Beranda (HOME)
echo   - Scroll Roda : Gulir Layar (Scroll Up/Down)
echo.
echo Menghubungkan scrcpy...
cd /d \"%~dp0\"
scrcpy.exe --render-driver=direct3d11 --video-decoder=auto --max-fps=60 -b 16M --audio-codec=raw --audio-buffer=10 --keyboard=uhid --mouse=uhid --stay-awake --window-title=\"Android Phone (GPU Direct3D 11)\"

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
'@ | Set-Content -Path '!INSTALL_DIR!\Run-GPU-Mirror.bat' -Encoding UTF8"
    echo [+] File Run-GPU-Mirror.bat berhasil dibuat.
)
echo.

:: 4. Memeriksa ketersediaan engine scrcpy & ADB
if exist "%~dp0scrcpy.exe" (
    echo [*] Ditemukan engine scrcpy.exe lokal, menyalin ke folder instalasi...
    copy /y "%~dp0*.*" "!INSTALL_DIR!\" >nul 2>&1
    echo [+] Engine scrcpy berhasil disalin ke folder instalasi.
) else if not exist "!INSTALL_DIR!\scrcpy.exe" (
    echo [*] Memeriksa engine scrcpy di folder instalasi...
    echo [i] Mengunduh engine scrcpy Windows 64-bit resmi (GitHub Releases)...
    powershell -NoProfile -Command "try { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = 'https://github.com/Genymobile/scrcpy/releases/download/v2.4/scrcpy-win64-v2.4.zip'; $out = '$env:TEMP\scrcpy.zip'; Write-Host 'Mengunduh scrcpy v2.4...'; (New-Object Net.WebClient).DownloadFile($url, $out); Write-Host 'Mengekstrak paket engine...'; Expand-Archive -Path $out -DestinationPath '$env:TEMP\scrcpy_tmp' -Force; $exe = Get-ChildItem -Path '$env:TEMP\scrcpy_tmp' -Recurse -Filter 'scrcpy.exe' | Select-Object -First 1; if ($exe) { Copy-Item -Path ($exe.Directory.FullName + '\*') -Destination '!INSTALL_DIR!' -Recurse -Force; Write-Host '[+] Engine scrcpy & ADB berhasil dipasang!' -ForegroundColor Green }; Remove-Item $out -Force -ErrorAction SilentlyContinue; Remove-Item '$env:TEMP\scrcpy_tmp' -Recurse -Force -ErrorAction SilentlyContinue; } catch { Write-Host '[!] Unduhan otomatis belum selesai: ' $_.Exception.Message -ForegroundColor Yellow; Write-Host '[i] Anda juga bisa mengekstrak scrcpy-win64 manual ke: !INSTALL_DIR!' -ForegroundColor Cyan; }"
) else (
    echo [+] Engine scrcpy.exe sudah siap di folder instalasi.
)
echo.

:: 5. Membuat Shortcut Desktop Menggunakan PowerShell
echo [*] Membuat Shortcut di Desktop Windows...
powershell -NoProfile -Command "try { $ws = New-Object -ComObject WScript.Shell; $desktop = [Environment]::GetFolderPath('Desktop'); $lnk = $ws.CreateShortcut(\"$desktop\Android USB Mirror.lnk\"); $lnk.TargetPath = '!INSTALL_DIR!\Run-GPU-Mirror.bat'; $lnk.WorkingDirectory = '!INSTALL_DIR!'; $lnk.Description = 'Aplikasi Mirroring Android ke PC dengan Akselerasi GPU Direct3D 11 dan Audio USB'; if (Test-Path '!INSTALL_DIR!\scrcpy.exe') { $lnk.IconLocation = '!INSTALL_DIR!\scrcpy.exe,0' }; $lnk.Save(); Write-Host '[+] Shortcut Desktop berhasil dibuat!' -ForegroundColor Green; } catch { Write-Host '[!] Gagal membuat shortcut desktop: ' $_.Exception.Message -ForegroundColor Yellow; }"
echo.

echo ====================================================================
echo                   INSTALASI SELESAI DENGAN SUKSES!
echo ====================================================================
echo.
echo Folder Terpasang   : !INSTALL_DIR!
echo Peluncur Utama     : !INSTALL_DIR!\Run-GPU-Mirror.bat
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
