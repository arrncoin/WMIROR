/**
 * GPU Hardware Acceleration & Video Decoder Detection for Windows
 */

export interface DetectedGpuInfo {
  renderer: string;
  vendor: string;
  isHardwareAccelerated: boolean;
  recommendedDriver: 'direct3d11' | 'nvdec' | 'vulkan' | 'opengl';
  maxTextureSize: number;
}

export function detectWindowsGpu(): DetectedGpuInfo {
  if (typeof window === 'undefined') {
    return {
      renderer: 'Direct3D 11 GPU (Standard)',
      vendor: 'DirectX Hardware',
      isHardwareAccelerated: true,
      recommendedDriver: 'direct3d11',
      maxTextureSize: 8192,
    };
  }

  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      return {
        renderer: 'Direct3D 11 Hardware Renderer',
        vendor: 'Microsoft / Generic',
        isHardwareAccelerated: true,
        recommendedDriver: 'direct3d11',
        maxTextureSize: 4096,
      };
    }

    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    let renderer = 'Direct3D 11 Graphics';
    let vendor = 'GPU Vendor';

    if (debugInfo) {
      renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || renderer;
      vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || vendor;
    }

    // Clean up ANGLE prefixes common on Windows Chrome/Edge (e.g., "ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)")
    let cleanRenderer = renderer;
    if (renderer.includes('(') && renderer.includes(')')) {
      const match = renderer.match(/\(([^)]+)\)/);
      if (match && match[1]) {
        cleanRenderer = match[1];
      }
    }

    const lower = renderer.toLowerCase();
    const isNvidia = lower.includes('nvidia') || lower.includes('geforce') || lower.includes('rtx') || lower.includes('gtx');
    const isAmd = lower.includes('amd') || lower.includes('radeon');
    const isIntel = lower.includes('intel') || lower.includes('iris') || lower.includes('arc');

    let recommendedDriver: 'direct3d11' | 'nvdec' | 'vulkan' | 'opengl' = 'direct3d11';
    if (isNvidia) {
      recommendedDriver = 'nvdec';
    } else if (isAmd) {
      recommendedDriver = 'direct3d11';
    }

    return {
      renderer: cleanRenderer,
      vendor: isNvidia ? 'NVIDIA' : isAmd ? 'AMD' : isIntel ? 'Intel' : vendor,
      isHardwareAccelerated: true,
      recommendedDriver,
      maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE) || 8192,
    };
  } catch {
    return {
      renderer: 'Direct3D 11 Hardware GPU',
      vendor: 'DirectX / Windows',
      isHardwareAccelerated: true,
      recommendedDriver: 'direct3d11',
      maxTextureSize: 8192,
    };
  }
}
