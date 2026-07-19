const $ = (selector, root = document) => root.querySelector(selector);
let weddingAudio;

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
  startMusic();
}

window.svdOpenEnvelope = closeEnvelope;
window.svdToggleSpeaker = () => {
  const speaker = $('#svd-speaker');
  if (!speaker || !weddingAudio) return;
  if (weddingAudio.paused) {
    weddingAudio.play()
      .then(() => {
        speaker.classList.add('playing');
        speaker.classList.remove('muted');
      })
      .catch(() => {
        speaker.classList.add('muted');
        speaker.classList.remove('playing');
      });
  } else {
    weddingAudio.pause();
    speaker.classList.add('muted');
    speaker.classList.remove('playing');
  }
};

function setupMusic() {
  weddingAudio = $('#wedding-audio');
  if (!weddingAudio) {
    weddingAudio = document.createElement('audio');
    weddingAudio.id = 'wedding-audio';
    weddingAudio.src = new URL('../../original-assets/be-my-baby.mp3', import.meta.url).href;
    weddingAudio.style.display = 'none';
    document.body.appendChild(weddingAudio);
  }
  weddingAudio.loop = true;
  weddingAudio.preload = window.matchMedia('(max-width: 767px)').matches ? 'none' : 'metadata';
  weddingAudio.volume = 0.72;
  window.__weddingAudio = weddingAudio;
}

function startMusic() {
  const speaker = $('#svd-speaker');
  if (!weddingAudio) setupMusic();
  if (!speaker || !weddingAudio) return;
  speaker.classList.remove('muted');
  weddingAudio.play()
    .then(() => {
      speaker.classList.add('playing');
      speaker.classList.remove('muted');
    })
    .catch(() => {
      speaker.classList.add('muted');
      speaker.classList.remove('playing');
    });
}

function startSilkBackground() {
  const canvas = $('#silk-canvas');
  if (!canvas) return;
  if (window.matchMedia('(max-width: 767px), (prefers-reduced-motion: reduce)').matches) {
    canvas.remove();
    return;
  }
  const context = canvas.getContext('2d', { alpha: true });
  if (!context) return;

  let width = 0;
  let height = 0;
  let frame = 0;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const drawWave = (phase, color, alpha, amplitude, yOffset, thickness) => {
    context.beginPath();
    context.moveTo(0, height + 60);
    for (let x = 0; x <= width + 24; x += 24) {
      const y =
        height * yOffset +
        Math.sin(x * 0.006 + phase) * amplitude +
        Math.sin(x * 0.014 - phase * 0.72) * amplitude * 0.42;
      context.lineTo(x, y);
    }
    context.lineTo(width, height + 60);
    context.closePath();
    context.globalAlpha = alpha;
    context.fillStyle = color;
    context.filter = `blur(${thickness}px)`;
    context.fill();
    context.filter = 'none';
  };

  const render = () => {
    frame += 0.026;
    context.clearRect(0, 0, width, height);

    const base = context.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, '#fff2d9');
    base.addColorStop(0.34, '#f7dac7');
    base.addColorStop(0.66, '#e8efff');
    base.addColorStop(1, '#fff3df');
    context.fillStyle = base;
    context.fillRect(0, 0, width, height);

    const glowA = context.createRadialGradient(width * 0.28, height * 0.18, 0, width * 0.28, height * 0.18, width * 0.78);
    glowA.addColorStop(0, 'rgba(255, 229, 184, 0.92)');
    glowA.addColorStop(0.52, 'rgba(255, 196, 160, 0.46)');
    glowA.addColorStop(1, 'rgba(242,221,198,0)');
    context.fillStyle = glowA;
    context.fillRect(0, 0, width, height);

    const glowB = context.createRadialGradient(width * 0.82, height * 0.62, 0, width * 0.82, height * 0.62, width * 0.72);
    glowB.addColorStop(0, 'rgba(188, 217, 255, 0.62)');
    glowB.addColorStop(0.54, 'rgba(255, 194, 222, 0.38)');
    glowB.addColorStop(1, 'rgba(248,221,215,0)');
    context.fillStyle = glowB;
    context.fillRect(0, 0, width, height);

    drawWave(frame * 1.1, '#fff7df', 0.68, 52, 0.16, 18);
    drawWave(frame * 0.82 + 1.9, '#f1bfa9', 0.38, 72, 0.34, 30);
    drawWave(frame * 0.64 + 3.2, '#d9e7ff', 0.44, 82, 0.56, 34);
    drawWave(frame * 1.34 + 4.7, '#f7c6dc', 0.34, 62, 0.76, 28);

    context.globalAlpha = 0.28;
    context.strokeStyle = '#ffffff';
    context.lineWidth = 1;
    for (let i = -height; i < width; i += 34) {
      context.beginPath();
      context.moveTo(i + Math.sin(frame + i) * 5, 0);
      context.lineTo(i + height + Math.sin(frame * 0.8 + i) * 5, height);
      context.stroke();
    }
    context.globalAlpha = 1;

    requestAnimationFrame(render);
  };

  resize();
  window.addEventListener('resize', resize);
  render();
}

function updateTimer() {
  const target = new Date('2026-08-28T13:00:00+03:00').getTime();
  const diff = Math.max(0, target - Date.now());
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000) % 24;
  const minutes = Math.floor(diff / 60000) % 60;
  const seconds = Math.floor(diff / 1000) % 60;
  const values = [days, hours, minutes, seconds].map(v => String(v).padStart(2, '0'));
  document.querySelectorAll('.timer__number').forEach((el, i) => { if (values[i]) el.textContent = values[i]; });
}

function makeCalendar(type) {
  const google = 'https://calendar.google.com/calendar/u/0/r/eventedit?text=%D0%A1%D0%B2%D0%B0%D0%B4%D1%8C%D0%B1%D0%B0&dates=20260828T140000/20260828T200000&details&location';
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
    drinks: valuesForChecked(form, 'answer_3014[]').join(', '),
    arrival_time: textForChecked(form, 'answer_3016')
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
  setupMusic();
  startSilkBackground();
  updateTimer();
  setInterval(updateTimer, 1000);
  const speaker = $('#svd-speaker');
  if (speaker) {
    speaker.classList.add('muted');
  }
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
