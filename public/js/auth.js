// Auth page logic
document.addEventListener('DOMContentLoaded', () => {
  if (API.isLoggedIn()) window.location.href = '/dashboard.html';
});

function switchTab(tab) {
  document.getElementById('loginForm').classList.toggle('hidden', tab !== 'login');
  document.getElementById('signupForm').classList.toggle('hidden', tab !== 'signup');
  document.getElementById('loginTab').classList.toggle('active', tab === 'login');
  document.getElementById('signupTab').classList.toggle('active', tab === 'signup');
}

async function handleLogin(e) {
  e.preventDefault();
  const btn = document.getElementById('loginBtn');
  btn.textContent = 'Signing in...';
  btn.disabled = true;
  try {
    const data = await API.post('/auth/login', {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    });
    API.setToken(data.token);
    API.setUser(data.user);
    showAlert(document.getElementById('alertContainer'), 'Login successful!', 'success');
    setTimeout(() => window.location.href = '/dashboard.html', 500);
  } catch (err) {
    showAlert(document.getElementById('alertContainer'), err.message);
  } finally {
    btn.textContent = 'Sign In';
    btn.disabled = false;
  }
}

async function handleSignup(e) {
  e.preventDefault();
  const btn = document.getElementById('signupBtn');
  btn.textContent = 'Creating account...';
  btn.disabled = true;
  try {
    const data = await API.post('/auth/signup', {
      name: document.getElementById('signupName').value,
      email: document.getElementById('signupEmail').value,
      password: document.getElementById('signupPassword').value,
      role: document.getElementById('signupRole').value
    });
    API.setToken(data.token);
    API.setUser(data.user);
    showAlert(document.getElementById('alertContainer'), 'Account created!', 'success');
    setTimeout(() => window.location.href = '/dashboard.html', 500);
  } catch (err) {
    showAlert(document.getElementById('alertContainer'), err.message);
  } finally {
    btn.textContent = 'Create Account';
    btn.disabled = false;
  }
}
