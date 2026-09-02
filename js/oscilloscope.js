/**
 * HealthGuard IoT - Bedside Telemetry Oscilloscope Engine
 * ========================================================
 * Renders high-fidelity real-time sweeping Lead-II ECG and SpO2 Plethysmograph
 * waveforms using HTML5 Canvas for hospital bedside telemetry visualization.
 */

class BedsideOscilloscope {
  constructor() {
    this.ecgCanvas = null;
    this.ecgCtx = null;
    this.ppgCanvas = null;
    this.ppgCtx = null;

    this.ecgX = 0;
    this.ppgX = 0;
    this.ecgPrevY = 0;
    this.ppgPrevY = 0;

    this.heartRate = 74;
    this.spo2 = 98.4;
    this.phase = 0;
    this.animId = null;
    this.sweepSpeed = 2.0; // pixels per animation frame
  }

  init(ecgCanvasId = 'bedsideEcgCanvas', ppgCanvasId = 'bedsidePpgCanvas') {
    this.ecgCanvas = document.getElementById(ecgCanvasId);
    this.ppgCanvas = document.getElementById(ppgCanvasId);

    if (this.ecgCanvas) {
      this.ecgCtx = this.ecgCanvas.getContext('2d');
      this.resizeCanvas(this.ecgCanvas);
      this.ecgPrevY = this.ecgCanvas.height / 2;
    }

    if (this.ppgCanvas) {
      this.ppgCtx = this.ppgCanvas.getContext('2d');
      this.resizeCanvas(this.ppgCanvas);
      this.ppgPrevY = this.ppgCanvas.height / 2;
    }

    window.addEventListener('resize', () => {
      if (this.ecgCanvas) this.resizeCanvas(this.ecgCanvas);
      if (this.ppgCanvas) this.resizeCanvas(this.ppgCanvas);
    });

    if (!this.animId) {
      this.animate();
    }
  }

  resizeCanvas(canvas) {
    if (!canvas || !canvas.parentElement) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    if (rect.width > 0) {
      canvas.width = rect.width;
      canvas.height = canvas.parentElement.clientHeight || 120;
    }
  }

  updateVitals(hr, spo2) {
    this.heartRate = Math.max(30, Math.min(220, hr || 74));
    this.spo2 = Math.max(70, Math.min(100, spo2 || 98.4));
  }

  /**
   * Generates Lead-II ECG waveform mathematical voltage
   * @param {number} t - Phase (0.0 to 1.0 per cardiac cycle)
   */
  getEcgVoltage(t) {
    t = t % 1.0;
    // P wave (atrial depolarization)
    if (t >= 0.12 && t < 0.20) {
      return Math.sin((t - 0.12) / 0.08 * Math.PI) * 0.18;
    }
    // PR segment (isoelectric baseline)
    if (t >= 0.20 && t < 0.26) {
      return 0;
    }
    // Q wave (septal depolarization)
    if (t >= 0.26 && t < 0.28) {
      return -Math.sin((t - 0.26) / 0.02 * Math.PI) * 0.15;
    }
    // R wave (ventricular depolarization peak)
    if (t >= 0.28 && t < 0.32) {
      return Math.sin((t - 0.28) / 0.04 * Math.PI) * 1.0;
    }
    // S wave (ventricular depolarization finish)
    if (t >= 0.32 && t < 0.36) {
      return -Math.sin((t - 0.32) / 0.04 * Math.PI) * 0.30;
    }
    // ST segment
    if (t >= 0.36 && t < 0.44) {
      return 0;
    }
    // T wave (ventricular repolarization)
    if (t >= 0.44 && t < 0.60) {
      return Math.sin((t - 0.44) / 0.16 * Math.PI) * 0.28;
    }
    // TP baseline
    return (Math.random() - 0.5) * 0.02;
  }

  /**
   * Generates PPG (Pulse Oximeter Plethysmograph) wave
   */
  getPpgVoltage(t) {
    t = t % 1.0;
    // Systolic upstroke & dicrotic notch
    if (t < 0.35) {
      return Math.sin(t / 0.35 * Math.PI) * 0.85;
    } else if (t >= 0.35 && t < 0.55) {
      return 0.3 + Math.sin((t - 0.35) / 0.20 * Math.PI) * 0.25;
    } else {
      return Math.max(0, 0.25 * (1.0 - (t - 0.55) / 0.45));
    }
  }

  animate() {
    this.animId = requestAnimationFrame(() => this.animate());

    // Frequency determined by current heart rate: (HR / 60) cycles/sec
    const bps = this.heartRate / 60;
    const dt = (1 / 60) * bps; // increment phase per frame (assuming ~60fps)
    this.phase += dt;

    const ecgVal = this.getEcgVoltage(this.phase);
    const ppgVal = this.getPpgVoltage(this.phase);

    // Draw ECG Sweep
    if (this.ecgCtx && this.ecgCanvas && this.ecgCanvas.width > 0) {
      const w = this.ecgCanvas.width;
      const h = this.ecgCanvas.height;
      const midY = h / 2;
      const curY = midY - ecgVal * (h * 0.42);

      // Clear leading erase bar
      this.ecgCtx.fillStyle = '#020617';
      this.ecgCtx.fillRect(this.ecgX, 0, 16, h);

      // Draw ECG line segment
      this.ecgCtx.beginPath();
      this.ecgCtx.strokeStyle = '#10b981'; // Medical green
      this.ecgCtx.lineWidth = 2.2;
      this.ecgCtx.shadowColor = 'rgba(16, 185, 129, 0.6)';
      this.ecgCtx.shadowBlur = 6;
      this.ecgCtx.moveTo(this.ecgX === 0 ? 0 : this.ecgX - this.sweepSpeed, this.ecgPrevY);
      this.ecgCtx.lineTo(this.ecgX, curY);
      this.ecgCtx.stroke();

      this.ecgPrevY = curY;
      this.ecgX += this.sweepSpeed;
      if (this.ecgX >= w) {
        this.ecgX = 0;
      }
    }

    // Draw PPG Sweep
    if (this.ppgCtx && this.ppgCanvas && this.ppgCanvas.width > 0) {
      const w = this.ppgCanvas.width;
      const h = this.ppgCanvas.height;
      const curY = (h - 15) - ppgVal * (h * 0.68);

      // Clear leading erase bar
      this.ppgCtx.fillStyle = '#020617';
      this.ppgCtx.fillRect(this.ppgX, 0, 16, h);

      // Draw PPG line segment
      this.ppgCtx.beginPath();
      this.ppgCtx.strokeStyle = '#06b6d4'; // Cyan
      this.ppgCtx.lineWidth = 2.0;
      this.ppgCtx.shadowColor = 'rgba(6, 182, 212, 0.6)';
      this.ppgCtx.shadowBlur = 6;
      this.ppgCtx.moveTo(this.ppgX === 0 ? 0 : this.ppgX - this.sweepSpeed, this.ppgPrevY);
      this.ppgCtx.lineTo(this.ppgX, curY);
      this.ppgCtx.stroke();

      this.ppgPrevY = curY;
      this.ppgX += this.sweepSpeed;
      if (this.ppgX >= w) {
        this.ppgX = 0;
      }
    }
  }
}

window.bedsideOscilloscope = new BedsideOscilloscope();
