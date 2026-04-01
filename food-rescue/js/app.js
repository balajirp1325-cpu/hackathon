// ========================================
// SHARED APPLICATION FUNCTIONALITY
// ========================================

// Global application state
const App = {
  // Current user data
  user: null,

  // Application settings
  settings: {
    theme: 'light',
    notifications: true,
    language: 'en'
  },

  // Initialize application
  init() {
    this.loadUserData();
    this.loadSettings();
    this.setupEventListeners();
    this.initializeComponents();
  },

  // Load user data from localStorage
  loadUserData() {
    const userData = localStorage.getItem('foodrescueuser');
    if (userData) {
      this.user = JSON.parse(userData);
    }
  },

  // Load application settings
  loadSettings() {
    const settings = localStorage.getItem('foodrescuesettings');
    if (settings) {
      this.settings = { ...this.settings, ...JSON.parse(settings) };
    }
  },

  // Setup global event listeners
  setupEventListeners() {
    // Handle online/offline status
    window.addEventListener('online', this.handleOnlineStatus.bind(this));
    window.addEventListener('offline', this.handleOfflineStatus.bind(this));

    // Handle visibility change (tab switching)
    document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));

    // Handle before unload
    window.addEventListener('beforeunload', this.handleBeforeUnload.bind(this));
  },

  // Initialize common components
  initializeComponents() {
    this.initializeTheme();
    this.initializeNotifications();
    this.initializeResponsiveFeatures();
  },

  // Theme management
  initializeTheme() {
    const theme = this.settings.theme;
    document.documentElement.setAttribute('data-theme', theme);

    // Theme toggle functionality (if theme switcher exists)
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', this.toggleTheme.bind(this));
    }
  },

  toggleTheme() {
    const currentTheme = this.settings.theme;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    this.settings.theme = newTheme;
    this.saveSettings();

    document.documentElement.setAttribute('data-theme', newTheme);

    // Update theme toggle button
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      const icon = themeToggle.querySelector('.theme-icon');
      if (icon) {
        icon.innerHTML = newTheme === 'light'
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';
      }
    }

    this.showToast(`Switched to ${newTheme} theme`, 'info');
  },

  // Notification management
  initializeNotifications() {
    // Request notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Setup notification toggle
    const notificationToggle = document.getElementById('notification-toggle');
    if (notificationToggle) {
      notificationToggle.checked = this.settings.notifications;
      notificationToggle.addEventListener('change', this.toggleNotifications.bind(this));
    }
  },

  toggleNotifications() {
    this.settings.notifications = !this.settings.notifications;
    this.saveSettings();

    const status = this.settings.notifications ? 'enabled' : 'disabled';
    this.showToast(`Notifications ${status}`, 'info');
  },

  // Show browser notification
  showNotification(title, body, icon = '/favicon.ico') {
    if (!this.settings.notifications || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification(title, {
      body: body,
      icon: icon,
      badge: icon
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    // Handle click
    notification.onclick = function() {
      window.focus();
      notification.close();
    };
  },

  // Responsive features
  initializeResponsiveFeatures() {
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));

    // Touch device detection
    this.isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    if (this.isTouchDevice) {
      document.documentElement.classList.add('touch-device');
    }
  },

  handleResize() {
    // Close mobile menus if window becomes larger
    if (window.innerWidth > 768) {
      const sidebar = document.getElementById('sidebar');
      if (sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
      }
    }
  },

  // Network status handlers
  handleOnlineStatus() {
    this.showToast('Connection restored', 'success');
    this.syncData();
  },

  handleOfflineStatus() {
    this.showToast('You are offline. Some features may be limited.', 'warning');
  },

  // Sync data when coming back online
  syncData() {
    // In a real app, this would sync local changes with the server
    console.log('Syncing data with server...');
  },

  // Visibility change handler
  handleVisibilityChange() {
    if (document.hidden) {
      // Tab is hidden
      this.pauseNonEssentialTasks();
    } else {
      // Tab is visible again
      this.resumeNonEssentialTasks();
      this.checkForUpdates();
    }
  },

  pauseNonEssentialTasks() {
    // Pause animations, polling, etc.
  },

  resumeNonEssentialTasks() {
    // Resume animations, polling, etc.
  },

  checkForUpdates() {
    // Check for new notifications, updates, etc.
  },

  // Before unload handler
  handleBeforeUnload(event) {
    // Save any unsaved data
    this.saveUserData();
    this.saveSettings();
  },

  // Data persistence
  saveUserData() {
    if (this.user) {
      localStorage.setItem('foodrescueuser', JSON.stringify(this.user));
    }
  },

  saveSettings() {
    localStorage.setItem('foodrescuesettings', JSON.stringify(this.settings));
  },

  // Utility functions
  showToast(message, type = 'info') {
    // Check if toast container exists, if not create it
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
      success: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      error: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
      warning: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      info: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, 5000);
  },

  // Format date/time
  formatDate(date, format = 'short') {
    const options = format === 'short'
      ? { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
      : { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };

    return new Date(date).toLocaleDateString('en-US', options);
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;

    return this.formatDate(date, 'short');
  },

  // Debounce function for search inputs
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Generate unique ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Validate email
  validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone number
  validatePhone(phone) {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  // Copy to clipboard
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      this.showToast('Copied to clipboard', 'success');
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showToast('Copied to clipboard', 'success');
    }
  },

  // Download file
  downloadFile(data, filename, type = 'text/plain') {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Get user location
  getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  },

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance;
  },

  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  },

  // Format distance
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    } else {
      return `${(meters / 1000).toFixed(1)}km`;
    }
  }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  App.init();
});

// Export for use in other scripts
window.App = App;