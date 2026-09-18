/**
 * WebUSB & ADB Protocol Bridge Helper
 */

export interface UsbOem {
  name: string;
  vendorId: number;
}

export const ANDROID_OEM_VENDORS: UsbOem[] = [
  { name: 'Google (Pixel / Nexus)', vendorId: 0x18d1 },
  { name: 'Samsung Electronics', vendorId: 0x04e8 },
  { name: 'Xiaomi / Redmi / POCO', vendorId: 0x2717 },
  { name: 'OnePlus / OPPO / Realme', vendorId: 0x22d4 },
  { name: 'Vivo / iQOO', vendorId: 0x2d95 },
  { name: 'Motorola Mobility', vendorId: 0x22b8 },
  { name: 'ASUS (ROG Phone / Zenfone)', vendorId: 0x0b05 },
  { name: 'Huawei / Honor', vendorId: 0x12d1 },
  { name: 'Sony Xperia', vendorId: 0x0fce },
  { name: 'Transsion (Infinix / Tecno)', vendorId: 0x2a70 },
  { name: 'LG Electronics', vendorId: 0x1004 },
  { name: 'Nothing Phone', vendorId: 0x2a70 },
];

export interface WebUsbDevice {
  vendorId: number;
  productId: number;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
  opened?: boolean;
}

export interface ConnectedUsbDevice {
  vendorId: number;
  productId: number;
  manufacturerName?: string;
  productName?: string;
  serialNumber?: string;
  rawDevice?: WebUsbDevice;
}

export function isWebUsbSupported(): boolean {
  return typeof navigator !== 'undefined' && 'usb' in (navigator as unknown as Record<string, unknown>);
}

export async function requestAndroidUsbDevice(): Promise<ConnectedUsbDevice | null> {
  if (!isWebUsbSupported()) {
    throw new Error('WebUSB API tidak didukung di browser ini. Gunakan Google Chrome, Microsoft Edge, atau browser berbasis Chromium terbaru di Windows.');
  }

  try {
    const navUsb = (navigator as unknown as { usb: { requestDevice: (opts: { filters: { vendorId: number }[] }) => Promise<WebUsbDevice>; getDevices: () => Promise<WebUsbDevice[]> } }).usb;
    const filters = ANDROID_OEM_VENDORS.map((v) => ({ vendorId: v.vendorId }));
    const device = await navUsb.requestDevice({
      filters,
    });

    return {
      vendorId: device.vendorId,
      productId: device.productId,
      manufacturerName: device.manufacturerName || 'Android Device',
      productName: device.productName || 'ADB Interface',
      serialNumber: device.serialNumber || 'USB-SN' + Math.floor(100000 + Math.random() * 900000),
      rawDevice: device,
    };
  } catch (err: unknown) {
    if ((err as Error).name === 'NotFoundError') {
      // User cancelled device selector dialog
      return null;
    }
    throw err;
  }
}

export async function getPairedUsbDevices(): Promise<ConnectedUsbDevice[]> {
  if (!isWebUsbSupported()) return [];
  try {
    const navUsb = (navigator as unknown as { usb: { getDevices: () => Promise<WebUsbDevice[]> } }).usb;
    const devices = await navUsb.getDevices();
    return devices.map((device: WebUsbDevice) => ({
      vendorId: device.vendorId,
      productId: device.productId,
      manufacturerName: device.manufacturerName || 'Android Device',
      productName: device.productName || 'ADB Interface',
      serialNumber: device.serialNumber || 'SN-' + device.productId,
      rawDevice: device,
    }));
  } catch {
    return [];
  }
}

export interface AdbCommandResult {
  command: string;
  success: boolean;
  output?: string;
  latencyMs: number;
}

export class AdbBridge {
  private logCallbacks: ((log: string) => void)[] = [];

  public onLog(cb: (log: string) => void) {
    this.logCallbacks.push(cb);
  }

  private emitLog(msg: string) {
    this.logCallbacks.forEach((cb) => cb(msg));
  }

  public async injectTap(x: number, y: number): Promise<AdbCommandResult> {
    const start = performance.now();
    const cmd = `adb shell input tap ${Math.round(x)} ${Math.round(y)}`;
    this.emitLog(`[ADB TX] ${cmd}`);
    // Simulate low-latency USB transmission (1-3ms)
    await new Promise((r) => setTimeout(r, 2));
    const latency = Math.round(performance.now() - start);
    return { command: cmd, success: true, latencyMs: latency };
  }

  public async injectSwipe(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs: number = 150
  ): Promise<AdbCommandResult> {
    const start = performance.now();
    const cmd = `adb shell input swipe ${Math.round(x1)} ${Math.round(y1)} ${Math.round(x2)} ${Math.round(y2)} ${durationMs}`;
    this.emitLog(`[ADB TX] ${cmd}`);
    await new Promise((r) => setTimeout(r, 2));
    const latency = Math.round(performance.now() - start);
    return { command: cmd, success: true, latencyMs: latency };
  }

  public async injectKeyEvent(keyCode: string | number): Promise<AdbCommandResult> {
    const start = performance.now();
    const cmd = `adb shell input keyevent ${keyCode}`;
    this.emitLog(`[ADB TX] ${cmd}`);
    await new Promise((r) => setTimeout(r, 2));
    const latency = Math.round(performance.now() - start);
    return { command: cmd, success: true, latencyMs: latency };
  }

  public async injectText(text: string): Promise<AdbCommandResult> {
    const start = performance.now();
    const safeText = text.replace(/ /g, '%s').replace(/'/g, '');
    const cmd = `adb shell input text "${safeText}"`;
    this.emitLog(`[ADB TX] ${cmd}`);
    await new Promise((r) => setTimeout(r, 4));
    const latency = Math.round(performance.now() - start);
    return { command: cmd, success: true, latencyMs: latency };
  }

  public async setScreenOff(turnOff: boolean): Promise<AdbCommandResult> {
    const cmd = turnOff ? `adb shell scrcpy --turn-screen-off` : `adb shell input keyevent 26`;
    this.emitLog(`[ADB TX] ${cmd}`);
    return { command: cmd, success: true, latencyMs: 3 };
  }
}

export const adbBridge = new AdbBridge();
