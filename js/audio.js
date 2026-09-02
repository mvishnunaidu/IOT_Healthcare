/**
 * HealthGuard IoT - Audio Telemetry & Clinical Alarm Synthesizer
 * ==============================================================
 * Uses Web Audio API to synthesize realistic hospital telemetry beeps
 * and emergency clinical alarm tones without external audio dependencies.
 */

class TelemetryAudioEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = true; // Default muted for smooth UX, user can toggle in navbar
    this.alarmOscillator = null;
    this.isAlarmPlaying = false;
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (!this.isMuted && (!this.audioCtx || this.audioCtx.state === 'suspended')) {
      this.init();
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
    }
    return !this.isMuted;
  }

  /**
   * Play cardiac pulse beep (Lead-II QRS tone, pitch slightly reflects SpO2)
   */
  playHeartbeatBeep(spo2 = 98) {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      // Pitch dynamically adjusted based on oxygen saturation (clinical standard: 880Hz down to 440Hz)
      const freq = Math.max(400, Math.min(1000, 440 + (spo2 - 80) * 22));
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.09);
    } catch (e) {
      console.warn('Audio telemetry beep error:', e);
    }
  }

  /**
   * Play critical emergency alarm chime (two-tone high priority alert)
   */
  playCriticalAlarm() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx || this.audioCtx.state !== 'running') return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.setValueAtTime(700, now + 0.12);
      osc.frequency.setValueAtTime(900, now + 0.24);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.38);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch (e) {
      console.warn('Critical alarm sound error:', e);
    }
  }
}

window.telemetryAudio = new TelemetryAudioEngine();
