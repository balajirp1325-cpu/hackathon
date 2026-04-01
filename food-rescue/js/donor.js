// ========================================
// DONOR DASHBOARD FUNCTIONALITY
// ========================================

// Global variables
let uploadedImages = [];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const user = JSON.parse(localStorage.getItem('foodrescueuser') || '{}');
  const normalizedRole = (user.role || '').toString().toLowerCase();
  if (!user.loggedIn || normalizedRole !== 'donor') {
    window.location.href = 'index.html';
    return;
  }

  // Update user info in navbar
  updateUserInfo(user);

  // Initialize components
  initializeDashboard();
  // Load donor's listings
  loadMyListings();
});

// Update user info in navbar
function updateUserInfo(user) {
  const avatar = document.querySelector('.navbar .avatar');
  const nameSpan = document.querySelector('.navbar .text-sm');

  if (avatar) {
    avatar.innerHTML = `<span>${user.name.charAt(0).toUpperCase()}</span>`;
  }

  if (nameSpan) {
    nameSpan.textContent = user.organization || user.name;
  }
}

// Initialize dashboard components
function initializeDashboard() {
  // Menu toggle for mobile
  const menuToggle = document.getElementById('menu-toggle');
  const sidebar = document.getElementById('sidebar');

  if (menuToggle) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('open');
    });
  }

  // Close sidebar when clicking outside on mobile
  document.addEventListener('click', function(e) {
    if (window.innerWidth < 768 && !sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // Initialize drag and drop for file upload
  const uploadZone = document.getElementById('upload-zone');
  if (uploadZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      uploadZone.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      uploadZone.addEventListener(eventName, unhighlight, false);
    });

    uploadZone.addEventListener('drop', handleDrop, false);
  }
}

// Navigation functions
function showSection(sectionName) {
  // Hide all sections
  const sections = document.querySelectorAll('[id^="section-"]');
  sections.forEach(section => section.classList.add('hidden'));

  // Show selected section
  const targetSection = document.getElementById(`section-${sectionName}`);
  if (targetSection) {
    targetSection.classList.remove('hidden');
  }

  // Update sidebar active state
  const sidebarLinks = document.querySelectorAll('.sidebar-link');
  sidebarLinks.forEach(link => link.classList.remove('active'));

  const activeLink = document.querySelector(`.sidebar-link[onclick*="showSection('${sectionName}')"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }
}

// Dropdown functions
function toggleDropdown(dropdownId) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle('active');
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
  if (!e.target.closest('.dropdown')) {
    document.querySelectorAll('.dropdown').forEach(dropdown => {
      dropdown.classList.remove('active');
    });
  }
});

// Notification panel
function toggleNotifications() {
  const panel = document.getElementById('notification-panel');
  panel.classList.toggle('open');
}

// File upload functions
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function highlight() {
  const uploadZone = document.getElementById('upload-zone');
  uploadZone.classList.add('dragover');
}

function unhighlight() {
  const uploadZone = document.getElementById('upload-zone');
  uploadZone.classList.remove('dragover');
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  handleFiles(files);
}

function handleImageUpload(input) {
  const files = input.files;
  handleFiles(files);
}

function handleFiles(files) {
  [...files].forEach(uploadFile);
}

function uploadFile(file) {
  if (!file.type.startsWith('image/')) {
    showToast('Please upload only image files', 'error');
    return;
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    showToast('File size must be less than 10MB', 'error');
    return;
  }

  uploadedImages.push(file);
  displayUploadedImage(file);
}

function displayUploadedImage(file) {
  const preview = document.getElementById('upload-preview');

  const item = document.createElement('div');
  item.className = 'upload-preview-item';

  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  img.onload = function() {
    URL.revokeObjectURL(img.src);
  };

  const removeBtn = document.createElement('button');
  removeBtn.className = 'upload-preview-remove';
  removeBtn.innerHTML = '×';
  removeBtn.onclick = function() {
    const index = uploadedImages.indexOf(file);
    if (index > -1) {
      uploadedImages.splice(index, 1);
    }
    item.remove();
  };

  item.appendChild(img);
  item.appendChild(removeBtn);
  preview.appendChild(item);
}

// AI Quantity Estimation
function estimateQuantity() {
  if (uploadedImages.length === 0) {
    showToast('Please upload at least one food image first', 'warning');
    return;
  }

  // Simulate AI estimation
  showToast('Analyzing image...', 'info');

  setTimeout(() => {
    const estimatedServings = Math.floor(Math.random() * 50) + 10;
    document.getElementById('food-servings').value = estimatedServings;
    showToast(`Estimated ${estimatedServings} servings from the image`, 'success');
  }, 2000);
}

// Location detection
function detectLocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by this browser', 'error');
    return;
  }

  showToast('Detecting your location...', 'info');

  navigator.geolocation.getCurrentPosition(
    function(position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      // In a real app, you'd reverse geocode this
      document.getElementById('pickup-address').value = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      showToast('Location detected successfully', 'success');
    },
    function(error) {
      showToast('Unable to detect location. Please enter address manually.', 'error');
    }
  );
}

// Checklist functions
function toggleChecklist(item) {
  item.classList.toggle('checked');
  const checkbox = item.querySelector('.checklist-checkbox');
  const svg = checkbox.querySelector('svg');

  if (item.classList.contains('checked')) {
    checkbox.style.background = 'var(--success)';
    checkbox.style.borderColor = 'var(--success)';
    svg.style.color = 'var(--white)';
  } else {
    checkbox.style.background = 'transparent';
    checkbox.style.borderColor = 'var(--gray-300)';
    svg.style.color = 'transparent';
  }
}

// Form submission
function submitDonation() {
  // Validate form
  const requiredFields = [
    'food-name', 'food-type', 'food-quantity', 'food-servings',
    'expiry-date', 'expiry-time', 'pickup-address', 'contact-name', 'contact-phone'
  ];

  let isValid = true;
  requiredFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (!field.value.trim()) {
      field.classList.add('error');
      isValid = false;
    } else {
      field.classList.remove('error');
    }
  });

  if (uploadedImages.length === 0) {
    showToast('Please upload at least one food image', 'error');
    isValid = false;
  }

  // Check safety checklist
  const checkedItems = document.querySelectorAll('.checklist-item.checked');
  if (checkedItems.length < 4) {
    showToast('Please confirm all safety checklist items', 'error');
    isValid = false;
  }

  if (!isValid) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  // Submit to backend
  showToast('Submitting donation...', 'info');

  const token = localStorage.getItem('foodrescuetoken');
  const form = new FormData();
  form.append('title', document.getElementById('food-name').value.trim());
  form.append('description', document.getElementById('food-description')?.value || '');
  form.append('quantity', parseInt(document.getElementById('food-servings').value || document.getElementById('food-quantity').value, 10));
  form.append('unit', 'servings');
  const ft = document.getElementById('food-type').value || '';
  form.append('foodType', ft.toUpperCase() || 'VEG');
  form.append('latitude', 0);
  form.append('longitude', 0);
  form.append('address', document.getElementById('pickup-address').value || '');
  const expiryDate = document.getElementById('expiry-date').value;
  const expiryTime = document.getElementById('expiry-time').value;
  if (expiryDate && expiryTime) {
    form.append('expiryTime', new Date(`${expiryDate}T${expiryTime}`).toISOString());
  }

  uploadedImages.forEach((f) => form.append('image', f, f.name));

  fetch('/api/food', {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
    body: form,
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      showToast('Donation submitted successfully!', 'success');

      // Reset form
      document.getElementById('donate-form').reset();
      document.getElementById('upload-preview').innerHTML = '';
      uploadedImages = [];

      // Reset checklist
      document.querySelectorAll('.checklist-item').forEach(item => {
        item.classList.remove('checked');
        const checkbox = item.querySelector('.checklist-checkbox');
        checkbox.style.background = 'transparent';
        checkbox.style.borderColor = 'var(--gray-300)';
        checkbox.querySelector('svg').style.color = 'transparent';
      });

      // Refresh listings and switch view
      loadMyListings();
      showSection('listings');
    } else {
      showToast(data.message || 'Submission failed', 'error');
    }
  })
  .catch(err => {
    console.error('Donation error:', err);
    showToast('Network error. Please try again.', 'error');
  });
}

// Filter listings
function filterListings(filter, tabElement) {
  // Update tab active state
  document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
  tabElement.classList.add('active');

  const listings = document.querySelectorAll('#listings-grid .food-card');

  listings.forEach(listing => {
    if (filter === 'all') {
      listing.style.display = 'block';
    } else {
      const status = listing.getAttribute('data-status');
      listing.style.display = status === filter ? 'block' : 'none';
    }
  });
}

// Logout function
function logout() {
  localStorage.removeItem('foodrescueuser');
  window.location.href = 'index.html';
}

// Toast notification (reuse from auth.js)
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
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
      <span class="toast-message">${message}</span>
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
    toast.remove();
  }, 5000);
}

// Load donor's listings from backend
function loadMyListings() {
  const token = localStorage.getItem('foodrescuetoken');
  fetch('/api/food/my/listings', {
    headers: token ? { 'Authorization': `Bearer ${token}` } : {},
  })
  .then(res => res.json())
  .then(resp => {
    if (!resp.success) {
      console.warn('Failed to load listings', resp.message);
      return;
    }
    const listings = resp.data || [];
    const grid = document.getElementById('listings-grid');
    if (!grid) return;
    grid.innerHTML = '';
    listings.forEach(l => {
      const card = document.createElement('div');
      card.className = 'food-card';
      card.setAttribute('data-status', (l.status || '').toLowerCase());
      card.innerHTML = `
        <div class="food-card-content" style="border-bottom: 1px solid var(--gray-100);">
          <div class="flex justify-between items-start">
            <div>
              <h4 class="food-card-title">${escapeHtml(l.title)} (${l.quantity})</h4>
              <p class="text-sm text-gray-500">Listed ${new Date(l.createdAt).toLocaleString()}</p>
            </div>
            <div class="expiry-timer">${formatExpiry(l.expiryTime)}</div>
          </div>
          <div class="flex gap-2 mt-3">
            <span class="badge badge-gray">${escapeHtml(l.status || '')}</span>
          </div>
        </div>
      `;
      grid.appendChild(card);
    });
  })
  .catch(err => console.error('Load listings error:', err));
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"'`]/g, s => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;', '`':'&#96;'}[s]));
}

function formatExpiry(iso) {
  if (!iso) return '';
  const diff = new Date(iso) - new Date();
  if (diff <= 0) return 'Expired';
  const hrs = Math.floor(diff / (1000*60*60));
  const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
  return `${hrs}h ${mins}m`;
}