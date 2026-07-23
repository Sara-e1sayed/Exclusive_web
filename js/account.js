/* ==========================================================================
   EXCLUSIVE — account.js
   Account page: pre-fill profile, validate + save changes, password change,
   simple "My Orders" listing pulled from any completed checkout (demo).
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#account-form');
  if (!form) return;

  const session = JSON.parse(localStorage.getItem('exclusive_user') || 'null');
  const firstName = form.querySelector('#acc-first-name');
  const lastName = form.querySelector('#acc-last-name');
  const email = form.querySelector('#acc-email');
  const address = form.querySelector('#acc-address');

  if (session){
    const parts = session.name.split(' ');
    firstName.value = parts[0] || '';
    lastName.value = parts.slice(1).join(' ') || '';
    email.value = session.email || '';
  }

  document.querySelectorAll('.profile-name, .greet-name').forEach(el => {
    el.textContent = session ? session.name : 'Guest';
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const newPass = form.querySelector('#acc-new-password');
    const confirmPass = form.querySelector('#acc-confirm-password');

    let valid = true;
    if (newPass.value || confirmPass.value){
      if (newPass.value.length < 6){
        setField(newPass, 'Password must be at least 6 characters');
        valid = false;
      } else {
        setField(newPass, '');
      }
      if (confirmPass.value !== newPass.value){
        setField(confirmPass, 'Passwords do not match');
        valid = false;
      } else {
        setField(confirmPass, '');
      }
    }
    if (!valid) return;

    const updated = {
      name: `${firstName.value.trim()} ${lastName.value.trim()}`.trim(),
      email: email.value.trim()
    };
    localStorage.setItem('exclusive_user', JSON.stringify(updated));
    showToast('Profile updated successfully');
  });

  form.querySelector('#account-cancel')?.addEventListener('click', () => form.reset());
});
