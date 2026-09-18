========================================================================
 PANDUAN INSTALASI & MENJALANKAN DI WINDOWS LOKAL (OFFLINE)
========================================================================

Aplikasi ini menyediakan file instalasi mandiri untuk PC Windows:
1. Setup-Android-Mirror-Local.bat
   -> Skrip instalasi otomatis. Klik kanan dan pilih "Run as administrator".
   -> Otomatis membuat folder C:\AndroidMirrorPC, mengunduh engine scrcpy resmi,
      mengaktifkan GPU High-Performance di registry, dan membuat shortcut di Desktop.

2. Run-GPU-Mirror.bat
   -> Skrip sekali klik untuk langsung menjalankan mirroring dengan akselerasi GPU
      Direct3D 11, low-latency audio UAC2/PCM, dan kendali mouse UHID.

3. Force-HighPerformance-GPU.reg
   -> Registry tweak untuk memaksa Windows mengalokasikan GPU diskret (NVIDIA/AMD)
      saat scrcpy dijalankan.

KONTROL MOUSE PC:
- Klik Kiri   : Ketuk / Swipe (Tap / Drag)
- Klik Kanan  : Tombol BACK / Menghidupkan layar HP
- Klik Tengah : Tombol HOME
- Scroll Roda : Gulir layar ke atas atau ke bawah
- Ketik Teks  : Mengirim input keyboard langsung ke HP Android
