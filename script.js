/* Samp Hair & Spa: small, dependency-free enhancements. The page works without this file. */

/**
 * Online booking provider. Paste your Fresha, Square, Vagaro (or similar) booking page URL here and every
 * "Book now" button on the site will open it. Leave it empty to use the built-in booking request form.
 */
const BOOKING_URL = '';

const SALON_EMAIL = 'samphairandspa@gmail.com';
const TIME_ZONE = 'America/Toronto';

/** Opening hours in minutes after midnight, indexed by Date#getDay() (0 = Sunday). */
const HOURS = [
  null,
  { open: 600, close: 1140 },
  { open: 600, close: 1140 },
  { open: 600, close: 1140 },
  { open: 600, close: 1200 },
  { open: 600, close: 1200 },
  { open: 570, close: 1080 },
];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatMinutes(total) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

/** Current weekday, minutes after midnight and yyyy-mm-dd date in the salon's time zone. */
function salonNow(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    day: DAY_NAMES.indexOf(get('weekday')),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
    iso: `${get('year')}-${get('month')}-${get('day')}`,
  };
}

function openingStatus(now) {
  const today = HOURS[now.day];
  if (today && now.minutes >= today.open && now.minutes < today.close) {
    return { open: true, text: `Open now · until ${formatMinutes(today.close)}` };
  }
  if (today && now.minutes < today.open) {
    return { open: false, text: `Closed now · opens today ${formatMinutes(today.open)}` };
  }
  for (let i = 1; i <= 7; i++) {
    const d = (now.day + i) % 7;
    if (HOURS[d]) {
      const when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
      return { open: false, text: `Closed now · opens ${when} ${formatMinutes(HOURS[d].open)}` };
    }
  }
  return { open: false, text: 'Closed now' };
}

function renderStatus() {
  const now = salonNow();
  const status = openingStatus(now);
  document.querySelectorAll('[data-status-text]').forEach((el) => { el.textContent = status.text; });
  document.querySelectorAll('[data-status-dot]').forEach((el) => el.classList.toggle('is-open', status.open));
  document.querySelectorAll('#hours tr').forEach((tr) => tr.classList.toggle('is-today', Number(tr.dataset.day) === now.day));
}

/* ───── Booking links ───── */

function wireBookingLinks() {
  const serviceSelect = document.getElementById('f-service');
  document.querySelectorAll('[data-book]').forEach((link) => {
    if (BOOKING_URL) {
      link.href = BOOKING_URL;
      link.target = '_blank';
      link.rel = 'noopener';
      return;
    }
    link.addEventListener('click', () => {
      const service = link.dataset.service;
      if (service && serviceSelect) serviceSelect.value = service;
    });
  });
}

/* ───── Booking request form ───── */

/** 30-minute start times for a yyyy-mm-dd date; the last start is one hour before closing. */
function slotsFor(iso, now) {
  const day = new Date(`${iso}T12:00:00`).getDay();
  const h = HOURS[day];
  if (!h) return [];
  const earliest = iso === now.iso ? now.minutes + 30 : -1;
  const out = [];
  for (let t = h.open; t <= h.close - 60; t += 30) if (t > earliest) out.push(formatMinutes(t));
  return out;
}

function prettyDate(iso) {
  return new Date(`${iso}T12:00:00`).toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function initBookingForm() {
  const form = document.getElementById('book-form');
  if (!form) return;
  const date = form.elements.date;
  const time = form.elements.time;
  const error = document.getElementById('form-error');
  const done = document.getElementById('form-done');
  const gmail = document.getElementById('gmail-link');

  const now = salonNow();
  date.min = now.iso;
  const max = new Date(`${now.iso}T12:00:00`);
  max.setDate(max.getDate() + 90);
  date.max = max.toISOString().slice(0, 10);

  function fillTimes() {
    time.innerHTML = '';
    if (!date.value) {
      time.disabled = true;
      time.add(new Option('Pick a date first', ''));
      return;
    }
    const slots = slotsFor(date.value, salonNow());
    if (!slots.length) {
      time.disabled = true;
      const closed = !HOURS[new Date(`${date.value}T12:00:00`).getDay()];
      time.add(new Option(closed ? 'Closed this day' : 'No times left today', ''));
      return;
    }
    time.disabled = false;
    time.add(new Option('Choose a time', ''));
    slots.forEach((s) => time.add(new Option(s, s)));
  }
  date.addEventListener('change', fillTimes);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const required = ['service', 'date', 'time', 'name', 'phone'];
    let firstBad = null;
    required.forEach((name) => {
      const el = form.elements[name];
      const bad = !el.value.trim();
      el.setAttribute('aria-invalid', String(bad));
      if (bad && !firstBad) firstBad = el;
    });
    const email = form.elements.email;
    const emailBad = email.value.trim() !== '' && !email.checkValidity();
    email.setAttribute('aria-invalid', String(emailBad));
    if (emailBad && !firstBad) firstBad = email;

    if (firstBad) {
      error.textContent = 'Please fill in the highlighted fields so we can confirm your booking.';
      error.hidden = false;
      firstBad.focus();
      return;
    }
    error.hidden = true;

    const v = (name) => form.elements[name].value.trim();
    const subject = `Appointment request: ${v('service')} on ${prettyDate(v('date'))}`;
    const body = [
      'Hello Samp Hair & Spa,',
      '',
      'I would like to request an appointment:',
      `• Service: ${v('service')}`,
      `• Preferred date: ${prettyDate(v('date'))}`,
      `• Preferred time: ${v('time')}`,
      `• Name: ${v('name')}`,
      `• Phone: ${v('phone')}`,
      ...(v('email') ? [`• Email: ${v('email')}`] : []),
      ...(v('notes') ? [`• Notes: ${v('notes')}`] : []),
      '',
      'Please confirm availability and pricing. Thank you!',
    ].join('\n');

    const enc = encodeURIComponent;
    gmail.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${enc(SALON_EMAIL)}&su=${enc(subject)}&body=${enc(body)}`;
    done.hidden = false;
    window.location.href = `mailto:${SALON_EMAIL}?subject=${enc(subject)}&body=${enc(body)}`;
  });

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true' && e.target.value.trim()) e.target.setAttribute('aria-invalid', 'false');
  });
}

/* ───── Desktop floating "Book now": shown after the hero, hidden while the booking section is on screen ───── */

function initFloatingBook() {
  const btn = document.querySelector('.float-book');
  const hero = document.querySelector('.hero');
  const book = document.getElementById('book');
  if (!btn || !hero || !book || !('IntersectionObserver' in window)) return;
  let pastHero = false;
  let atBook = false;
  const update = () => btn.classList.toggle('is-visible', pastHero && (!atBook || !!BOOKING_URL));
  new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
  new IntersectionObserver(([e]) => { atBook = e.isIntersecting; update(); }, { threshold: 0.2 }).observe(book);
}

document.addEventListener('DOMContentLoaded', () => {
  renderStatus();
  setInterval(renderStatus, 60_000);
  wireBookingLinks();
  initBookingForm();
  initFloatingBook();
  document.querySelectorAll('[data-year]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });
});
