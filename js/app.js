/**
 * HealthGuard IoT - Master Application Controller
 * ================================================
 * Connects all clinical views, coordinates simulator events, updates Chart.js,
 * powers real-time oscilloscopes, manages alert triage, and handles theme state.
 * 
 * System Architecture Dataflow:
 * Patient → Sensors → IoT Device → Edge Processing → Abnormality Detection → Database/Cloud → Healthcare Dashboard → Alert
 */

const HealthGuardApp = {
  currentView: 'landing',
  selectedPatientId: 1,
  patientFilter: 'ALL',
  isPipelineFlowing: false,

  architectureNodes: [
    {
      id: 'node_patient',
      step: 1,
      title: '1. Patient',
      subtitle: 'Clinical Subject Profile',
      category: 'Source Entity',
      icon: 'bi-person-heart',
      color: '#2563eb',
      bgSubtle: 'rgba(37, 99, 235, 0.10)',
      desc: 'Clinical subject with demographic records, physiological baseline, and assigned monitoring ward.',
      input: 'Patient demographics, medical baseline, and clinical diagnosis',
      output: 'Continuous biophysical vital signs (cardiac pulse wave, blood oxygenation, core body temperature)',
      tech: 'Clinical Subject Data Model (patients.js)',
      specifications: [
        'Unique patient identifier (e.g. PT-1001) bound to assigned IoT gateway node ID (e.g. ESP32_NODE_01).',
        'Facilitates multi-patient isolation, ward allocation, and longitudinal clinical telemetry records.',
        'HL7/FHIR compliant patient identity data schema.'
      ],
      liveDataSample: 'Patient: Rahul Kumar (PT-1001) | Baseline: 74 BPM, 98% SpO2, 36.7°C'
    },
    {
      id: 'node_sensors',
      step: 2,
      title: '2. Sensors',
      subtitle: 'Biomedical Transduction',
      category: 'Sensors Layer',
      icon: 'bi-activity',
      color: '#0891b2',
      bgSubtle: 'rgba(8, 145, 178, 0.10)',
      desc: 'High-precision Photoplethysmography (PPG), dual-wavelength optical pulse oximetry, and clinical thermistors.',
      input: 'Physiological vitals & simulation scenario mode (Normal, Tachycardia, Hypoxia, High Fever, Bradycardia)',
      output: 'Raw biometric readings (Heart Rate BPM, SpO2 %, Temp °C, Blood Pressure, Respiration Rate)',
      tech: 'Stochastic Gaussian Sine Wave Engine (sensors.js)',
      specifications: [
        'Generates natural micro-variations using stochastic noise: $V(t) = \\mu + \\sigma \\cdot \\mathcal{N}(0, 1)$.',
        'Supports instant scenario injection of acute clinical deterioration events (hypoxia, arrhythmias, fever).',
        'Models dual-wavelength optical absorption (660nm Red / 940nm Infrared light absorption ratio).'
      ],
      liveDataSample: 'Raw Signals: HR=74.3 BPM, SpO2=98.2%, Temp=36.72°C (ADC Voltage: 3.28V)'
    },
    {
      id: 'node_iot_device',
      step: 3,
      title: '3. IoT Device',
      subtitle: 'Microcontroller Gateway',
      category: 'IoT Gateway Layer',
      icon: 'bi-cpu-fill',
      color: '#7c3aed',
      bgSubtle: 'rgba(124, 58, 237, 0.10)',
      desc: 'Embedded microcontroller (ESP32-WROOM-32) sampling hardware ADCs and packaging standardized JSON frames.',
      input: 'Sampled biomedical sensor ADC values',
      output: 'Standardized IoT telemetry JSON packet with sequence ID, transmission timestamp, and device node ID',
      tech: 'JSON Telemetry Framing Protocol (simulator.js)',
      specifications: [
        'Decoupled payload standard enables a physical ESP32 or Raspberry Pi to connect with 0% code modifications.',
        'Implements transmission sequence timestamping, hardware identifier tagging, and packet checksumming.',
        'Supports both push-based WebSocket streams and RESTful telemetry ingestion.'
      ],
      liveDataSample: '{"nodeId":"ESP32_NODE_01","seq":1241,"hr":74.3,"spo2":98.2,"temp":36.72}'
    },
    {
      id: 'node_edge_processing',
      step: 4,
      title: '4. Edge Processing',
      subtitle: 'Near-Sensor Sanitization',
      category: 'Edge Computing Layer',
      icon: 'bi-filter-circle-fill',
      color: '#0284c7',
      bgSubtle: 'rgba(2, 132, 199, 0.10)',
      desc: 'Near-sensor biological validation, boundary clipping, and Exponential Moving Average (EMA) smoothing.',
      input: 'Raw IoT JSON frame from transmitter',
      output: 'Sanitized, artifact-smoothed payload with edge latency (ms) and Signal Quality Index (SQI %)',
      tech: 'EdgeProcessor Module (edge-processing.js)',
      specifications: [
        'Mitigates optical motion artifacts using Exponential Moving Average (EMA) with smoothing factor $\\alpha = 0.3$.',
        'Enforces strict biological boundary clamping ($25 \\le \\text{HR} \\le 260$ BPM, $40 \\le \\text{SpO2} \\le 100\\%$).',
        'Calculates edge latency ($< 20$ ms) and telemetry Signal Quality Index (SQI).'
      ],
      liveDataSample: 'Filtered: HR=74.0 BPM, SpO2=98.4%, Temp=36.70°C | Latency: 12ms | SQI: 98.5%'
    },
    {
      id: 'node_abnormality_detection',
      step: 5,
      title: '5. Abnormality Detection',
      subtitle: 'Clinical Rule Intelligence',
      category: 'Intelligence Layer',
      icon: 'bi-exclamation-triangle-fill',
      color: '#d97706',
      bgSubtle: 'rgba(217, 119, 6, 0.10)',
      desc: 'Multi-tier deterministic rule matrix and Z-score statistical engine classifying vitals into NORMAL, WARNING, and CRITICAL.',
      input: 'Sanitized biometric vital stream',
      output: 'Overall triage status, detected clinical issues list, and bedside clinical recommendation',
      tech: 'Multi-Tier Deterministic Rule Matrix (abnormality-detection.js)',
      specifications: [
        'Classifies vitals hierarchically: Critical (immediate emergency), Warning (observation protocol), Normal (stable).',
        'Deterministic rule matrix prevents false negatives for life-threatening parameters.',
        'Extensible architecture ready for machine learning predictive deterioration models.'
      ],
      liveDataSample: 'Status: NORMAL (0 clinical issues detected) | Triage Recommendation: Routine Monitoring'
    },
    {
      id: 'node_database_cloud',
      step: 6,
      title: '6. Database / Cloud',
      subtitle: 'Time-Series Persistence',
      category: 'Persistence Layer',
      icon: 'bi-database-fill-check',
      color: '#059669',
      bgSubtle: 'rgba(5, 150, 105, 0.10)',
      desc: 'Relational SQLite and time-series telemetry store with indexed historical audit trails.',
      input: 'Sanitized telemetry logs, clinical alerts, and triage actions',
      output: 'Historical query logs, CSV dataset download, and audit trails',
      tech: 'Indexed Time-Series DB / Local Storage / REST API (history.js)',
      specifications: [
        'Uses compound indexing on `(patient_id, timestamp DESC)` for low-latency time-window queries.',
        'Supports CSV bulk dataset export for clinical audit, research, and model retraining.',
        'Maintains immutable clinical audit log for all physician triage actions.'
      ],
      liveDataSample: 'INSERT INTO telemetry_logs (patient_id, hr, spo2, temp, status) VALUES (1, 74, 98.4, 36.7, "NORMAL")'
    },
    {
      id: 'node_dashboard',
      step: 7,
      title: '7. Healthcare Dashboard',
      subtitle: 'Real-Time Telemetry UI',
      category: 'Presentation Layer',
      icon: 'bi-grid-1x2-fill',
      color: '#4f46e5',
      bgSubtle: 'rgba(79, 70, 229, 0.10)',
      desc: 'High-end responsive SaaS telemetry workstation with multi-axis Chart.js waveforms and real-time oscilloscopes.',
      input: 'Live telemetry stream & state transitions',
      output: 'Real-time Lead-II ECG canvas oscilloscope, Plethysmograph wave, and multi-bed matrix',
      tech: 'HTML5 Canvas, Chart.js, Vanilla JS, Bootstrap 5, Web Audio API',
      specifications: [
        'Eliminates page refreshes through reactive event callbacks.',
        'Renders dual continuous sweep oscilloscopes simulating medical ICU monitors (60 fps).',
        'Responsive layout optimized for clinical workstation displays and mobile tablets.'
      ],
      liveDataSample: 'Rendered: 60 FPS Lead-II ECG Sweep + Synchronized Chart.js Multi-Axis Waveform'
    },
    {
      id: 'node_alert',
      step: 8,
      title: '8. Alert System',
      subtitle: 'Emergency Alarm Dispatch',
      category: 'Notification Layer',
      icon: 'bi-bell-fill',
      color: '#e11d48',
      bgSubtle: 'rgba(225, 29, 72, 0.10)',
      desc: 'Automated alarm dispatching with Web Audio tone synthesis, audio-visual triage, and acknowledgment lifecycle.',
      input: 'Abnormality detection triggers (Critical/Warning)',
      output: 'Two-tone audio alarm chime, bedside emergency broadcast banner, and triage audit history',
      tech: 'Alert Lifecycle Manager & Web Audio Synthesizer (alerts.js, audio.js)',
      specifications: [
        'Implements full clinical alarm lifecycle: ACTIVE -> ACKNOWLEDGED -> RESOLVED with clinician timestamps.',
        'Web Audio API synthesizes acoustic alarm frequencies (900Hz / 700Hz alternating tone) without external sound files.',
        'Bedside emergency broadcast banner with one-click acknowledgment and clinician escalation.'
      ],
      liveDataSample: 'Alarm Dispatch: ACTIVE -> Bedside Broadcast -> Clinician Acknowledged -> Resolved'
    }
  ],

  init() {
    this.bindEvents();
    this.populateAllPatientDropdowns();
    this.renderPatientsTable();
    this.renderPatientCards();
    this.renderLiveMatrix();
    this.renderAlerts();
    this.renderArchitecture();
    this.renderHistoryTable();
    this.updateStats();

    // Set initial user display name & avatar from AuthManager
    this.updateUserHeaderUI();

    // Chart.js init
    setTimeout(() => {
      telemetryCharts.init('liveWaveformChart');
    }, 200);

    // Bedside Oscilloscope canvas init
    setTimeout(() => {
      if (window.bedsideOscilloscope) {
        window.bedsideOscilloscope.init('bedsideEcgCanvas', 'bedsidePpgCanvas');
      }
    }, 300);

    // Bind simulator engine callbacks
    iotSimulator.onTelemetryCallback = (bundle) => this.handleTelemetryUpdate(bundle);
    iotSimulator.onEventLogCallback = (log) => this.handleSimulatorEvent(log);

    // Initial inspector payload
    this.updateJsonInspector();

    // Log initialization
    iotSimulator.logEvent('IoT Clinical Gateway Initialized (Telemetry Stream Active)', 'INFO');
  },

  updateUserHeaderUI() {
    if (!window.AuthManager) return;
    const nameEl = document.getElementById('userDisplayName');
    const roleEl = document.getElementById('userRoleBadge');
    const avatarEl = document.getElementById('userAvatarBadge');
    const logoutBtn = document.getElementById('headerLogoutBtn');

    if (AuthManager.isAuthenticated && AuthManager.currentUser) {
      const u = AuthManager.currentUser;
      if (nameEl) nameEl.innerText = u.name || 'Dr. Pavan';
      if (roleEl) roleEl.innerText = u.role ? u.role.split('/')[0].trim() : 'Physician';
      if (avatarEl) {
        const cleanName = (u.name || 'Dr. Pavan').replace(/^(Dr\.|Nurse|Mr\.|Ms\.)\s*/i, '').trim();
        const parts = cleanName.split(' ');
        const initials = parts.length > 1
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : cleanName.substring(0, 2).toUpperCase() || 'DP';
        avatarEl.innerText = initials;
      }
      if (logoutBtn) logoutBtn.classList.remove('d-none');
    } else {
      if (nameEl) nameEl.innerText = 'Sign In';
      if (roleEl) roleEl.innerText = 'Guest';
      if (avatarEl) avatarEl.innerText = '??';
      if (logoutBtn) logoutBtn.classList.add('d-none');
    }
  },

  bindEvents() {
    // Navigation router
    document.querySelectorAll('[data-route]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const route = el.getAttribute('data-route');
        this.navigateTo(route);
      });
    });

    // Theme toggle
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-bs-theme') || 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', next);
        themeBtn.innerHTML = next === 'dark' ? '<i class="bi bi-sun"></i>' : '<i class="bi bi-moon"></i>';
        if (telemetryCharts) telemetryCharts.init('liveWaveformChart');
      });
    }

    // Audio Mute/Unmute Toggle (Desktop & Mobile Drawer)
    const audioBtn = document.getElementById('audioToggleBtn');
    const mobileAudioBtn = document.getElementById('mobileAudioToggleBtn');

    const updateAudioButtons = (isUnmuted) => {
      if (audioBtn) {
        audioBtn.innerHTML = isUnmuted
          ? '<i class="bi bi-volume-up-fill text-success"></i>'
          : '<i class="bi bi-volume-mute text-muted"></i>';
        audioBtn.title = isUnmuted ? 'Audio Telemetry Sound: ON' : 'Audio Telemetry Sound: MUTED';
      }
      if (mobileAudioBtn) {
        mobileAudioBtn.innerHTML = isUnmuted ? '🔊 Active' : '🔇 Muted';
        mobileAudioBtn.className = isUnmuted
          ? 'btn btn-xs btn-success py-0.5 px-2 rounded-pill'
          : 'btn btn-xs btn-outline-secondary py-0.5 px-2 rounded-pill';
      }
    };

    if (audioBtn) {
      audioBtn.addEventListener('click', () => {
        if (window.telemetryAudio) {
          const isUnmuted = window.telemetryAudio.toggleMute();
          updateAudioButtons(isUnmuted);
          this.showToast(isUnmuted ? '🔊 Bedside Audio Telemetry Enabled' : '🔇 Audio Telemetry Muted', 'info');
        }
      });
    }

    if (mobileAudioBtn) {
      mobileAudioBtn.addEventListener('click', () => {
        if (window.telemetryAudio) {
          const isUnmuted = window.telemetryAudio.toggleMute();
          updateAudioButtons(isUnmuted);
          this.showToast(isUnmuted ? '🔊 Bedside Audio Telemetry Enabled' : '🔇 Audio Telemetry Muted', 'info');
        }
      });
    }

    // Sidebar Mobile Drawer Toggle, Close Button & Backdrop
    const mobileNavBtn = document.getElementById('mobileNavToggle');
    const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    const openDrawer = () => {
      if (sidebar) sidebar.classList.add('show');
      if (backdrop) backdrop.classList.add('show');
      document.body.style.overflow = 'hidden';
    };

    const closeDrawer = () => {
      if (sidebar) sidebar.classList.remove('show');
      if (backdrop) backdrop.classList.remove('show');
      document.body.style.overflow = '';
    };

    if (mobileNavBtn) {
      mobileNavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (sidebar && sidebar.classList.contains('show')) {
          closeDrawer();
        } else {
          openDrawer();
        }
      });
    }

    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', closeDrawer);
    }

    if (backdrop) {
      backdrop.addEventListener('click', closeDrawer);
    }

    // Swipe-to-close touch gesture on mobile sidebar
    let touchStartX = 0;
    let touchEndX = 0;
    if (sidebar) {
      sidebar.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
      }, { passive: true });

      sidebar.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        if (touchStartX - touchEndX > 50) {
          closeDrawer();
        }
      }, { passive: true });
    }

    // Simulator Scenario Preset Buttons
    document.querySelectorAll('[data-sim-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.getAttribute('data-sim-mode');
        document.querySelectorAll('[data-sim-mode]').forEach(b => {
          b.classList.remove('active');
        });
        btn.classList.add('active');
        iotSimulator.setMode(mode);
        this.updateSimulatorUI();
      });
    });

    // Live Slider Controls in Simulator
    const hrSlider = document.getElementById('sliderHR');
    const spo2Slider = document.getElementById('sliderSpO2');
    const tempSlider = document.getElementById('sliderTemp');

    const updateFromSliders = () => {
      if (!hrSlider || !spo2Slider || !tempSlider) return;
      const hr = Number(hrSlider.value);
      const spo2 = Number(spo2Slider.value);
      const temp = Number(tempSlider.value);

      document.getElementById('sliderHRVal').innerText = `${hr} BPM`;
      document.getElementById('sliderSpO2Val').innerText = `${spo2}%`;
      document.getElementById('sliderTempVal').innerText = `${temp.toFixed(1)}°C`;

      iotSimulator.injectManualVitals(hr, spo2, temp);
    };

    if (hrSlider) hrSlider.addEventListener('input', updateFromSliders);
    if (spo2Slider) spo2Slider.addEventListener('input', updateFromSliders);
    if (tempSlider) tempSlider.addEventListener('input', updateFromSliders);

    // Simulator Start / Pause / Stop
    const startBtn = document.getElementById('startSimBtn');
    const pauseBtn = document.getElementById('pauseSimBtn');
    const stopBtn = document.getElementById('stopSimBtn');
    const abnormalBtn = document.getElementById('injectAnomalyBtn');

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const patientId = Number(document.getElementById('simPatientSelect')?.value) || 1;
        const interval = parseFloat(document.getElementById('simIntervalRange')?.value) || 3.0;
        iotSimulator.start(patientId, iotSimulator.mode, interval);
        this.updateSimulatorUI();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener('click', () => {
        iotSimulator.pause();
        this.updateSimulatorUI();
      });
    }

    if (stopBtn) {
      stopBtn.addEventListener('click', () => {
        iotSimulator.stop();
        this.updateSimulatorUI();
      });
    }

    if (abnormalBtn) {
      abnormalBtn.addEventListener('click', () => {
        iotSimulator.injectAbnormalEvent();
        this.updateSimulatorUI();
        this.showToast('🚨 Critical emergency anomaly injected into telemetry stream!', 'danger');
      });
    }

    // Copy JSON Payload button
    const copyPayloadBtn = document.getElementById('copyPayloadBtn');
    if (copyPayloadBtn) {
      copyPayloadBtn.addEventListener('click', () => {
        const jsonCode = document.getElementById('jsonInspectorCode')?.innerText;
        if (jsonCode) {
          navigator.clipboard.writeText(jsonCode).then(() => {
            this.showToast('📋 Telemetry JSON packet copied to clipboard!', 'success');
          });
        }
      });
    }

    // Custom Biometric Analyzer Form
    const customForm = document.getElementById('customAnalyzeForm');
    if (customForm) {
      customForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const hr = parseFloat(document.getElementById('customHR').value);
        const spo2 = parseFloat(document.getElementById('customSpO2').value);
        const temp = parseFloat(document.getElementById('customTemp').value);
        const pId = Number(document.getElementById('simPatientSelect')?.value) || 1;

        try {
          const { processedData } = EdgeProcessor.processAtEdge({ patientId: pId, heartRate: hr, spo2: spo2, temperature: temp });
          const detection = AbnormalityDetector.detectAbnormality(processedData);
          this.showCustomAnalysisResult(detection);
        } catch (err) {
          alert(err.message);
        }
      });
    }

    // Add Patient Form
    const addPatientForm = document.getElementById('addPatientForm');
    if (addPatientForm) {
      addPatientForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('newPatientName').value;
        const age = document.getElementById('newPatientAge').value;
        const gender = document.getElementById('newPatientGender').value;
        const room = document.getElementById('newPatientRoom').value;
        const condition = document.getElementById('newPatientCondition').value;

        const newPat = PatientManager.addPatient({ name, age, gender, room, condition });
        this.renderPatientsTable();
        this.renderPatientCards();
        this.renderLiveMatrix();
        this.updateStats();

        // Close modal
        const modalEl = document.getElementById('addPatientModal');
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        addPatientForm.reset();

        this.showToast(`Patient ${name} (${newPat.code}) registered successfully.`, 'success');
      });
    }

    // Patient Selector Dropdowns (Dashboard, Bedside, Simulator)
    const dashPatientSel = document.getElementById('dashPatientSelect');
    if (dashPatientSel) {
      dashPatientSel.addEventListener('change', (e) => {
        this.selectActivePatient(Number(e.target.value));
      });
    }

    const bedsidePatientSel = document.getElementById('bedsidePatientSelect');
    if (bedsidePatientSel) {
      bedsidePatientSel.addEventListener('change', (e) => {
        this.selectActivePatient(Number(e.target.value));
      });
    }

    const simPatientSel = document.getElementById('simPatientSelect');
    if (simPatientSel) {
      simPatientSel.addEventListener('change', (e) => {
        this.selectActivePatient(Number(e.target.value));
      });
    }

    // Auth Tabs Switcher (Sign In vs Register)
    const tabSignIn = document.getElementById('tabSignInBtn');
    const tabRegister = document.getElementById('tabRegisterBtn');
    const loginContainer = document.getElementById('authLoginFormContainer');
    const registerContainer = document.getElementById('authRegisterFormContainer');
    const switchToReg = document.getElementById('switchToRegisterLink');
    const switchToLogin = document.getElementById('switchToSignInLink');

    const showSignInTab = () => {
      if (tabSignIn && tabRegister) {
        tabSignIn.classList.add('active');
        tabRegister.classList.remove('active');
      }
      if (loginContainer) loginContainer.classList.remove('d-none');
      if (registerContainer) registerContainer.classList.add('d-none');
    };

    const showRegisterTab = () => {
      if (tabSignIn && tabRegister) {
        tabRegister.classList.add('active');
        tabSignIn.classList.remove('active');
      }
      if (loginContainer) loginContainer.classList.add('d-none');
      if (registerContainer) registerContainer.classList.remove('d-none');
    };

    if (tabSignIn) tabSignIn.addEventListener('click', showSignInTab);
    if (tabRegister) tabRegister.addEventListener('click', showRegisterTab);
    if (switchToReg) switchToReg.addEventListener('click', showRegisterTab);
    if (switchToLogin) switchToLogin.addEventListener('click', showSignInTab);

    // Login Form Submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail')?.value || 'dr.pavan@hospital.org';
        const password = document.getElementById('loginPassword')?.value || 'iot@123';
        try {
          const user = AuthManager.login(email, password);
          this.updateUserHeaderUI();
          this.showToast(`Welcome back, ${user.name}! Authentication verified.`, 'success');
          this.navigateTo('dashboard');
        } catch (err) {
          this.showToast(err.message, 'danger');
        }
      });
    }

    // Register Form Submission (New users with their own password)
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('regName')?.value;
        const email = document.getElementById('regEmail')?.value;
        const role = document.getElementById('regRole')?.value || 'Attending Physician';
        const password = document.getElementById('regPassword')?.value;
        const confirmPassword = document.getElementById('regConfirmPassword')?.value;

        if (password !== confirmPassword) {
          this.showToast('Passwords do not match. Please re-enter your password.', 'danger');
          return;
        }

        try {
          const user = AuthManager.register(name, email, password, role);
          this.updateUserHeaderUI();
          this.showToast(`Account created successfully! Welcome, ${user.name}.`, 'success');
          registerForm.reset();
          this.navigateTo('dashboard');
        } catch (err) {
          this.showToast(err.message, 'danger');
        }
      });
    }

    // Password Eye Visibility Toggle Buttons
    document.querySelectorAll('.toggle-password-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (!input) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        btn.innerHTML = isPassword ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
      });
    });

    // Header Logout Button
    const logoutBtn = document.getElementById('headerLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        AuthManager.logout();
        this.updateUserHeaderUI();
        this.showToast('You have been signed out.', 'info');
        this.navigateTo('login');
      });
    }

    // Chart time-range pills
    document.querySelectorAll('[data-chart-range]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-chart-range]').forEach(b => b.classList.remove('active', 'btn-primary'));
        btn.classList.add('active', 'btn-primary');
        const range = Number(btn.getAttribute('data-chart-range')) || 20;
        telemetryCharts.setMaxPoints(range);
      });
    });
  },

  logout() {
    AuthManager.logout();
    this.updateUserHeaderUI();
    this.showToast('You have been signed out.', 'info');
    this.navigateTo('login');
  },

  navigateTo(route) {
    this.currentView = route;

    // Update active desktop nav link
    document.querySelectorAll('.nav-link-custom').forEach(link => {
      if (link.getAttribute('data-route') === route) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Update active mobile bottom nav tab
    document.querySelectorAll('.mobile-nav-item').forEach(item => {
      if (item.getAttribute('data-route') === route) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Switch view visibility
    document.querySelectorAll('.app-view').forEach(view => {
      view.classList.add('d-none');
    });

    const targetView = document.getElementById(`view-${route}`);
    if (targetView) {
      targetView.classList.remove('d-none');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Re-render views dynamically on navigation
    if (route === 'architecture') this.renderArchitecture();
    if (route === 'history') this.renderHistoryTable();
    if (route === 'alerts') this.renderAlerts();
    if (route === 'patients') { this.renderPatientsTable(); this.renderPatientCards(); }
    if (route === 'dashboard') { this.renderPatientCards(); this.updateStats(); }
    if (route === 'landing') this.renderArchitecture();

    // If navigating to live monitor or dashboard, trigger chart/oscilloscope resizes
    if (route === 'live' && window.bedsideOscilloscope) {
      setTimeout(() => {
        window.bedsideOscilloscope.init('bedsideEcgCanvas', 'bedsidePpgCanvas');
      }, 100);
    }
    if (route === 'dashboard' && telemetryCharts) {
      setTimeout(() => {
        if (telemetryCharts.chart) telemetryCharts.chart.resize();
      }, 100);
    }

    // Close mobile sidebar and backdrop if open
    const sidebar = document.querySelector('.app-sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');
    if (sidebar) sidebar.classList.remove('show');
    if (backdrop) backdrop.classList.remove('show');
    document.body.style.overflow = '';
  },

  /**
   * Simulates a live telemetry packet moving step-by-step through all 8 pipeline stages
   */
  simulatePipelineFlow() {
    if (this.isPipelineFlowing) return;
    this.isPipelineFlowing = true;

    const btn = document.getElementById('pipelineSimBtn');
    if (btn) btn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span> Transmitting Dataflow...';

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep >= this.architectureNodes.length) {
        clearInterval(interval);
        this.isPipelineFlowing = false;
        if (btn) btn.innerHTML = '<i class="bi bi-play-circle-fill me-1"></i> Simulate Telemetry Dataflow';
        this.showToast('✅ 8-Stage Telemetry Dataflow Completed Successfully!', 'success');
        return;
      }

      const node = this.architectureNodes[currentStep];
      this.inspectArchNode(node.id);

      // Flash node elements
      const nodeEl = document.getElementById(`step-node-${node.id}`);
      if (nodeEl) {
        nodeEl.classList.add('flowing');
        setTimeout(() => nodeEl.classList.remove('flowing'), 800);
      }

      const trackNode = document.getElementById(`track-node-${node.id}`);
      if (trackNode) {
        trackNode.classList.add('flowing');
        setTimeout(() => trackNode.classList.remove('flowing'), 800);
      }

      currentStep++;
    }, 900);
  },

  handleTelemetryUpdate(bundle) {
    const { reading, rawReading, detection, edge } = bundle;

    // 1. Update Patient object
    PatientManager.updatePatientVitals(reading.patientId, reading, detection.overallStatus);

    // 2. Append to history log
    HistoryStore.addRecord({
      patientId: reading.patientId,
      heartRate: reading.heartRate,
      spo2: reading.spo2,
      temperature: reading.temperature,
      systolicBP: reading.systolicBP,
      diastolicBP: reading.diastolicBP,
      status: detection.overallStatus,
      edgeLatency: edge?.edgeLatencyMs || 12,
      timestamp: reading.timestamp || new Date().toISOString()
    });

    // 3. Trigger alert if Warning / Critical
    if (detection.overallStatus === 'CRITICAL' || detection.overallStatus === 'WARNING') {
      const issuesText = detection.issues && detection.issues.length > 0
        ? detection.issues.map(i => i.message).join(' | ')
        : 'Physiological vitals exceeded safe thresholds';

      AlertManager.createAlert({
        patientId: reading.patientId,
        severity: detection.overallStatus,
        message: issuesText,
        vitalValues: { hr: reading.heartRate, spo2: reading.spo2, temp: reading.temperature }
      });
      this.renderAlerts();
    }

    // 4. Update UI Dashboard if this patient is currently displayed
    if (reading.patientId === this.selectedPatientId) {
      const hrEl = document.getElementById('dashHR');
      const spo2El = document.getElementById('dashSpO2');
      const tempEl = document.getElementById('dashTemp');
      const bpEl = document.getElementById('dashBP');
      const statusEl = document.getElementById('dashPatientStatus');

      if (hrEl) hrEl.innerText = reading.heartRate;
      if (spo2El) spo2El.innerText = `${reading.spo2}%`;
      if (tempEl) tempEl.innerText = `${reading.temperature}°C`;
      if (bpEl) bpEl.innerText = `${reading.systolicBP}/${reading.diastolicBP}`;
      if (statusEl) {
        statusEl.className = `badge badge-${detection.overallStatus.toLowerCase()}`;
        statusEl.innerText = detection.overallStatus;
      }

      // Update Bedside Oscilloscope
      if (window.bedsideOscilloscope) {
        window.bedsideOscilloscope.updateVitals(reading.heartRate, reading.spo2);
      }

      // Update Bedside Live Monitor values
      const liveHR = document.getElementById('bedsideHRVal');
      const liveSpO2 = document.getElementById('bedsideSpO2Val');
      const liveTemp = document.getElementById('bedsideTempVal');
      const liveBP = document.getElementById('bedsideBPVal');
      const liveResp = document.getElementById('bedsideRespVal');
      const liveStatus = document.getElementById('bedsideStatusBadge');

      if (liveHR) liveHR.innerText = reading.heartRate;
      if (liveSpO2) liveSpO2.innerText = `${reading.spo2}%`;
      if (liveTemp) liveTemp.innerText = `${reading.temperature}°C`;
      if (liveBP) liveBP.innerText = `${reading.systolicBP}/${reading.diastolicBP}`;
      if (liveResp) liveResp.innerText = `${reading.respiratoryRate} rpm`;
      if (liveStatus) {
        liveStatus.className = `badge badge-${detection.overallStatus.toLowerCase()} px-3 py-1.5`;
        liveStatus.innerText = detection.overallStatus;
      }

      // Update Chart.js waveform
      telemetryCharts.addReading(reading);
    }

    // Update Simulator values readout
    const simHR = document.getElementById('simCurrentHR');
    const simSpO2 = document.getElementById('simCurrentSpO2');
    const simTemp = document.getElementById('simCurrentTemp');
    const simPackets = document.getElementById('simPacketsCount');
    const simSync = document.getElementById('simLastSync');

    if (simHR) simHR.innerText = reading.heartRate;
    if (simSpO2) simSpO2.innerText = `${reading.spo2}%`;
    if (simTemp) simTemp.innerText = `${reading.temperature}°C`;
    if (simPackets) simPackets.innerText = iotSimulator.packetsTransmitted;
    if (simSync) simSync.innerText = iotSimulator.lastTransmission;

    // Update JSON inspector
    this.updateJsonInspector(bundle);

    // Update navbar edge latency & stats
    const edgeLatencyEl = document.getElementById('edgeLatencyBadge');
    if (edgeLatencyEl && edge) {
      edgeLatencyEl.innerText = `⚡ ${edge.edgeLatencyMs} ms`;
    }

    // Refresh tables and matrix
    this.renderPatientsTable();
    this.renderPatientCards();
    this.renderLiveMatrix();
    this.renderHistoryTable();
    this.updateStats();

    // Critical Banner in Dashboard
    const critBanner = document.getElementById('criticalAlertBanner');
    if (critBanner) {
      const activeCrit = AlertManager.alerts.find(a => a.severity === 'CRITICAL' && a.status === 'ACTIVE');
      if (activeCrit) {
        critBanner.classList.remove('d-none');
        document.getElementById('criticalAlertMsg').innerText = activeCrit.message;
        document.getElementById('criticalAlertTime').innerText = `Detected ${activeCrit.time}`;
      } else {
        critBanner.classList.add('d-none');
      }
    }
  },

  updateJsonInspector(bundle) {
    const codeEl = document.getElementById('jsonInspectorCode');
    if (!codeEl) return;

    if (!bundle) {
      bundle = {
        reading: { patientId: 1, heartRate: 74.0, spo2: 98.4, temperature: 36.7, systolicBP: 118, diastolicBP: 78, timestamp: new Date().toISOString() },
        rawReading: { patientId: 1, deviceId: 'ESP32_NODE_01', heartRate: 74.5, spo2: 98.4, temperature: 36.7 },
        detection: { overallStatus: 'NORMAL', issues: [] },
        edge: { edgeLatencyMs: 12, signalQualityIndex: 98.5, emaFiltered: true }
      };
    }

    const payloadString = JSON.stringify({
      header: {
        protocol: 'IoT-HealthGuard-Enterprise-v2.1',
        nodeId: `ESP32_NODE_0${bundle.reading.patientId}`,
        sequence: iotSimulator.packetsTransmitted,
        edgeLatencyMs: bundle.edge?.edgeLatencyMs || 12,
        timestamp: bundle.reading.timestamp || new Date().toISOString()
      },
      telemetry: {
        heartRateBpm: bundle.reading.heartRate,
        spo2Percent: bundle.reading.spo2,
        bodyTemperatureCelsius: bundle.reading.temperature,
        bloodPressure: `${bundle.reading.systolicBP}/${bundle.reading.diastolicBP}`
      },
      edgeVerification: {
        signalQuality: `${bundle.edge?.signalQualityIndex || 98.5}%`,
        status: bundle.detection.overallStatus,
        abnormalityCount: bundle.detection.issues?.length || 0
      }
    }, null, 2);

    codeEl.innerText = payloadString;
  },

  handleSimulatorEvent(log) {
    const box = document.getElementById('simEventLogBox');
    if (!box) return;

    const row = document.createElement('div');
    row.className = 'py-0.5 border-bottom border-secondary-subtle';

    let colorClass = 'text-info';
    if (log.type === 'ANOMALY') colorClass = 'text-danger fw-bold';
    else if (log.type === 'WARN') colorClass = 'text-warning';
    else if (log.type === 'INFO') colorClass = 'text-success';

    row.innerHTML = `<span class="text-muted">[${log.time}]</span> <span class="${colorClass}">[${log.type}]</span> ${log.message}`;
    box.prepend(row);
  },

  updateSimulatorUI() {
    const statusPill = document.getElementById('simStatusPill');
    const startBtn = document.getElementById('startSimBtn');
    const pauseBtn = document.getElementById('pauseSimBtn');
    const stopBtn = document.getElementById('stopSimBtn');

    if (statusPill) {
      statusPill.innerText = iotSimulator.status;
      if (iotSimulator.status === 'RUNNING') {
        statusPill.className = 'badge bg-success-subtle text-success border border-success-subtle font-monospace';
      } else if (iotSimulator.status === 'PAUSED') {
        statusPill.className = 'badge bg-warning-subtle text-warning border border-warning-subtle font-monospace';
      } else {
        statusPill.className = 'badge bg-light text-dark border font-monospace';
      }
    }

    if (startBtn && pauseBtn && stopBtn) {
      if (iotSimulator.status === 'RUNNING') {
        startBtn.classList.add('d-none');
        pauseBtn.classList.remove('d-none');
        stopBtn.classList.remove('d-none');
      } else {
        startBtn.classList.remove('d-none');
        pauseBtn.classList.add('d-none');
        stopBtn.classList.add('d-none');
      }
    }
  },

  showCustomAnalysisResult(detection) {
    const resultBox = document.getElementById('customAnalysisResult');
    if (!resultBox) return;

    resultBox.classList.remove('d-none');
    const badgeClass = `badge badge-${detection.overallStatus.toLowerCase()}`;
    const issuesHtml = detection.issues.length > 0
      ? `<ul class="mb-2 ps-3 small text-danger">${detection.issues.map(i => `<li><strong>${i.type}</strong>: ${i.message}</li>`).join('')}</ul>`
      : `<p class="small text-success mb-2">All physiological vital parameters are within nominal clinical boundaries.</p>`;

    resultBox.innerHTML = `
      <div class="d-flex justify-content-between align-items-center mb-2">
        <h6 class="fw-bold mb-0">Biometric Diagnostic Result</h6>
        <span class="${badgeClass}">${detection.overallStatus}</span>
      </div>
      ${issuesHtml}
      <div class="p-2 rounded bg-body border small">
        <strong>Clinical Recommendation:</strong> ${detection.recommendation || 'Continue routine bedside telemetry oversight.'}
      </div>
    `;
  },

  populateAllPatientDropdowns() {
    const patients = PatientManager.getAllPatients();
    const optionsHtml = patients.map(p => `
      <option value="${p.id}" ${p.id === this.selectedPatientId ? 'selected' : ''}>
        ${p.name} (${p.code}) - ${p.room} [${p.status}]
      </option>
    `).join('');

    const dashSelect = document.getElementById('dashPatientSelect');
    if (dashSelect) dashSelect.innerHTML = optionsHtml;

    const bedsideSelect = document.getElementById('bedsidePatientSelect');
    if (bedsideSelect) bedsideSelect.innerHTML = optionsHtml;

    const simSelect = document.getElementById('simPatientSelect');
    if (simSelect) simSelect.innerHTML = optionsHtml;
  },

  populateSimulatorPatientDropdown() {
    this.populateAllPatientDropdowns();
  },

  renderPatientsTable() {
    const tbody = document.getElementById('patientsTableBody');
    const mobileList = document.getElementById('patientsMobileCardList');

    if (tbody) {
      tbody.innerHTML = PatientManager.patients.map(p => {
        const hr = p.hr || 74;
        const spo2 = p.spo2 || 98;
        const temp = p.temp || 36.7;
        const status = p.status || 'NORMAL';
        const badgeClass = `badge badge-${status.toLowerCase()}`;

        return `
          <tr>
            <td class="font-monospace fw-bold text-info">${p.code}</td>
            <td>
              <div class="fw-bold text-body">${p.name}</div>
              <span class="text-muted small">${p.condition}</span>
            </td>
            <td>${p.age} Yrs / ${p.gender}</td>
            <td><span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle font-monospace">${p.room}</span></td>
            <td class="font-monospace fw-bold" style="color: var(--color-hr);">${hr} BPM</td>
            <td class="font-monospace fw-bold" style="color: var(--color-spo2);">${spo2}%</td>
            <td class="font-monospace fw-bold" style="color: var(--color-temp);">${temp}°C</td>
            <td><span class="${badgeClass}">${status}</span></td>
            <td class="text-end">
              <button class="btn btn-sm btn-outline-info py-1 px-2.5" onclick="HealthGuardApp.inspectPatient(${p.id})">
                <i class="bi bi-activity me-1"></i> Monitor
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (mobileList) {
      mobileList.innerHTML = PatientManager.patients.map(p => {
        const hr = p.hr || 74;
        const spo2 = p.spo2 || 98;
        const temp = p.temp || 36.7;
        const status = p.status || 'NORMAL';
        const badgeClass = `badge badge-${status.toLowerCase()}`;

        return `
          <div class="saas-card mb-3 p-3">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <h6 class="fw-bold mb-0 text-body">${p.name}</h6>
                  <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle font-monospace">${p.code}</span>
                </div>
                <span class="text-muted small">${p.room} • ${p.age} Yrs / ${p.gender}</span>
              </div>
              <span class="${badgeClass}">${status}</span>
            </div>
            <p class="text-muted small mb-2">${p.condition}</p>
            <div class="row g-2 text-center mb-3">
              <div class="col-4">
                <div class="p-2 rounded bg-inner-box border border-secondary-subtle">
                  <span class="text-muted small d-block" style="font-size: 10px;">HR</span>
                  <span class="fw-bold font-monospace" style="color: var(--color-hr);">${hr} BPM</span>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 rounded bg-inner-box border border-secondary-subtle">
                  <span class="text-muted small d-block" style="font-size: 10px;">SpO2</span>
                  <span class="fw-bold font-monospace" style="color: var(--color-spo2);">${spo2}%</span>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 rounded bg-inner-box border border-secondary-subtle">
                  <span class="text-muted small d-block" style="font-size: 10px;">TEMP</span>
                  <span class="fw-bold font-monospace" style="color: var(--color-temp);">${temp}°C</span>
                </div>
              </div>
            </div>
            <button class="btn btn-sm btn-outline-info w-100 py-2 fw-semibold" onclick="HealthGuardApp.inspectPatient(${p.id})">
              <i class="bi bi-activity me-1"></i> Open Bedside Telemetry
            </button>
          </div>
        `;
      }).join('');
    }
  },

  renderPatientCards() {
    const grid = document.getElementById('livePatientCardsGrid');
    if (!grid) return;

    grid.innerHTML = PatientManager.patients.map(p => {
      const hr = p.hr || 74;
      const spo2 = p.spo2 || 98;
      const temp = p.temp || 36.7;
      const status = p.status || 'NORMAL';
      const isSelected = p.id === this.selectedPatientId;

      return `
        <div class="col-md-6 col-lg-4 col-xl-3">
          <div class="saas-card saas-card-interactive h-100 ${isSelected ? 'border-info shadow-sm' : ''}" onclick="HealthGuardApp.inspectPatient(${p.id})">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <div>
                <h6 class="fw-bold mb-0 text-body">${p.name}</h6>
                <span class="text-muted small font-monospace">${p.code} • ${p.room}</span>
              </div>
              <span class="badge badge-${status.toLowerCase()}">${status}</span>
            </div>
            <div class="row g-2 text-center my-2 font-monospace">
              <div class="col-4">
                <span class="text-muted small d-block" style="font-size: 10px;">HR (BPM)</span>
                <span class="fw-bold" style="color: var(--color-hr);">${hr}</span>
              </div>
              <div class="col-4 border-start border-end border-secondary-subtle">
                <span class="text-muted small d-block" style="font-size: 10px;">SpO2</span>
                <span class="fw-bold" style="color: var(--color-spo2);">${spo2}%</span>
              </div>
              <div class="col-4">
                <span class="text-muted small d-block" style="font-size: 10px;">TEMP</span>
                <span class="fw-bold" style="color: var(--color-temp);">${temp}°C</span>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center mt-2 pt-2 border-top border-secondary-subtle small text-muted">
              <span class="font-monospace" style="font-size: 10px;">Node: ${p.deviceId}</span>
              <span class="text-info fw-semibold" style="font-size: 11px;"><i class="bi bi-activity"></i> Active Feed</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderLiveMatrix() {
    const container = document.getElementById('liveMatrixContainer');
    if (!container) return;

    container.innerHTML = PatientManager.patients.map(p => {
      const hr = p.hr || 74;
      const spo2 = p.spo2 || 98;
      const temp = p.temp || 36.7;
      const status = p.status || 'NORMAL';

      return `
        <div class="col-md-6 col-xl-4">
          <div class="saas-card h-100">
            <div class="d-flex justify-content-between align-items-center pb-2 border-bottom border-secondary-subtle mb-3">
              <div>
                <div class="d-flex align-items-center gap-2">
                  <span class="live-beacon"></span>
                  <h6 class="fw-bold mb-0 text-body">${p.name}</h6>
                  <span class="badge bg-secondary-subtle text-secondary border border-secondary-subtle font-monospace">${p.code}</span>
                </div>
                <span class="text-muted small">${p.room} • ${p.condition}</span>
              </div>
              <span class="badge badge-${status.toLowerCase()}">${status}</span>
            </div>
            <div class="row g-2 text-center mb-3">
              <div class="col-4">
                <div class="p-2 rounded bg-inner-box border border-secondary-subtle">
                  <span class="text-muted small d-block" style="font-size: 11px;">HR (BPM)</span>
                  <span class="vital-val d-block fs-4 fw-bold font-monospace" style="color: var(--color-hr);">${hr}</span>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 rounded bg-inner-box border border-secondary-subtle">
                  <span class="text-muted small d-block" style="font-size: 11px;">SpO2 (%)</span>
                  <span class="vital-val d-block fs-4 fw-bold font-monospace" style="color: var(--color-spo2);">${spo2}</span>
                </div>
              </div>
              <div class="col-4">
                <div class="p-2 rounded bg-inner-box border border-secondary-subtle">
                  <span class="text-muted small d-block" style="font-size: 11px;">TEMP (°C)</span>
                  <span class="vital-val d-block fs-4 fw-bold font-monospace" style="color: var(--color-temp);">${temp}</span>
                </div>
              </div>
            </div>
            <div class="d-flex justify-content-between align-items-center">
              <span class="small text-muted font-monospace"><i class="bi bi-wifi text-info"></i> ${p.deviceId}</span>
              <button class="btn btn-sm btn-outline-info" onclick="HealthGuardApp.inspectPatient(${p.id})">
                Bedside Telemetry <i class="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  selectActivePatient(patientId, navigateView = null) {
    this.selectedPatientId = Number(patientId);
    const p = PatientManager.getPatientById(this.selectedPatientId);
    if (!p) return;

    // 1. Update Dashboard active card
    const nameEl = document.getElementById('dashPatientName');
    const codeEl = document.getElementById('dashPatientCode');
    const statusEl = document.getElementById('dashPatientStatus');
    const roomEl = document.getElementById('dashPatientRoom');
    const hrEl = document.getElementById('dashHR');
    const spo2El = document.getElementById('dashSpO2');
    const tempEl = document.getElementById('dashTemp');
    const bpEl = document.getElementById('dashBP');

    if (nameEl) nameEl.innerText = p.name;
    if (codeEl) codeEl.innerText = p.code;
    if (roomEl) roomEl.innerText = `Room: ${p.room} • Assigned: ${p.deviceId || 'ESP32_NODE_0' + p.id}`;
    if (statusEl) {
      statusEl.className = `badge badge-${p.status.toLowerCase()}`;
      statusEl.innerText = p.status;
    }
    if (hrEl) hrEl.innerText = p.hr || 74;
    if (spo2El) spo2El.innerText = `${p.spo2 || 98}%`;
    if (tempEl) tempEl.innerText = `${p.temp || 36.7}°C`;
    if (bpEl) bpEl.innerText = `${p.systolicBP || 118}/${p.diastolicBP || 78}`;

    // 2. Update Bedside Live Monitor Card
    const liveName = document.getElementById('bedsidePatientName');
    const liveCode = document.getElementById('bedsidePatientCode');
    const liveRoom = document.getElementById('bedsidePatientRoom');
    const liveCondition = document.getElementById('bedsidePatientCondition');
    const liveStatus = document.getElementById('bedsideStatusBadge');
    if (liveName) liveName.innerText = p.name;
    if (liveCode) liveCode.innerText = `${p.code} (${p.age} Yrs, ${p.gender})`;
    if (liveRoom) liveRoom.innerText = `Unit: ${p.room}`;
    if (liveCondition) liveCondition.innerText = `Diagnosis: ${p.condition}`;
    if (liveStatus) {
      liveStatus.className = `badge badge-${p.status.toLowerCase()} px-3 py-1.5`;
      liveStatus.innerText = p.status;
    }

    // 3. Update detail page
    const dName = document.getElementById('detailPatientName');
    const dCode = document.getElementById('detailPatientCode');
    const dAgeGen = document.getElementById('detailPatientAgeGender');
    const dRoom = document.getElementById('detailPatientRoom');
    const dCond = document.getElementById('detailPatientCondition');
    const dBadge = document.getElementById('detailPatientStatusBadge');

    if (dName) dName.innerText = p.name;
    if (dCode) dCode.innerText = p.code;
    if (dAgeGen) dAgeGen.innerText = `${p.age} Yrs / ${p.gender}`;
    if (dRoom) dRoom.innerText = `Room: ${p.room}`;
    if (dCond) dCond.innerText = `Condition: ${p.condition}`;
    if (dBadge) {
      dBadge.className = `badge badge-${p.status.toLowerCase()} px-3 py-1.5`;
      dBadge.innerText = p.status;
    }

    // 4. Synchronize all select dropdowns
    const dashSelect = document.getElementById('dashPatientSelect');
    if (dashSelect && Number(dashSelect.value) !== this.selectedPatientId) {
      dashSelect.value = this.selectedPatientId;
    }
    const bedsideSelect = document.getElementById('bedsidePatientSelect');
    if (bedsideSelect && Number(bedsideSelect.value) !== this.selectedPatientId) {
      bedsideSelect.value = this.selectedPatientId;
    }
    const simSelect = document.getElementById('simPatientSelect');
    if (simSelect && Number(simSelect.value) !== this.selectedPatientId) {
      simSelect.value = this.selectedPatientId;
    }

    // 5. Update IoT Simulator target
    if (window.iotSimulator) {
      iotSimulator.activePatientId = this.selectedPatientId;
      if (iotSimulator.sensors && iotSimulator.sensors.setBaseline) {
        iotSimulator.sensors.setBaseline(p.hr || 74, p.spo2 || 98.4, p.temp || 36.7);
      }
    }

    if (navigateView) {
      this.navigateTo(navigateView);
    } else {
      this.showToast(`Switched active telemetry to ${p.name} (${p.code})`, 'info');
    }
  },

  inspectPatient(patientId) {
    this.selectActivePatient(patientId, 'live');
  },

  renderAlerts() {
    const list = document.getElementById('alertsListContainer');
    if (!list) return;

    if (AlertManager.alerts.length === 0) {
      list.innerHTML = `
        <div class="saas-card text-center py-5 text-muted">
          <i class="bi bi-shield-check fs-1 text-success d-block mb-2"></i>
          <h5 class="fw-bold">No Active Clinical Alerts</h5>
          <p class="small mb-0">All patient telemetry streams are operating within safe clinical boundaries.</p>
        </div>
      `;
      return;
    }

    list.innerHTML = AlertManager.alerts.map(a => `
      <div class="saas-card mb-3 border-${a.severity === 'CRITICAL' ? 'danger' : 'warning'}-subtle">
        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div class="d-flex align-items-start gap-3">
            <span class="p-2.5 rounded-3 bg-${a.severity === 'CRITICAL' ? 'danger' : 'warning'}-subtle text-${a.severity === 'CRITICAL' ? 'danger' : 'warning'} fs-5">
              <i class="bi bi-exclamation-triangle-fill"></i>
            </span>
            <div>
              <div class="d-flex align-items-center gap-2">
                <span class="badge badge-${a.severity.toLowerCase()}">${a.severity}</span>
                <span class="badge bg-light text-dark border font-monospace">Patient PT-100${a.patientId}</span>
                <span class="text-muted small">${a.time}</span>
                <span class="badge bg-secondary-subtle text-secondary">${a.status}</span>
              </div>
              <h6 class="fw-bold mb-1 mt-1">${a.message}</h6>
              <div class="d-flex gap-3 small font-monospace text-muted">
                <span>HR: <strong class="text-danger">${a.vitalValues?.hr || '--'} BPM</strong></span>
                <span>SpO2: <strong class="text-info">${a.vitalValues?.spo2 || '--'}%</strong></span>
                <span>Temp: <strong class="text-warning">${a.vitalValues?.temp || '--'}°C</strong></span>
              </div>
            </div>
          </div>
          <div class="d-flex gap-2">
            ${a.status === 'ACTIVE' ? `
              <button class="btn btn-sm btn-outline-warning" onclick="HealthGuardApp.acknowledgeAlert('${a.id}')">Acknowledge</button>
              <button class="btn btn-sm btn-success" onclick="HealthGuardApp.resolveAlert('${a.id}')">Resolve</button>
            ` : a.status === 'ACKNOWLEDGED' ? `
              <button class="btn btn-sm btn-success" onclick="HealthGuardApp.resolveAlert('${a.id}')">Resolve Alarm</button>
            ` : `
              <span class="badge bg-success-subtle text-success py-2 px-3"><i class="bi bi-check-circle me-1"></i> Resolved</span>
            `}
          </div>
        </div>
      </div>
    `).join('');
  },

  acknowledgeAlert(id) {
    AlertManager.acknowledgeAlert(id);
    this.renderAlerts();
    this.updateStats();
    this.showToast('Alert status updated to ACKNOWLEDGED', 'info');
  },

  resolveAlert(id) {
    AlertManager.resolveAlert(id);
    this.renderAlerts();
    this.updateStats();
    this.showToast('Alert resolved and archived to audit log', 'success');
  },

  renderArchitecture() {
    // 1. Render Landing page 8-Stage Interactive Flow Pipeline
    const landingGrid = document.getElementById('archNodesGrid');
    if (landingGrid) {
      landingGrid.innerHTML = this.architectureNodes.map((node, idx) => `
        <div class="col-6 col-md-3">
          <div class="arch-node-card h-100 position-relative" id="step-node-${node.id}" onclick="HealthGuardApp.inspectArchNode('${node.id}')" style="border-top: 3.5px solid ${node.color};">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="badge font-monospace px-2 py-1" style="background: ${node.bgSubtle}; color: ${node.color}; border: 1px solid ${node.color}33; font-size: 10px; font-weight: 700;">Stage 0${node.step}</span>
              <span class="rounded-3 d-flex align-items-center justify-content-center" style="background: ${node.bgSubtle}; color: ${node.color}; width: 28px; height: 28px;">
                <i class="bi ${node.icon} fs-6"></i>
              </span>
            </div>
            <h6 class="fw-bold mb-1 text-truncate" style="font-size: 13.5px; color: var(--text-primary);">${node.title.replace(/^[0-9]+\.\s*/, '')}</h6>
            <span class="text-muted d-block" style="font-size: 11px;">${node.subtitle || node.category}</span>
          </div>
        </div>
      `).join('');
    }

    // 2. Render Architecture page Visual Flow Tracker
    const archTrack = document.getElementById('archPipelineTrack');
    if (archTrack) {
      archTrack.innerHTML = this.architectureNodes.map((node, idx) => `
        <div class="pipeline-step-node ${idx === 0 ? 'active' : ''}" id="track-node-${node.id}" onclick="HealthGuardApp.inspectArchNode('${node.id}')" style="border-top: 3px solid ${node.color};">
          <span class="badge font-monospace mb-1" style="background: ${node.bgSubtle}; color: ${node.color}; font-size: 9px; font-weight: 700;">0${node.step}</span>
          <div class="mb-1" style="color: ${node.color};"><i class="bi ${node.icon} fs-5"></i></div>
          <div class="fw-bold small text-truncate" style="font-size: 11px; color: var(--text-primary);">${node.title.replace(/^[0-9]+\.\s*/, '')}</div>
        </div>
        ${idx < this.architectureNodes.length - 1 ? '<i class="bi bi-arrow-right pipeline-arrow"></i>' : ''}
      `).join('');
    }

    // 3. Render Architecture list-group
    const archList = document.getElementById('archNodesListGroup');
    if (archList) {
      archList.innerHTML = this.architectureNodes.map((node, idx) => `
        <button class="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2.5 ${idx === 0 ? 'active' : ''}" id="list-btn-${node.id}" onclick="HealthGuardApp.inspectArchNode('${node.id}')">
          <div class="d-flex align-items-center gap-2">
            <span class="badge font-monospace" style="background: ${node.bgSubtle}; color: ${node.color}; border: 1px solid ${node.color}33; font-size: 10px;">0${node.step}</span>
            <span class="fw-semibold">${node.title}</span>
          </div>
          <i class="bi ${node.icon}" style="color: ${node.color};"></i>
        </button>
      `).join('');
    }

    // Default inspect first node
    this.inspectArchNode('node_patient');
  },

  inspectArchNode(nodeId) {
    const node = this.architectureNodes.find(n => n.id === nodeId);
    const box = document.getElementById('archNodeDetailsBox');
    if (!node || !box) return;

    // Update active class on track & list
    document.querySelectorAll('.pipeline-step-node').forEach(el => el.classList.remove('active'));
    const activeTrackNode = document.getElementById(`track-node-${nodeId}`);
    if (activeTrackNode) activeTrackNode.classList.add('active');

    document.querySelectorAll('#archNodesListGroup .list-group-item').forEach(el => el.classList.remove('active'));
    const activeListBtn = document.getElementById(`list-btn-${nodeId}`);
    if (activeListBtn) activeListBtn.classList.add('active');

    box.innerHTML = `
      <div class="saas-card shadow-sm border-primary">
        <div class="d-flex justify-content-between align-items-center pb-2 border-bottom mb-3">
          <div class="d-flex align-items-center gap-2">
            <span class="p-2 rounded-3 bg-primary text-white"><i class="bi ${node.icon} fs-5"></i></span>
            <div>
              <span class="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace">Stage 0${node.step} • ${node.category}</span>
              <h5 class="fw-bold mb-0 mt-0.5">${node.title}</h5>
            </div>
          </div>
        </div>
        <p class="text-muted small mb-3">${node.desc}</p>

        <!-- Live Data Representation at this stage -->
        <div class="p-2.5 rounded-3 bg-dark text-info font-monospace small mb-3 border border-secondary-subtle">
          <span class="text-muted d-block" style="font-size: 10px; text-transform: uppercase;">Stage Data Representation</span>
          <div class="text-success mt-1 fw-bold">${node.liveDataSample}</div>
        </div>

        <div class="row g-2 mb-3">
          <div class="col-md-6">
            <div class="p-2.5 rounded bg-light border h-100 shadow-sm">
              <span class="text-muted small fw-bold d-block text-uppercase" style="font-size: 10px;">Input Data Contract</span>
              <div class="small font-monospace text-primary mt-1">${node.input}</div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="p-2.5 rounded bg-light border h-100 shadow-sm">
              <span class="text-muted small fw-bold d-block text-uppercase" style="font-size: 10px;">Output Data Contract</span>
              <div class="small font-monospace text-success mt-1">${node.output}</div>
            </div>
          </div>
        </div>

        <div class="mb-3">
          <span class="text-muted small fw-bold d-block text-uppercase" style="font-size: 10px;">Processing Engine & Component</span>
          <div class="p-2 rounded bg-light border small font-monospace text-body"><code>${node.tech}</code></div>
        </div>

        <div class="p-3 rounded-3 bg-primary-light border border-primary-subtle">
          <span class="text-primary small fw-bold d-block mb-1"><i class="bi bi-gear-wide-connected me-1"></i> System Design & Engineering Protocols</span>
          <ul class="mb-0 ps-3 small text-muted">
            ${node.specifications.map(s => `<li class="mb-1">${s}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  },

  renderHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    const records = HistoryStore.getAllRecords().slice(0, 30);
    if (records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">No historical records recorded yet. Start the IoT Simulator.</td></tr>`;
      return;
    }

    tbody.innerHTML = records.map(r => `
      <tr>
        <td class="font-monospace text-muted">${new Date(r.timestamp).toLocaleTimeString()}</td>
        <td class="font-monospace fw-bold">PT-100${r.patientId}</td>
        <td class="font-monospace text-danger">${r.heartRate} BPM</td>
        <td class="font-monospace text-info">${r.spo2}%</td>
        <td class="font-monospace text-warning">${r.temperature}°C</td>
        <td class="font-monospace">${r.systolicBP || 120}/${r.diastolicBP || 80}</td>
        <td><span class="badge badge-${r.status.toLowerCase()}">${r.status}</span></td>
      </tr>
    `).join('');
  },

  updateStats() {
    const stats = PatientManager.getSummaryStats();
    const totalEl = document.getElementById('statTotalPatients');
    const normalEl = document.getElementById('statNormalCount');
    const warnEl = document.getElementById('statWarningCount');
    const critEl = document.getElementById('statCriticalCount');
    const alertEl = document.getElementById('statAlertsCount');

    if (totalEl) totalEl.innerText = stats.total;
    if (normalEl) normalEl.innerText = stats.normal;
    if (warnEl) warnEl.innerText = stats.warning;
    if (critEl) critEl.innerText = stats.critical;

    const activeAlerts = AlertManager.alerts.filter(a => a.status === 'ACTIVE').length;
    if (alertEl) alertEl.innerText = activeAlerts;

    const navBadge = document.getElementById('alertsBadgeCount');
    if (navBadge) {
      navBadge.innerText = activeAlerts;
      navBadge.style.display = activeAlerts > 0 ? 'inline-block' : 'none';
    }

    const bNavBadge = document.getElementById('bottomNavAlertsBadge');
    if (bNavBadge) {
      bNavBadge.innerText = activeAlerts;
      bNavBadge.style.display = activeAlerts > 0 ? 'inline-block' : 'none';
    }
  },

  exportCSV() {
    HistoryStore.exportCSV();
    this.showToast('📥 Telemetry dataset exported to CSV successfully.', 'success');
  },

  showToast(message, type = 'info') {
    let container = document.getElementById('appToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'appToastContainer';
      container.className = 'toast-container position-fixed end-0 p-3';
      container.style.bottom = window.innerWidth < 768 ? 'calc(var(--mobile-bottom-bar-height) + 10px)' : '0';
      container.style.zIndex = '1090';
      document.body.appendChild(container);
    } else {
      container.style.bottom = window.innerWidth < 768 ? 'calc(var(--mobile-bottom-bar-height) + 10px)' : '0';
    }

    const toastEl = document.createElement('div');
    toastEl.className = `toast align-items-center text-bg-${type === 'danger' ? 'danger' : type === 'success' ? 'success' : 'dark'} border-0 shadow-lg`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');

    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body small fw-semibold">
          ${message}
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    `;

    container.appendChild(toastEl);
    const bsToast = new bootstrap.Toast(toastEl, { delay: 3500 });
    bsToast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  }
};

// Start application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  HealthGuardApp.init();
});
