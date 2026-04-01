// ========================================
// VOLUNTEER DASHBOARD FUNCTIONALITY
// ========================================

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
  // Check authentication
  const user = JSON.parse(localStorage.getItem('foodrescueuser') || '{}');
  if (!user.loggedIn || user.role !== 'volunteer') {
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
    avatar.innerHTML = `<span>${user.name.charAt(0).toUpperCase()}</span>`;
  }

  if (nameSpan) {
    nameSpan.textContent = user.name;
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

// Task management functions
function startTask(taskId) {
  showToast(`Starting task #${taskId}`, 'info');

  // Update task status
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`) ||
                   document.querySelector(`.task-item:nth-child(${taskId})`);

  if (taskItem) {
    taskItem.classList.add('in-progress');
    const actionsDiv = taskItem.querySelector('.task-actions');
    actionsDiv.innerHTML = `
      <button onclick="viewTaskDetails(${taskId})" class="btn btn-secondary">View Details</button>
      <button onclick="completePickup(${taskId})" class="btn btn-primary">Complete Pickup</button>
    `;
  }

  // Switch to deliveries section
  showSection('deliveries');
}

function viewTaskDetails(taskId) {
  showToast(`Viewing details for task #${taskId}`, 'info');
  // In a real app, this would open a modal with full task details
}

function completePickup(taskId) {
  showToast(`Pickup completed for task #${taskId}`, 'success');

  // Update task status
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`) ||
                   document.querySelector(`.task-item:nth-child(${taskId})`);

  if (taskItem) {
    const actionsDiv = taskItem.querySelector('.task-actions');
    actionsDiv.innerHTML = `
      <button onclick="viewTaskDetails(${taskId})" class="btn btn-secondary">View Details</button>
      <button onclick="startDelivery(${taskId})" class="btn btn-primary">Start Delivery</button>
    `;
  }
}

function startDelivery(taskId) {
  showToast(`Starting delivery for task #${taskId}`, 'info');

  // Update task status
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`) ||
                   document.querySelector(`.task-item:nth-child(${taskId})`);

  if (taskItem) {
    const actionsDiv = taskItem.querySelector('.task-actions');
    actionsDiv.innerHTML = `
      <button onclick="callRecipient()" class="btn btn-secondary">Call Recipient</button>
      <button onclick="markDelivered(${taskId})" class="btn btn-success">Mark Delivered</button>
    `;
  }
}

function markDelivered(taskId) {
  showToast(`Delivery completed for task #${taskId}!`, 'success');

  // Update task status
  const taskItem = document.querySelector(`[data-task-id="${taskId}"]`) ||
                   document.querySelector(`.task-item:nth-child(${taskId})`);

  if (taskItem) {
    taskItem.classList.add('completed');
    const actionsDiv = taskItem.querySelector('.task-actions');
    actionsDiv.innerHTML = `
      <button onclick="viewTaskDetails(${taskId})" class="btn btn-secondary">View Details</button>
      <button onclick="rateNGO(${taskId})" class="btn btn-primary">Rate NGO</button>
    `;
  }

  // Move to history
  setTimeout(() => {
    showSection('history');
  }, 2000);
}

function rateNGO(taskId) {
  showToast(`Opening rating for task #${taskId}`, 'info');
  // In a real app, this would open a rating modal
}

// Filter tasks
function filterTasks(filter, tabElement) {
  // Update tab active state
  document.querySelectorAll('.filter-tabs .tab').forEach(tab => tab.classList.remove('active'));
  tabElement.classList.add('active');

  const tasks = document.querySelectorAll('#tasks-list .task-item');

  tasks.forEach(task => {
    if (filter === 'all') {
      task.style.display = 'block';
    } else {
      const status = task.getAttribute('data-status') || task.classList[1] || 'pending';
      task.style.display = status === filter ? 'block' : 'none';
    }
  });
}

// Quick action functions
function updateAvailability() {
  showToast('Availability updated to available', 'success');
  // In a real app, this would update the volunteer's availability status
}

function contactSupport() {
  showToast('Opening support chat...', 'info');
  // In a real app, this would open a support chat interface
}

function viewMap() {
  showToast('Opening delivery map...', 'info');
  // In a real app, this would open a map view with delivery routes
}

function callRecipient() {
  showToast('Calling recipient...', 'info');
  // In a real app, this would initiate a phone call
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