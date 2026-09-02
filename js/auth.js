/**
 * Authentication Module
 * =====================
 * Handles clinical staff login session and demo credentials.
 */

const AuthManager = {
  currentUser: {
    name: 'Dr. Sameer Verma',
    email: 'doctor@hospital.org',
    role: 'Attending Physician',
    hospital: 'City Central Healthcare'
  },
  isAuthenticated: true,

  login(email, password) {
    if (!email || !password) {
      throw new Error('Please provide both email and password');
    }
    // Fictional demo authentication
    this.isAuthenticated = true;
    this.currentUser = {
      name: email.includes('nurse') ? 'Nurse Sarah Jenkins' : 'Dr. Sameer Verma',
      email: email,
      role: email.includes('nurse') ? 'Staff Nurse' : 'Attending Physician',
      hospital: 'City Central Healthcare'
    };
    return this.currentUser;
  },

  logout() {
    this.isAuthenticated = false;
  }
};
