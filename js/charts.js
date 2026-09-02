/**
 * HealthGuard IoT - Chart.js Telemetry Waveform Manager
 * ======================================================
 * Configures and updates real-time physiological charts with sleek gradients for:
 * - Heart Rate (BPM) [Red / Rose]
 * - SpO2 Oxygen Saturation (%) [Cyan / Sky]
 * - Body Temperature (°C) [Amber / Orange]
 */

class TelemetryCharts {
  constructor() {
    this.chart = null;
    this.labels = [];
    this.hrData = [];
    this.spo2Data = [];
    this.tempData = [];
    this.maxPoints = 20;
  }

  init(canvasId = 'liveWaveformChart') {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return;

    // Seed realistic baseline history
    const now = new Date();
    this.labels = [];
    this.hrData = [];
    this.spo2Data = [];
    this.tempData = [];

    for (let i = 14; i >= 0; i--) {
      const t = new Date(now.getTime() - i * 3000);
      this.labels.push(t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      this.hrData.push(74 + Math.sin(i * 0.8) * 3);
      this.spo2Data.push(98.2 + (i % 2) * 0.4);
      this.tempData.push(36.7 + (i % 2) * 0.1);
    }

    if (this.chart) {
      this.chart.destroy();
    }

    const isDark = document.documentElement.getAttribute('data-bs-theme') === 'dark';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
    const textColor = isDark ? '#94a3b8' : '#64748b';

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.labels,
        datasets: [
          {
            label: 'Heart Rate (BPM)',
            data: this.hrData,
            borderColor: '#f43f5e',
            backgroundColor: 'rgba(244, 63, 94, 0.10)',
            fill: true,
            tension: 0.38,
            borderWidth: 2.2,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#f43f5e',
            yAxisID: 'y'
          },
          {
            label: 'SpO2 Oxygen (%)',
            data: this.spo2Data,
            borderColor: '#06b6d4',
            backgroundColor: 'rgba(6, 182, 212, 0.05)',
            fill: false,
            tension: 0.38,
            borderWidth: 2.2,
            pointRadius: 3,
            pointHoverRadius: 6,
            pointBackgroundColor: '#06b6d4',
            yAxisID: 'y1'
          },
          {
            label: 'Body Temp (°C)',
            data: this.tempData,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            tension: 0.38,
            borderWidth: 2.0,
            pointRadius: 2,
            pointHoverRadius: 5,
            pointBackgroundColor: '#f59e0b',
            yAxisID: 'y2'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 400 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              boxWidth: 12,
              usePointStyle: true,
              font: { family: 'Inter', size: 11, weight: '600' },
              color: textColor
            }
          },
          tooltip: {
            backgroundColor: 'rgba(15, 23, 42, 0.94)',
            padding: 10,
            cornerRadius: 8,
            titleFont: { family: 'Inter', size: 12, weight: '600' },
            bodyFont: { family: 'JetBrains Mono', size: 12 }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor },
            ticks: { font: { family: 'JetBrains Mono', size: 10 }, color: textColor }
          },
          y: {
            type: 'linear',
            position: 'left',
            min: 40,
            max: 180,
            grid: { color: gridColor },
            ticks: { color: textColor },
            title: { display: true, text: 'BPM', font: { size: 10, weight: '600' }, color: textColor }
          },
          y1: {
            type: 'linear',
            position: 'right',
            min: 75,
            max: 100,
            grid: { display: false },
            ticks: { color: textColor },
            title: { display: true, text: 'SpO2 %', font: { size: 10, weight: '600' }, color: textColor }
          },
          y2: {
            display: false,
            min: 34,
            max: 42
          }
        }
      }
    });
  }

  setMaxPoints(pts) {
    this.maxPoints = pts;
    while (this.labels.length > this.maxPoints) {
      this.labels.shift();
      this.hrData.shift();
      this.spo2Data.shift();
      this.tempData.shift();
    }
    if (this.chart) this.chart.update();
  }

  addReading(reading) {
    if (!this.chart) return;

    const timeLabel = new Date(reading.timestamp || Date.now()).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    this.labels.push(timeLabel);
    this.hrData.push(reading.heartRate);
    this.spo2Data.push(reading.spo2);
    this.tempData.push(reading.temperature);

    if (this.labels.length > this.maxPoints) {
      this.labels.shift();
      this.hrData.shift();
      this.spo2Data.shift();
      this.tempData.shift();
    }

    this.chart.update('none');
  }
}

const telemetryCharts = new TelemetryCharts();
