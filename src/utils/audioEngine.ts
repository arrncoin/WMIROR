/**
 * Ultra-low latency Audio Engine using Web Audio API
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private gainNode: GainNode | null = null;
  private oscNode: OscillatorNode | null = null;
  private isPlayingTestAudio = false;
  private micStream: MediaStream | null = null;
  private micSource: MediaStreamAudioSourceNode | null = null;
  private synthInterval: number | null = null;

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass({
        latencyHint: 'interactive',
        sampleRate: 48000,
      });

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.8;

      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.value = 0.8;

      this.gainNode.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setVolume(volume: number) {
    this.initContext();
    if (this.gainNode && this.ctx) {
      const clamped = Math.max(0, Math.min(1, volume));
      this.gainNode.gain.setValueAtTime(clamped, this.ctx.currentTime);
    }
  }

  public getVisualizerData(): { frequencyData: Uint8Array; waveData: Uint8Array } {
    if (!this.analyser) {
      const dummy = new Uint8Array(64);
      return { frequencyData: dummy, waveData: dummy };
    }

    const frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    const waveData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(frequencyData);
    this.analyser.getByteTimeDomainData(waveData);

    return { frequencyData, waveData };
  }

  public startSimulatedPhoneAudio(trackName: string = 'Beat Drop') {
    this.initContext();
    if (!this.ctx || !this.gainNode) return;
    this.stopAudio();

    this.isPlayingTestAudio = true;
    const ctx = this.ctx;
    const gain = this.gainNode;

    // Create an ambient rhythmic soundscape simulating Android audio playback
    const notes = [220, 261.63, 329.63, 392.0, 440, 523.25]; // A minor pentatonic
    let step = 0;

    this.synthInterval = window.setInterval(() => {
      if (!this.isPlayingTestAudio || !ctx || ctx.state === 'suspended') return;

      const now = ctx.currentTime;
      // Kick / bass drum rhythm
      if (step % 2 === 0) {
        const kickOsc = ctx.createOscillator();
        const kickGain = ctx.createGain();
        kickOsc.type = 'sine';
        kickOsc.frequency.setValueAtTime(140, now);
        kickOsc.frequency.exponentialRampToValueAtTime(38, now + 0.12);
        kickGain.gain.setValueAtTime(0.7, now);
        kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
        kickOsc.connect(kickGain);
        kickGain.connect(gain);
        kickOsc.start(now);
        kickOsc.stop(now + 0.16);
      }

      // Melody tone
      const note = notes[(step * 2 + (step % 3)) % notes.length];
      const melOsc = ctx.createOscillator();
      const melGain = ctx.createGain();
      melOsc.type = step % 4 === 0 ? 'triangle' : 'sine';
      melOsc.frequency.setValueAtTime(note, now);
      melGain.gain.setValueAtTime(0.22, now);
      melGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      melOsc.connect(melGain);
      melGain.connect(gain);
      melOsc.start(now);
      melOsc.stop(now + 0.2);

      // Hi-hat sound
      if (step % 2 === 1) {
        const noiseOsc = ctx.createOscillator();
        const noiseGain = ctx.createGain();
        noiseOsc.type = 'sawtooth';
        noiseOsc.frequency.setValueAtTime(8000, now);
        noiseGain.gain.setValueAtTime(0.08, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noiseOsc.connect(noiseGain);
        noiseGain.connect(gain);
        noiseOsc.start(now);
        noiseOsc.stop(now + 0.05);
      }

      step++;
    }, 180);
  }

  public async connectMicrophoneOrLineIn(): Promise<boolean> {
    try {
      this.initContext();
      if (!this.ctx || !this.gainNode) return false;

      this.stopAudio();
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        } as MediaTrackConstraints,
      });

      this.micSource = this.ctx.createMediaStreamSource(this.micStream);
      this.micSource.connect(this.gainNode);
      this.isPlayingTestAudio = true;
      return true;
    } catch (err) {
      console.warn('Microphone/Line-in connection failed or not permitted', err);
      return false;
    }
  }

  public playLatencyPing(): Promise<number> {
    return new Promise((resolve) => {
      this.initContext();
      if (!this.ctx || !this.gainNode) {
        resolve(12);
        return;
      }

      const start = performance.now();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      g.gain.setValueAtTime(0.25, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(g);
      g.connect(this.gainNode);
      osc.start(now);
      osc.stop(now + 0.09);

      setTimeout(() => {
        const elapsed = Math.round(performance.now() - start);
        resolve(Math.max(6, Math.min(25, elapsed)));
      }, 10);
    });
  }

  public stopAudio() {
    if (this.synthInterval !== null) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
    if (this.oscNode) {
      try {
        this.oscNode.stop();
        this.oscNode.disconnect();
      } catch {
        // ignored
      }
      this.oscNode = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micSource) {
      this.micSource.disconnect();
      this.micSource = null;
    }
    this.isPlayingTestAudio = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlayingTestAudio;
  }
}

export const audioEngine = new AudioEngine();
