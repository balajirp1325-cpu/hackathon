// ========================================
// NGO DASHBOARD FUNCTIONALITY
// ========================================

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const user = JSON.parse(localStorage.getItem('foodrescueuser') || '{}');
  if (!user.loggedIn || user.role !== 'ngo') {
    window.location.href = 'index.html';
    return;
  }

  // Update user info in navbar
  updateUserInfo(user);

  // Initialize components
  initializeDashboard();
});

// Update user info in navbar
function updateUserInfo(user) {
  const avatar = document.querySelector('.navbar .avatar');
  const nameSpan = document.querySelector('.navbar .text-sm');

  if (avatar) {
    avatar.innerHTML = `<span>${user.organization.charAt(0).toUpperCase()}</span>`;
  }

  if (nameSpan) {
    nameSpan.textContent = user.organization;
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

// Filter requests
function filterRequests(filter, tabElement) {
  // Update tab active state
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => tab.classList.remove('active'));
  tabElement.classList.add('active');

  const requests = document.querySelectorAll('#requests-grid .food-card');

  requests.forEach(request => {
    if (filter === 'all') {
      request.style.display = 'block';
    } else {
      const status = request.getAttribute('data-status');
      request.style.display = status === filter ? 'block' : 'none';
    }
  });
}

// View request details
function viewRequestDetails(requestId) {
  showToast(`Viewing details for request #${requestId}`, 'info');
  // In a real app, this would open a modal with full request details
}

// Accept request
function acceptRequest(requestId) {
  // Update request status
  const requestCard = document.querySelector(`[data-request-id="${requestId}"]`) ||
                     document.querySelector(`#requests-grid .food-card:nth-child(${requestId})`);

  if (requestCard) {
    requestCard.setAttribute('data-status', 'accepted');
    requestCard.querySelector('.food-card-status').textContent = 'Accepted';
    requestCard.querySelector('.food-card-status').className = 'food-card-status status-accepted';

    // Update action buttons
    const actionsDiv = requestCard.querySelector('.food-card-actions');
    actionsDiv.innerHTML = `
      <button onclick="assignVolunteer(${requestId})" class="btn btn-secondary">Assign Volunteer</button>
      <button onclick="markCompleted(${requestId})" class="btn btn-success">Mark Completed</button>
    `;
  }

  showToast(`Request #${requestId} accepted successfully!`, 'success');
}

// Assign volunteer
function assignVolunteer(requestId) {
  // Simulate volunteer assignment
  const volunteers = ['Sarah Johnson', 'Mike Chen', 'Anna Rodriguez'];
  const randomVolunteer = volunteers[Math.floor(Math.random() * volunteers.length)];

  showToast(`Assigned ${randomVolunteer} to request #${requestId}`, 'success');

  // In a real app, this would update the database and show assignment in UI
}

// Mark completed
function markCompleted(requestId) {
  // Update request status
  const requestCard = document.querySelector(`[data-request-id="${requestId}"]`) ||
                     document.querySelector(`#requests-grid .food-card:nth-child(${requestId})`);

  if (requestCard) {
    requestCard.setAttribute('data-status', 'completed');
    requestCard.querySelector('.food-card-status').textContent = 'Completed';
    requestCard.querySelector('.food-card-status').className = 'food-card-status status-completed';

    // Update action buttons
    const actionsDiv = requestCard.querySelector('.food-card-actions');
    actionsDiv.innerHTML = `
      <button onclick="viewRequestDetails(${requestId})" class="btn btn-secondary">View Details</button>
      <button onclick="rateVolunteer(${requestId})" class="btn btn-primary">Rate Volunteer</button>
    `;
  }

  showToast(`Request #${requestId} marked as completed!`, 'success');
}

// Rate volunteer
function rateVolunteer(requestId) {
  showToast(`Opening volunteer rating for request #${requestId}`, 'info');
  // In a real app, this would open a rating modal
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
    toast.remove();
  }, 5000);
}