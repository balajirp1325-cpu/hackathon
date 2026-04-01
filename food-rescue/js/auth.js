// ========================================
// AUTH FUNCTIONALITY
// ========================================

let selectedRole = null;

function showAuth(type) {
  const modal = document.getElementById('auth-modal');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  const title = document.getElementById('auth-modal-title');

  modal.classList.add('active');

  if (type === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    title.textContent = 'Welcome Back';
  } else {
    loginForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    title.textContent = 'Create Account';
  }
}

function hideAuth() {
  document.getElementById('auth-modal').classList.remove('active');
}

function selectRole(role) {
  selectedRole = role;
  
  // Update UI
  document.querySelectorAll('.role-option').forEach(opt => {
    opt.classList.remove('selected');
  });
  document.querySelector(`[data-role="${role}"]`).classList.add('selected');
  
  // Show/hide organization name field for NGOs and Donors
  const orgGroup = document.getElementById('org-name-group');
  if (role === 'ngo' || role === 'donor') {
    orgGroup.style.display = 'block';
    orgGroup.querySelector('label').textContent = role === 'ngo' ? 'Organization Name' : 'Business/Restaurant Name';
  } else {
    orgGroup.style.display = 'none';
  }
}

function handleLogin() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;

  if (!email || !password) {
    showToast('Please fill in all fields', 'error');
    return;
  }

  // Simulate login - determine role from email for demo
  let role = 'donor';
  if (email.includes('ngo')) role = 'ngo';
  if (email.includes('volunteer')) role = 'volunteer';

  // Store user data
  localStorage.setItem('foodrescueuser', JSON.stringify({
    email,
    role,
    name: 'Demo User',
    loggedIn: true
  }));

  showToast('Login successful!', 'success');
  
  // Redirect based on role
  setTimeout(() => {
    redirectToDashboard(role);
  }, 500);
}

function handleSignup() {
  const name = document.getElementById('signup-name').value;
  const email = document.getElementById('signup-email').value;
  const phone = document.getElementById('signup-phone').value;
  const password = document.getElementById('signup-password').value;
  const terms = document.getElementById('signup-terms').checked;
  const org = document.getElementById('signup-org')?.value;

  if (!selectedRole) {
    showToast('Please select a role', 'error');
    return;
  }

  if (!name || !email || !phone || !password) {
    showToast('Please fill in all required fields', 'error');
    return;
  }

  if (!terms) {
    showToast('Please accept the terms and conditions', 'error');
    return;
  }

  // Store user data
  localStorage.setItem('foodrescueuser', JSON.stringify({
    email,
    role: selectedRole,
    name,
    phone,
    organization: org,
    loggedIn: true
  }));

  showToast('Account created successfully!', 'success');
  
  // Redirect based on role
  setTimeout(() => {
    redirectToDashboard(selectedRole);
  }, 500);
}

function redirectToDashboard(role) {
  switch (role) {
    case 'donor':
      window.location.href = 'donor-dashboard.html';
      break;
    case 'ngo':
      window.location.href = 'ngo-dashboard.html';
      break;
    case 'volunteer':
      window.location.href = 'volunteer-dashboard.html';
      break;
  }
}

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

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(localStorage.getItem('foodrescue_user') || '{}');
  if (user.loggedIn && window.location.pathname.includes('index.html')) {
    redirectToDashboard(user.role);
  }
});

// Close modal when clicking outside
document.getElementById('auth-modal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    hideAuth();
  }
});