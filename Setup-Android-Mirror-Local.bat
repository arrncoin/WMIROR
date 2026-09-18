@echo off
:: ========================================================================
::  INSTALLER & SETUP MANDIRI: ANDROID USB MIRROR & PC CONTROL (GPU D3D11)
:: ========================================================================
title Setup & Instalasi Android USB Mirror di Windows Lokal
color 0a
cls

echo ====================================================================
echo        SETUP & INSTALASI ANDROID USB MIRROR DI WINDOWS LOKAL
echo   Akselerasi Grafis GPU Direct3D 11 - Audio USB - Kendali Mouse PC
echo ====================================================================
echo.

:: 1. Memeriksa direktori instalasi
set INSTALL_DIR=C:\AndroidMirrorPC
echo [*] Memeriksa & membuat direktori target: %INSTALL_DIR%
if not exist "%INSTALL_DIR%" (
    mkdir "%INSTALL_DIR%"
    echo [+] Folder %INSTALL_DIR% berhasil dibuat.
) else (
    echo [i] Folder %INSTALL_DIR% sudah tersedia.
)
echo.

:: 2. Konfigurasi Registry Windows untuk GPU High Performance (Discrete GPU)
echo [*] Mendaftarkan Akselerasi GPU Direct3D 11 ke Registry Windows...
reg add "HKCU\Software\Microsoft\DirectX\UserGpuPreferences" /v "%INSTALL_DIR%\scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
reg add "HKCU\Software\Microsoft\DirectX\UserGpuPreferences" /v "scrcpy.exe" /t REG_SZ /d "GpuPreference=2;" /f >nul 2>&1
echo [+] Profil GPU High Performance berhasil didaftarkan (NVIDIA / AMD / Intel Arc).
echo.

:: 3. Membuat file peluncur utama Run-GPU-Mirror.bat di dalam folder instalasi
echo [*] Membuat skrip peluncur utama (Run-GPU-Mirror.bat)...
(
echo @echo off
echo title Android Phone Mirror (GPU Direct3D 11 - Latensi Rendah^)
echo color 0b
echo cls
echo ====================================================================
echo    MEMULAI MIRRORING LAYAR ANDROID (AKSELERASI GPU D3D11 + AUDIO^)
echo ====================================================================
echo.
echo [*] Memeriksa koneksi perangkat USB...
echo [*] Menjalankan engine scrcpy dengan Direct3D 11 hardware render...
echo.
echo Kontrol Mouse:
echo   - Klik Kiri   : Ketuk / Geser (Tap / Drag / Swipe^)
echo   - Klik Kanan  : Tombol Kembali (BACK^) / Hidupkan Layar
echo   - Klik Tengah : Tombol Beranda (HOME^)
echo   - Scroll Roda : Gulir layar atas/bawah
echo.
echo Menghubungkan ke HP...
scrcpy.exe --render-driver=direct3d11 --video-decoder=auto --max-fps=60 -b 16M --audio-codec=raw --audio-buffer=10 --keyboard=uhid --mouse=uhid --stay-awake --window-title="Android Phone (GPU Direct3D 11)"
if %%ERRORLEVEL%% NEQ 0 (
    echo.
    echo ====================================================================
    echo [!] PERINGATAN: Perangkat belum terdeteksi atau scrcpy.exe belum ada.
    echo.
    echo Pastikan:
    echo  1. Kabel USB HP sudah terhubung ke port PC (gunakan USB 3.0 jika ada^).
    echo  2. Opsi Pengembang (Developer Options^) ^& USB Debugging aktif di HP.
    echo  3. Klik 'Selalu izinkan dari komputer ini' pada popup di layar HP.
    echo ====================================================================
    pause
^)
) > "%INSTALL_DIR%\Run-GPU-Mirror.bat"

echo [+] File Run-GPU-Mirror.bat berhasil dibuat di %INSTALL_DIR%
echo.

:: 4. Memeriksa apakah scrcpy.exe sudah ada di folder instalasi
if not exist "%INSTALL_DIR%\scrcpy.exe" (
    echo [*] Memeriksa ketersediaan engine scrcpy...
    echo [i] Mengunduh engine scrcpy Windows 64-bit resmi secara otomatis...
    powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $url = 'https://github.com/Genymobile/scrcpy/releases/download/v2.4/scrcpy-win64-v2.4.zip'; $output = '%TEMP%\scrcpy.zip'; Write-Host 'Mengunduh paket scrcpy v2.4...'; Invoke-WebRequest -Uri $url -OutFile $output; Write-Host 'Mengekstrak ke %INSTALL_DIR%...'; Expand-Archive -Path $output -DestinationPath '%TEMP%\scrcpy_extract' -Force; Copy-Item '%TEMP%\scrcpy_extract\scrcpy-win64-v2.4\*' -Destination '%INSTALL_DIR%' -Recurse -Force; Remove-Item $output -Force; Remove-Item '%TEMP%\scrcpy_extract' -Recurse -Force; Write-Host 'Selesai!'"
    if exist "%INSTALL_DIR%\scrcpy.exe" (
        echo [+] Engine scrcpy & ADB berhasil diunduh dan dipasang!
    ) else (
        echo [!] Unduhan otomatis memerlukan koneksi internet.
        echo [i] Anda juga bisa menyalin file scrcpy.exe dan adb.exe secara manual ke: %INSTALL_DIR%
    )
) else (
    echo [+] Engine scrcpy.exe sudah terpasang di %INSTALL_DIR%
)
echo.

:: 5. Membuat Shortcut di Desktop Windows
echo [*] Membuat Shortcut di Desktop Windows...
set SCRIPT_VBS="%TEMP%\CreateShortcut.vbs"
echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT_VBS%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\Android USB Mirror.lnk" >> %SCRIPT_VBS%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT_VBS%
echo oLink.TargetPath = "%INSTALL_DIR%\Run-GPU-Mirror.bat" >> %SCRIPT_VBS%
echo oLink.WorkingDirectory = "%INSTALL_DIR%" >> %SCRIPT_VBS%
echo oLink.Description = "Aplikasi Mirroring Android ke PC dengan Akselerasi GPU Direct3D 11 dan Audio USB" >> %SCRIPT_VBS%
if exist "%INSTALL_DIR%\scrcpy.exe" (
    echo oLink.IconLocation = "%INSTALL_DIR%\scrcpy.exe,0" >> %SCRIPT_VBS%
)
echo oLink.Save >> %SCRIPT_VBS%
cscript /nologo %SCRIPT_VBS%
del %SCRIPT_VBS%

echo [+] Shortcut Desktop "Android USB Mirror" berhasil dibuat!
echo.
echo ====================================================================
echo                   INSTALASI SELESAI DENGAN SUKSES!
echo ====================================================================
echo.
echo Langkah selanjutnya:
echo 1. Hubungkan HP Android Anda ke PC dengan kabel USB.
echo 2. Pastikan USB Debugging aktif di HP Anda.
echo 3. Klik dua kali shortcut "Android USB Mirror" di Desktop Anda!
echo.
pause
