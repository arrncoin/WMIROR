import React from 'react';
import { X, Gamepad2, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { KeyMappingItem } from '../types';

interface KeymappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  keyMappings: KeyMappingItem[];
  onChangeKeyMappings: (mappings: KeyMappingItem[]) => void;
  showOverlay: boolean;
  onToggleShowOverlay: () => void;
}

export const KeymappingModal: React.FC<KeymappingModalProps> = ({
  isOpen,
  onClose,
  keyMappings,
  onChangeKeyMappings,
  showOverlay,
  onToggleShowOverlay,
}) => {
  if (!isOpen) return null;

  const handleAddKey = () => {
    const newKey: KeyMappingItem = {
      id: 'km-' + Date.now(),
      key: 'SPACE',
      label: 'Lompat / Aksi',
      xPercent: 50,
      yPercent: 75,
      radius: 24,
    };
    onChangeKeyMappings([...keyMappings, newKey]);
  };

  const handleRemoveKey = (id: string) => {
    onChangeKeyMappings(keyMappings.filter((k) => k.id !== id));
  };

  const handleUpdateKey = (id: string, updates: Partial<KeyMappingItem>) => {
    onChangeKeyMappings(
      keyMappings.map((k) => (k.id === id ? { ...k, ...updates } : k))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-950 border border-amber-800/50 flex items-center justify-center text-amber-400">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Mapping Keyboard & Mouse Game</h2>
              <p className="text-xs text-slate-400">Kontrol Game Mobile di PC dengan Tombol Keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-xs">
          <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
            <div>
              <p className="font-bold text-white">Overlay Tombol di Layar HP</p>
              <p className="text-[11px] text-slate-400">Tampilkan posisi tombol di atas layar mirroring</p>
            </div>
            <button
              onClick={onToggleShowOverlay}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                showOverlay
                  ? 'bg-amber-950 text-amber-300 border-amber-600'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {showOverlay ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              <span>{showOverlay ? 'Tampil' : 'Sembunyi'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-300">Daftar Tombol Terpetakan:</span>
              <button
                onClick={handleAddKey}
                className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/50 flex items-center space-x-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Tombol</span>
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {keyMappings.map((km) => (
                <div
                  key={km.id}
                  className="bg-slate-950/80 border border-slate-800/80 p-3 rounded-xl flex items-center space-x-3 justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      maxLength={5}
                      value={km.key}
                      onChange={(e) => handleUpdateKey(km.id, { key: e.target.value.toUpperCase() })}
                      className="w-14 bg-slate-800 border border-slate-700 rounded-lg py-1 text-center font-bold text-cyan-400 uppercase font-mono focus:border-cyan-500 focus:outline-none"
                    />
                    <div>
                      <input
                        type="text"
                        value={km.label}
                        onChange={(e) => handleUpdateKey(km.id, { label: e.target.value })}
                        placeholder="Label aksi"
                        className="bg-transparent text-white font-medium text-xs focus:outline-none"
                      />
                      <p className="text-[10px] text-slate-500 font-mono">
                        Posisi: ({km.xPercent}%, {km.yPercent}%)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRemoveKey(km.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-amber-950 hover:brightness-110 active:scale-95 transition-all"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
