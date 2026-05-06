// TaskForge API Client
const API = {
  base: '/api',

  getToken() { return localStorage.getItem('taskforge_token'); },
  setToken(token) { localStorage.setItem('taskforge_token', token); },
  setUser(user) { localStorage.setItem('taskforge_user', JSON.stringify(user)); },
  getUser() { try { return JSON.parse(localStorage.getItem('taskforge_user')); } catch { return null; } },
  
  logout() {
    localStorage.removeItem('taskforge_token');
    localStorage.removeItem('taskforge_user');
    window.location.href = '/';
  },

  isLoggedIn() { return !!this.getToken(); },
  isAdmin() { const u = this.getUser(); return u && u.role === 'admin'; },

  async request(endpoint, options = {}) {
    const url = `${this.base}${endpoint}`;
    const headers = { 'Content-Type': 'application/json' };
    const token = this.getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    try {
      const res = await fetch(url, { ...options, headers: { ...headers, ...options.headers } });
      const data = await res.json();
      if (res.status === 401) { this.logout(); return; }
      if (!res.ok) throw new Error(data.message || 'Request failed');
      return data;
    } catch (err) {
      throw err;
    }
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); },
};

// Shared UI helpers
function showAlert(container, message, type = 'error') {
  const existing = container.querySelector('.alert');
  if (existing) existing.remove();
  const div = document.createElement('div');
  div.className = `alert alert-${type}`;
  div.textContent = message;
  container.prepend(div);
  setTimeout(() => div.remove(), 5000);
}

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isOverdue(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date() ;
}

function requireAuth() {
  if (!API.isLoggedIn()) { window.location.href = '/'; return false; }
  return true;
}

function setupSidebar() {
  const user = API.getUser();
  if (!user) return;
  
  const el = document.getElementById('sidebarUser');
  if (el) {
    el.innerHTML = `
      <img src="${user.avatar}" alt="${user.name}" class="user-avatar" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=667eea&color=fff'">
      <div class="user-details">
        <div class="user-name">${user.name}</div>
        <div class="user-role">${user.role}</div>
      </div>`;
  }

  // Active nav link
  const path = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === path) link.classList.add('active');
  });

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', () => API.logout());

  // Mobile toggle
  const toggle = document.getElementById('mobileToggle');
  const sidebar = document.querySelector('.sidebar');
  if (toggle && sidebar) {
    toggle.addEventListener('click', () => sidebar.classList.toggle('open'));
  }

  // Hide admin-only elements for members
  if (!API.isAdmin()) {
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
  }
}
