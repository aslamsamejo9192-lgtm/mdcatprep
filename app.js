/* MdcatPrep — static site logic: theme toggle, countdown, session-only auth, preview modal. */
(function () {
  // Theme: dark default, toggle persisted in browser storage.
  var root = document.documentElement;
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('mdcatprep-theme'); } catch (e) {}
  if (savedTheme === 'light') { root.classList.add('light'); }
  function syncThemeButton() {
    var btn = document.getElementById('themeToggle');
    if (btn) { btn.textContent = root.classList.contains('light') ? '🌙' : '☀️'; }
  }
  syncThemeButton();
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      root.classList.toggle('light');
      try { localStorage.setItem('mdcatprep-theme', root.classList.contains('light') ? 'light' : 'dark'); } catch (e) {}
      syncThemeButton();
    });
  }

  // Mobile menu.
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () { mobileMenu.classList.toggle('open'); });
  }

  // Countdown to 19 September 2027, 08:00 PKT (UTC+5 => 03:00 UTC).
  var target = Date.UTC(2027, 8, 19, 3, 0, 0);
  function tick() {
    var diff = target - Date.now();
    if (diff < 0) { diff = 0; }
    var days = Math.floor(diff / 86400000);
    var hrs = Math.floor(diff / 3600000) % 24;
    var min = Math.floor(diff / 60000) % 60;
    var sec = Math.floor(diff / 1000) % 60;
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var set = function (id, v) { var el = document.getElementById(id); if (el) { el.textContent = v; } };
    set('cdDays', days);
    set('cdHours', pad(hrs));
    set('cdMinutes', pad(min));
    set('cdSeconds', pad(sec));
  }
  tick();
  setInterval(tick, 1000);

  // Modals.
  function openModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.add('open'); }
  }
  function closeModal(id) {
    var el = document.getElementById(id);
    if (el) { el.classList.remove('open'); }
  }
  document.querySelectorAll('[data-close]').forEach(function (btn) {
    btn.addEventListener('click', function () { closeModal(btn.getAttribute('data-close')); });
  });
  document.querySelectorAll('.modal-overlay').forEach(function (ov) {
    ov.addEventListener('click', function (e) {
      if (e.target === ov) { ov.classList.remove('open'); }
    });
  });

  // Preview Only modal for every Attempt Test button.
  document.querySelectorAll('[data-preview]').forEach(function (btn) {
    btn.addEventListener('click', function () { openModal('previewModal'); });
  });

  // Session-only auth (browser storage only, nothing server-side).
  var SESSION_KEY = 'mdcatprep-session';
  var ACCOUNT_KEY = 'mdcatprep-account';
  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch (e) { return null; }
  }
  function getAccount() {
    try { return JSON.parse(localStorage.getItem(ACCOUNT_KEY) || 'null'); } catch (e) { return null; }
  }
  function setHeaderState() {
    var session = getSession();
    var chip = document.getElementById('userChip');
    var logoutBtn = document.getElementById('headerLogout');
    var registerBtn = document.getElementById('registerBtn');
    var mobileLogout = document.getElementById('mobileLogout');
    var mobileRegister = document.getElementById('mobileRegister');
    var dash = document.getElementById('dashboard');
    if (session) {
      var first = session.name.split(' ')[0];
      if (chip) { chip.textContent = 'Hi, ' + first; chip.style.display = 'inline'; }
      if (logoutBtn) { logoutBtn.style.display = 'inline-flex'; }
      if (registerBtn) { registerBtn.style.display = 'none'; }
      if (mobileLogout) { mobileLogout.style.display = 'block'; }
      if (mobileRegister) { mobileRegister.style.display = 'none'; }
      var greet = document.getElementById('dashGreeting');
      if (greet) { greet.textContent = 'Welcome, ' + session.name + '!'; }
      if (dash) { dash.classList.add('show'); }
    } else {
      if (chip) { chip.style.display = 'none'; }
      if (logoutBtn) { logoutBtn.style.display = 'none'; }
      if (registerBtn) { registerBtn.style.display = 'inline-flex'; }
      if (mobileLogout) { mobileLogout.style.display = 'none'; }
      if (mobileRegister) { mobileRegister.style.display = 'block'; }
      if (dash) { dash.classList.remove('show'); }
    }
  }
  function doLogout() {
    try { localStorage.removeItem(SESSION_KEY); } catch (e) {}
    setHeaderState();
    if (mobileMenu) { mobileMenu.classList.remove('open'); }
  }
  var headerLogout = document.getElementById('headerLogout');
  if (headerLogout) { headerLogout.addEventListener('click', doLogout); }
  var mobileLogout = document.getElementById('mobileLogout');
  if (mobileLogout) { mobileLogout.addEventListener('click', doLogout); }
  var dashLogout = document.getElementById('dashLogout');
  if (dashLogout) { dashLogout.addEventListener('click', doLogout); }

  // Auth modal openers + form switch.
  function showAuth(mode) {
    var reg = document.getElementById('registerForm');
    var sign = document.getElementById('signinForm');
    var title = document.getElementById('authTitle');
    if (mode === 'signin') {
      if (reg) { reg.style.display = 'none'; }
      if (sign) { sign.style.display = 'block'; }
      if (title) { title.textContent = 'Sign In'; }
    } else {
      if (reg) { reg.style.display = 'block'; }
      if (sign) { sign.style.display = 'none'; }
      if (title) { title.textContent = 'Create Account'; }
    }
    openModal('authModal');
    if (mobileMenu) { mobileMenu.classList.remove('open'); }
  }
  document.querySelectorAll('[data-auth]').forEach(function (el) {
    el.addEventListener('click', function () { showAuth(el.getAttribute('data-auth')); });
  });
  var toSignin = document.getElementById('toSignin');
  if (toSignin) { toSignin.addEventListener('click', function () { showAuth('signin'); }); }
  var toRegister = document.getElementById('toRegister');
  if (toRegister) { toRegister.addEventListener('click', function () { showAuth('register'); }); }

  // Register form with exact inline validation messages.
  var regForm = document.getElementById('registerForm');
  if (regForm) {
    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('regName').value.trim();
      var email = document.getElementById('regEmail').value.trim();
      var pass = document.getElementById('regPass').value;
      var confirm = document.getElementById('regConfirm').value;
      var err = document.getElementById('regError');
      err.textContent = '';
      if (!name || !email) { err.textContent = 'Please fill in all fields.'; return; }
      if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
      if (pass !== confirm) { err.textContent = 'Passwords do not match.'; return; }
      try {
        localStorage.setItem(ACCOUNT_KEY, JSON.stringify({ name: name, email: email }));
        localStorage.setItem(SESSION_KEY, JSON.stringify({ name: name, email: email }));
      } catch (ex) {}
      closeModal('authModal');
      setHeaderState();
      var dash = document.getElementById('dashboard');
      if (dash) { dash.scrollIntoView({ behavior: 'smooth' }); }
    });
  }

  // Sign In form (session-only, matches the account created in this browser).
  var signForm = document.getElementById('signinForm');
  if (signForm) {
    signForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = document.getElementById('signEmail').value.trim();
      var pass = document.getElementById('signPass').value;
      var err = document.getElementById('signError');
      err.textContent = '';
      var account = getAccount();
      if (!account || account.email.toLowerCase() !== email.toLowerCase()) {
        err.textContent = 'No account found for this email. Please create an account first.';
        return;
      }
      if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
      try { localStorage.setItem(SESSION_KEY, JSON.stringify({ name: account.name, email: account.email })); } catch (ex) {}
      closeModal('authModal');
      setHeaderState();
      var dash = document.getElementById('dashboard');
      if (dash) { dash.scrollIntoView({ behavior: 'smooth' }); }
    });
  }

  setHeaderState();
})();
