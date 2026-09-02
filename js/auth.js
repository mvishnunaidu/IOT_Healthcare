/**
 * Authentication Module
 * =====================
 * Handles clinical staff login session, default credentials (iot@123),
 * user registration with custom passwords, and session persistence.
 */

const AuthManager = {
  DEFAULT_PASSWORD: 'iot@123',

  currentUser: {
    name: 'Dr. Pavan',
    email: 'dr.pavan@hospital.org',
    role: 'Chief Medical Officer / Attending Physician',
    hospital: 'City Central Healthcare'
  },
  isAuthenticated: true,

  init() {
    try {
      const savedUser = localStorage.getItem('healthguard_current_user');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        this.isAuthenticated = true;
      }
    } catch {
      // Keep defaults
    }
  },

  // Stored users in localStorage (with custom passwords support)
  getStoredUsers() {
    try {
      const stored = localStorage.getItem('healthguard_users');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  saveUserPassword(email, password) {
    try {
      const users = this.getStoredUsers();
      users[email.toLowerCase()] = password;
      localStorage.setItem('healthguard_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save user password', e);
    }
  },

  getStoredProfiles() {
    try {
      const stored = localStorage.getItem('healthguard_user_profiles');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  },

  saveStoredProfiles(profiles) {
    try {
      localStorage.setItem('healthguard_user_profiles', JSON.stringify(profiles));
    } catch (e) {
      console.warn('Could not save user profiles', e);
    }
  },

  register(name, email, password, role = 'Attending Physician') {
    if (!name || !email || !password) {
      throw new Error('Please provide name, email, and password');
    }
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Store custom password
    this.saveUserPassword(cleanEmail, cleanPassword);

    // Store user profile
    const profiles = this.getStoredProfiles();
    const profile = {
      name: name.trim(),
      email: cleanEmail,
      role: role || 'Attending Physician',
      hospital: 'City Central Healthcare'
    };
    profiles[cleanEmail] = profile;
    this.saveStoredProfiles(profiles);

    this.isAuthenticated = true;
    this.currentUser = profile;
    localStorage.setItem('healthguard_current_user', JSON.stringify(this.currentUser));
    return this.currentUser;
  },

  login(email, password) {
    if (!email || !password) {
      throw new Error('Please provide both email and password');
    }
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // Check custom password if previously saved, otherwise accept default 'iot@123' or save custom password
    const customUsers = this.getStoredUsers();
    if (customUsers[cleanEmail]) {
      if (cleanPassword !== customUsers[cleanEmail] && cleanPassword !== this.DEFAULT_PASSWORD) {
        throw new Error(`Invalid credentials. Incorrect password for ${email}`);
      }
    } else {
      // First time login with custom password - save it
      this.saveUserPassword(cleanEmail, cleanPassword);
    }

    this.isAuthenticated = true;
    const profiles = this.getStoredProfiles();
    
    if (profiles[cleanEmail]) {
      this.currentUser = profiles[cleanEmail];
    } else {
      const isNurse = cleanEmail.includes('nurse');
      const isDrPavan = cleanEmail.includes('pavan') || cleanEmail.includes('doctor');

      this.currentUser = {
        name: isNurse ? 'Nurse Ananya Deshmukh' : (isDrPavan ? 'Dr. Pavan' : 'Dr. ' + cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())),
        email: email,
        role: isNurse ? 'Staff Nurse' : 'Attending Physician',
        hospital: 'City Central Healthcare'
      };
    }

    localStorage.setItem('healthguard_current_user', JSON.stringify(this.currentUser));
    return this.currentUser;
  },

  logout() {
    this.isAuthenticated = false;
    this.currentUser = {
      name: 'Guest Practitioner',
      email: '',
      role: 'Signed Out',
      hospital: ''
    };
    localStorage.removeItem('healthguard_current_user');
  }
};

AuthManager.init();
