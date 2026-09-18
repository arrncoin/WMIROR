@echo off
title Android Mirror (GPU Direct3D 11 - Low Latency)
color 0b
cls

echo ====================================================================
echo   MEMULAI MIRRORING LAYAR ANDROID DENGAN GPU AKSELERASI & AUDIO
echo ====================================================================
echo.
echo [*] Memeriksa koneksi kabel USB ke HP Android...
echo [*] Mode Render: Direct3D 11 Hardware Video Acceleration
echo [*] Mode Audio : UAC2 / RAW PCM Buffer 10ms
echo [*] Mode Mouse : UHID Virtual Touch Controller
echo.
echo Kontrol Mouse:
echo   - Klik Kiri   : Ketuk / Swipe (Touch & Drag)
echo   - Klik Kanan  : Tombol Kembali (BACK)
echo   - Klik Tengah : Tombol Beranda (HOME)
echo   - Scroll Wheel: Gulir Halaman (Scroll Up/Down)
echo.
echo Menghubungkan scrcpy...
scrcpy.exe --render-driver=direct3d11 --video-decoder=auto --max-fps=60 -b 16M --audio-codec=raw --audio-buffer=10 --keyboard=uhid --mouse=uhid --stay-awake --window-title="Android Phone (GPU Direct3D 11)"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ====================================================================
    echo [!] PERINGATAN: Perangkat belum terdeteksi.
    echo.
    echo Pastikan:
    echo  1. Kabel USB HP sudah terhubung ke port PC Windows.
    echo  2. Opsi Pengembang (Developer Options) & USB Debugging aktif di HP.
    echo  3. Klik 'Selalu izinkan dari komputer ini' pada popup di layar HP.
    echo ====================================================================
    pause
)
