import React, { useState } from 'react';
import { 
  X, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle, 
  Usb, 
  Smartphone, 
  MousePointer, 
  Volume2, 
  ShieldAlert, 
  ExternalLink 
} from 'lucide-react';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [activeStep, setActiveStep] = useState(1);

  if (!isOpen) return null;

  const steps = [
    {
      step: 1,
      title: 'Aktifkan Opsi Pengembang di HP Android',
      desc: 'Buka Pengaturan HP > Tentang Ponsel (About Phone). Cari menu "Nomor Bentukan" (Build Number), lalu ketuk (tap) sebanyak 7 kali berturut-turut hingga muncul notifikasi "Anda sekarang adalah seorang pengembang!"',
      icon: Smartphone,
      tips: 'Pada HP Xiaomi/MIUI, ketuk pada "Versi MIUI / HyperOS". Pada Samsung, buka "Informasi Perangkat Lunak" > "Nomor Versi".',
    },
    {
      step: 2,
      title: 'Aktifkan USB Debugging & Kontrol Input Mouse',
      desc: 'Buka menu Opsi Pengembang (Developer Options) di Pengaturan Tambahan atau Sistem. Nyalakan toggle "USB Debugging".',
      icon: MousePointer,
      tips: 'PENTING (Khusus Xiaomi/POCO/Realme): Wajib nyalakan toggle "USB Debugging (Security Settings)" agar kursor mouse PC diizinkan mengklik dan menggeser layar HP!',
    },
    {
      step: 3,
      title: 'Colok Kabel USB ke Port USB 3.0 PC',
      desc: 'Gunakan kabel USB Type-C berkualitas (kabel bawaan HP yang mendukung transfer data). Colokkan ke port USB 3.0/3.2 berwarna biru di PC atau Laptop Windows Anda.',
      icon: Usb,
      tips: 'Hindari memakai kabel cas murahan 2-pin yang hanya bisa mengisi baterai tanpa transfer data.',
    },
    {
      step: 4,
      title: 'Izinkan Otorisasi USB Debugging di Layar HP',
      desc: 'Layar HP Anda akan memunculkan jendela dialog "Izinkan USB debugging dari komputer ini?". Centang kotak "Selalu izinkan dari komputer ini", lalu ketuk tombol "Izinkan" / "OK".',
      icon: CheckCircle2,
      tips: 'Jika pop-up tidak muncul, cabut lalu colok kembali kabel USB, atau ganti mode USB di bar notifikasi HP ke "Transfer File (MTP)".',
    },
    {
      step: 5,
      title: 'Forwarding Audio Latensi Rendah (Android 11+ / 12+)',
      desc: 'Mulai Android 11 dan 12, sistem Android mendukung streaming audio internal secara native via kabel USB tanpa kabel aux tambahan. Suara game, YouTube, dan musik akan langsung keluar jernih lewat speaker/headset PC.',
      icon: Volume2,
      tips: 'Pilih codec "RAW PCM" dan buffer 10ms pada menu Audio untuk latensi 0 delay saat bermain game.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-800/50 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Panduan Lengkap Setup USB Mirroring</h2>
              <p className="text-xs text-slate-400">Langkah demi langkah menghubungkan HP Android ke PC Windows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Navigation */}
        <div className="flex items-center justify-between px-6 pt-5 pb-2">
          {steps.map((s) => (
            <button
              key={s.step}
              onClick={() => setActiveStep(s.step)}
              className={`flex flex-col items-center space-y-1 transition-all ${
                activeStep === s.step ? 'scale-105' : 'opacity-60 hover:opacity-100'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                  activeStep === s.step
                    ? 'bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/40'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {s.step}
              </div>
              <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                Langkah {s.step}
              </span>
            </button>
          ))}
        </div>

        {/* Step Card Content */}
        <div className="p-6">
          {steps
            .filter((s) => s.step === activeStep)
            .map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.step} className="space-y-4 bg-slate-950/60 p-5 rounded-2xl border border-slate-800/80">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
                        Langkah {s.step} dari {steps.length}
                      </span>
                      <h3 className="text-sm font-bold text-white">{s.title}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{s.desc}</p>

                  <div className="bg-amber-950/30 border border-amber-800/40 rounded-xl p-3 flex items-start space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-200/90 leading-tight">{s.tips}</p>
                  </div>
                </div>
              );
            })}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-5">
            <button
              onClick={() => setActiveStep((prev) => Math.max(1, prev - 1))}
              disabled={activeStep === 1}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Sebelumnya
            </button>

            {activeStep < steps.length ? (
              <button
                onClick={() => setActiveStep((prev) => Math.min(steps.length, prev + 1))}
                className="px-5 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-500 shadow-md shadow-cyan-950 transition-all"
              >
                Langkah Selanjutnya
              </button>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500 shadow-md shadow-emerald-950 transition-all"
              >
                Selesai & Mulai Mirroring
              </button>
            )}
          </div>
        </div>

        {/* Troubleshooting Accordion */}
        <div className="p-5 bg-slate-950/90 border-t border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold text-slate-300">Pertanyaan Umum & Solusi Masalah:</h4>
          <div className="space-y-1.5 text-[11px] text-slate-400">
            <p>
              • <strong className="text-slate-200">Kursor mouse tidak bisa mengklik HP?</strong> Pastikan mengaktifkan "USB Debugging (Security Settings)" di Opsi Pengembang pada HP Xiaomi/POCO.
            </p>
            <p>
              • <strong className="text-slate-200">Suara tidak keluar di PC?</strong> Audio forwarding otomatis aktif di Android 11+. Pastikan HP tidak dalam mode "Jangan Ganggu" atau volume media di nolkan.
            </p>
            <p>
              • <strong className="text-slate-200">HP tidak terdeteksi via USB?</strong> Ganti kabel USB dan colokkan ke port USB di bagian belakang PC (langsung ke motherboard).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
