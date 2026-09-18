import React, { useState } from 'react';
import { 
  Usb, 
  Smartphone, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Terminal 
} from 'lucide-react';
import { DeviceInfo } from '../types';
import { requestAndroidUsbDevice } from '../utils/webUsbAdb';

interface UsbConnectionHeaderProps {
  device: DeviceInfo;
  onDeviceConnected: (device: Partial<DeviceInfo>) => void;
  logs: string[];
}

export const UsbConnectionHeader: React.FC<UsbConnectionHeaderProps> = ({
  device,
  onDeviceConnected,
  logs,
}) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showLogDrawer, setShowLogDrawer] = useState(false);

  const handleConnectUsb = async () => {
    setIsConnecting(true);
    try {
      const usbDev = await requestAndroidUsbDevice();
      if (usbDev) {
        onDeviceConnected({
          name: `${usbDev.manufacturerName || 'Android'} ${usbDev.productName || 'Device'}`,
          brand: usbDev.manufacturerName || 'Android',
          model: usbDev.productName || 'ADB Device',
          connectionStatus: 'connected',
          usbType: 'USB 3.0 SuperSpeed',
        });
      }
    } catch (err: unknown) {
      console.warn('USB Pairing canceled or not supported:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <header className="w-full bg-slate-900/90 border-b border-slate-800/80 backdrop-blur-lg sticky top-0 z-40 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & App Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-400/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                Android USB Mirror <span className="text-cyan-400 font-mono text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800/50">v2.4 Windows</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Mirroring Layar HP ke PC • Audio Internal Latensi Rendah • Kontrol Penuh Mouse & Keyboard
            </p>
          </div>
        </div>

        {/* Device Status & Connect Button */}
        <div className="flex items-center space-x-2.5 flex-wrap">
          {/* Status Capsule */}
          <div className="flex items-center space-x-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
            <div className="relative flex items-center justify-center">
              <span className={`w-2.5 h-2.5 rounded-full ${device.connectionStatus === 'connected' ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
              <span className={`absolute w-2 h-2 rounded-full ${device.connectionStatus === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            </div>

            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 leading-none">
                {device.connectionStatus === 'connected' ? 'Terhubung via USB' : 'Mode Simulasi / Siap'}
              </span>
              <span className="font-bold text-slate-200 leading-tight truncate max-w-[140px]">
                {device.brand} {device.model}
              </span>
            </div>

            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
              {device.usbType.includes('3.0') ? 'USB 3.0' : 'USB 2.0'}
            </span>
          </div>

          {/* WebUSB Pair Device Button */}
          <button
            id="btn-connect-webusb"
            onClick={handleConnectUsb}
            disabled={isConnecting}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:brightness-110 text-white font-semibold text-xs shadow-lg shadow-cyan-950 active:scale-95 transition-all disabled:opacity-50"
          >
            <Usb className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
            <span>{isConnecting ? 'Mendeteksi...' : 'Deteksi Kabel USB HP'}</span>
          </button>

          {/* Activity Log Drawer Toggle */}
          <button
            id="btn-toggle-adb-logs"
            onClick={() => setShowLogDrawer(!showLogDrawer)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center space-x-1 transition-colors"
            title="Log ADB & WebUSB"
          >
            <Terminal className="w-4 h-4 text-cyan-400" />
            {showLogDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Activity Log Drawer */}
      {showLogDrawer && (
        <div className="max-w-7xl mx-auto mt-3 p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-[11px] text-slate-300 max-h-32 overflow-y-auto space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-[10px] border-b border-slate-800 pb-1 mb-1">
            <span>Log Transmisi ADB Protocol via USB (1-3ms):</span>
            <span className="text-cyan-400">{logs.length} Peristiwa</span>
          </div>
          {logs.slice(-6).map((log, i) => (
            <div key={i} className="text-cyan-300/90 leading-tight truncate">
              {log}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};
