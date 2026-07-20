const $ = (selector, root = document) => root.querySelector(selector);

function showToast(text) {
  const old = $('.local-toast');
  if (old) old.remove();
  const toast = document.createElement('div');
  toast.className = 'local-toast';
  toast.textContent = text;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
}

function closeEnvelope() {
  const env = $('#svd-env, .envelope-screen, .landing-envelope, .envelope, .env-screen, .env');
  if (env?.classList.contains('gone')) return;
  document.body.classList.add('envelope-opened');
  document.documentElement.classList.remove('svd-env-open');
  if (env) {
    env.classList.add('opened');
    env.style.pointerEvents = 'none';
    setTimeout(() => env.classList.add('gone'), 620);
    setTimeout(() => env.classList.add('is-hidden'), 1050);
  }
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
}

function updateTimer() {
  const target = new Date('2026-08-28T15:00:00+03:00').getTime();
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  const values = [days, hours, minutes, seconds].map(v => String(v).padStart(2, '0'));
  document.querySelectorAll('.timer__number').forEach((el, i) => { if (values[i]) el.textContent = values[i]; });
}

function makeCalendar(type) {
  const google = 'https://calendar.google.com/calendar/u/0/r/eventedit?text=%D0%A1%D0%B2%D0%B0%D0%B4%D0%B5%D0%B1%D0%BD%D1%8B%D0%B9%20%D0%B1%D0%B0%D0%BD%D0%BA%D0%B5%D1%82%20%D0%94%D0%BC%D0%B8%D1%82%D1%80%D0%B8%D1%8F%20%D0%B8%20%D0%94%D0%B0%D1%80%D1%8C%D0%B8&dates=20260828T150000/20260828T210000&details=Rose%20Park%2C%20%D0%B3.%20%D0%A1%D0%B0%D1%80%D0%B0%D0%BD%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%A1%D1%82%D1%80%D0%BE%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F%2C%2015&location=Rose%20Park%2C%20%D0%B3.%20%D0%A1%D0%B0%D1%80%D0%B0%D0%BD%D1%81%D0%BA%2C%20%D1%83%D0%BB.%20%D0%A1%D1%82%D1%80%D0%BE%D0%B8%D1%82%D0%B5%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F%2C%2015&ctz=Europe%2FMoscow';
  if (type === 'google') window.open(google, '_blank', 'noopener');
}

// Paste the published Apps Script Web App URL here to write RSVP answers into the sheet.
const GOOGLE_SHEETS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzrB34xP4s9dgD9nSpAEOFMDAwi6bzfXx_ZyOBcAAeK8H8dVGKLj6VSP7rjxZKc2PL0/exec';

function textForChecked(form, name) {
  const checked = form.querySelector(`[name="${name}"]:checked`);
  if (!checked) return '';
  const label = checked.closest('label');
  return (label?.querySelector('.radio-text, .checkbox-text')?.textContent || checked.value || '').trim();
}

function valuesForChecked(form, name) {
  return Array.from(form.querySelectorAll(`[name="${name}"]:checked`))
    .map((input) => {
      const label = input.closest('label');
      return (label?.querySelector('.checkbox-text, .radio-text')?.textContent || input.value || '').trim();
    })
    .filter(Boolean);
}

function collectRsvpData(form) {
  const data = new FormData(form);
  return {
    submitted_at: new Date().toISOString(),
    guest_name: (data.get('guest_name') || '').toString().trim(),
    guest_phone: (data.get('guest_phone') || '').toString().trim(),
    guest_attendance: textForChecked(form, 'guest_attendance'),
    drinks: valuesForChecked(form, 'answer_3014[]').join(', ')
  };
}

function saveRsvpFallback(payload) {
  const key = 'wedding-rsvp-submissions';
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  saved.push(payload);
  localStorage.setItem(key, JSON.stringify(saved));
}

function setupAttendanceVisibility(form) {
  const drinksGroup = form.querySelector('[data-rsvp-drinks]');
  if (!drinksGroup) return;
  const drinkInputs = Array.from(drinksGroup.querySelectorAll('input'));
  const update = () => {
    const cannotAttend = form.querySelector('[name="guest_attendance"]:checked')?.value === 'no';
    drinksGroup.classList.toggle('is-hidden', cannotAttend);
    drinkInputs.forEach((input) => {
      if (cannotAttend) input.checked = false;
      input.disabled = cannotAttend;
    });
  };
  form.querySelectorAll('[name="guest_attendance"]').forEach((input) => input.addEventListener('change', update));
  update();
}

async function submitRsvp(form) {
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  const button = form.querySelector('[type="submit"]');
  const oldText = button?.textContent;
  if (button) {
    button.disabled = true;
    button.textContent = 'Отправляем...';
  }
  const payload = collectRsvpData(form);
  try {
    if (!GOOGLE_SHEETS_WEB_APP_URL) {
      saveRsvpFallback(payload);
      showToast('Ответ сохранён. Для отправки в Google Таблицу нужен Apps Script URL.');
      return;
    }
    await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    showToast('Спасибо! Ответ отправлен.');
  } catch (error) {
    saveRsvpFallback(payload);
    showToast('Не получилось отправить. Ответ сохранён локально.');
  } finally {
    if (button) {
      button.disabled = false;
      button.textContent = oldText;
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateTimer();
  setInterval(updateTimer, 1000);
  const envelope = $('#svd-env');
  if (envelope) {
    envelope.addEventListener('pointerup', closeEnvelope, { passive: true });
    envelope.addEventListener('touchend', closeEnvelope, { passive: true });
  }
  document.addEventListener('click', (event) => {
    const target = event.target.closest('button, a, #svd-env, .env-seal, .env-seal-text');
    if (!target) return;
    const text = (target.textContent || '').trim();
    if (target.matches('#svd-env, .env-seal, .env-seal-text') || text.toLowerCase() === 'нажмите') {
      event.preventDefault();
      closeEnvelope();
    }
    if (target.matches('button') && text === 'Google') { event.preventDefault(); makeCalendar('google'); }
  });
  const form = $('#rsvpForm');
  if (form) {
    setupAttendanceVisibility(form);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitRsvp(form);
    });
  }
  const cookie = $('.cookie-banner');
  const cookieBtn = $('.cookie-banner__btn');
  if (localStorage.getItem('cookie-ok') === '1' && cookie) cookie.classList.add('is-hidden');
  if (cookieBtn) cookieBtn.addEventListener('click', () => { localStorage.setItem('cookie-ok','1'); if(cookie) cookie.classList.add('is-hidden'); });
});
