/* ==========================================================================
   EXCLUSIVE — auth.js
   Login / Signup form validation. Users are simulated and stored in
   localStorage (no real backend — this is a static front-end project).
   ========================================================================== */

const USERS_KEY = 'exclusive_users';
const SESSION_KEY = 'exclusive_user';

function getUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch(e){ return []; }
}
function saveUsers(users){ localStorage.setItem(USERS_KEY, JSON.stringify(users)); }

function setField(input, message){
  const field = input.closest('.field');
  const msg = field.querySelector('.error-msg');
  if (message){
    field.classList.add('error');
    if (msg) msg.textContent = message;
    return false;
  }
  field.classList.remove('error');
  return true;
}

function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(v.trim()); }
function isPhone(v){ return /^[+]?[0-9\s-]{8,15}$/.test(v.trim()); }
function isName(v){ return /^[A-Za-z\u0600-\u06FF]+(?:[ '-][A-Za-z\u0600-\u06FF]+)*$/.test(v.trim()); }

/* ---------------------------------------------------------------------
   Login form
--------------------------------------------------------------------- */
function validateEmailField(input){
  const v = input.value.trim();
  if (!v) return setField(input, 'Email is required');
  if (!isEmail(v)) return setField(input, 'Enter a valid email address (e.g. name@example.com)');
  return setField(input, '');
}

function initLoginForm(){
  const form = document.querySelector('#login-form');
  if (!form) return;
  const email = form.querySelector('#login-email');
  const password = form.querySelector('#login-password');

  email.addEventListener('blur', () => validateEmailField(email));
  password.addEventListener('blur', () => setField(password, password.value.length >= 6 || !password.value ? '' : 'Password must be at least 6 characters'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    valid = validateEmailField(email) && valid;
    valid = setField(password, password.value.length >= 6 ? '' : 'Password must be at least 6 characters') && valid;
    if (!valid) return;

    const users = getUsers();
    const user = users.find(u => u.email === email.value.trim().toLowerCase());
    if (!user || user.password !== password.value){
      // For demo purposes, allow login even without a matching account
      const guestUser = { name: email.value.split('@')[0] || 'Guest', email: email.value.trim().toLowerCase() };
      localStorage.setItem(SESSION_KEY, JSON.stringify(guestUser));
      showToast('Logged in successfully');
      setTimeout(() => window.location.href = 'account.html', 900);
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: user.name, email: user.email }));
    showToast('Welcome back, ' + user.name + '!');
    setTimeout(() => window.location.href = 'account.html', 900);
  });
}

/* ---------------------------------------------------------------------
   Signup form
--------------------------------------------------------------------- */
function validateNameField(input){
  const v = input.value.trim();
  if (!v) return setField(input, 'Name is required');
  if (v.length < 2) return setField(input, 'Name is too short');
  if (!isName(v)) return setField(input, 'Name should contain letters only');
  return setField(input, '');
}

function validateContactField(input){
  const v = input.value.trim();
  if (!v) return setField(input, 'Email or phone number is required');
  if (v.includes('@')){
    return isEmail(v) ? setField(input, '') : setField(input, 'Enter a valid email address (e.g. name@example.com)');
  }
  return isPhone(v) ? setField(input, '') : setField(input, 'Enter a valid email, or a phone number (8-15 digits)');
}

function initSignupForm(){
  const form = document.querySelector('#signup-form');
  if (!form) return;
  const name = form.querySelector('#signup-name');
  const contact = form.querySelector('#signup-contact');
  const password = form.querySelector('#signup-password');

  name.addEventListener('blur', () => validateNameField(name));
  contact.addEventListener('blur', () => validateContactField(contact));
  password.addEventListener('blur', () => setField(password, password.value.length >= 6 || !password.value ? '' : 'Password must be at least 6 characters'));

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let valid = true;
    valid = validateNameField(name) && valid;
    valid = validateContactField(contact) && valid;
    valid = setField(password, password.value.length >= 6 ? '' : 'Password must be at least 6 characters') && valid;
    if (!valid) return;

    const users = getUsers();
    const emailKey = contact.value.trim().toLowerCase();
    if (users.some(u => u.email === emailKey)){
      setField(contact, 'An account with this email already exists');
      return;
    }
    users.push({ name: name.value.trim(), email: emailKey, password: password.value });
    saveUsers(users);
    localStorage.setItem(SESSION_KEY, JSON.stringify({ name: name.value.trim(), email: emailKey }));
    showToast('Account created successfully!');
    setTimeout(() => window.location.href = 'account.html', 900);
  });
}

/* ---------------------------------------------------------------------
   Logout (bound wherever a .logout-link exists)
--------------------------------------------------------------------- */
function initLogout(){
  document.querySelectorAll('.logout-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem(SESSION_KEY);
      showToast('Logged out');
      setTimeout(() => window.location.href = '../index.html', 700);
    });
  });
}

/* ---------------------------------------------------------------------
   Live-clear error state as user types
--------------------------------------------------------------------- */
function initLiveClear(){
  document.querySelectorAll('.field input').forEach(input => {
    input.addEventListener('input', () => input.closest('.field').classList.remove('error'));
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initLoginForm();
  initSignupForm();
  initLogout();
  initLiveClear();
});
