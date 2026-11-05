/**
 * MindMetric AI frontend
 * Vanilla JavaScript, no dependencies.
 * Sections: config, helpers, icons, form options, toasts, theme, navigation,
 * scroll reveal, ripple, particles, validation, results, submit, 404 view.
 */
'use strict';

(() => {
  /* ============================== Config ============================== */

  // Same-origin when served by FastAPI; local API if the file is opened directly.
  const API_URL = location.protocol === 'file:' ? 'http://127.0.0.1:8000' : '';
  const SCORE_MAX = 10;              // the model returns a score out of 10
  const GAUGE_LENGTH = 377;          // circumference of the gauge circle (r = 60)
  const MIN_LOADING_MS = 1800;       // keeps the loading messages readable
  const LOADING_MESSAGES = ['Analyzing lifestyle...', 'Running AI model...', 'Generating prediction...'];

  const COUNTRIES = ['India', 'USA', 'Canada', 'Australia', 'UK', 'Germany', 'Mexico', 'Turkey', 'France', 'Other'];
  const PLATFORMS = ['Facebook', 'Instagram', 'Twitter', 'LinkedIn', 'Snapchat', 'TikTok', 'LINE', 'KakaoTalk', 'VKontakte', 'WhatsApp', 'WeChat'];

  // Validation rules: [min, max, error message]
  const RULES = {
    age: [15, 60, 'Age must be between 15 and 60.'],
    avg_daily_usage_hours: [0, 24, 'Enter hours between 0 and 24.'],
    daily_unlocks: [0, 500, 'Enter unlocks between 0 and 500.'],
    study_hours: [0, 24, 'Enter hours between 0 and 24.'],
    sleep_hours_per_night: [0, 24, 'Enter hours between 0 and 24.'],
    physical_activity_hours: [0, 24, 'Enter hours between 0 and 24.'],
  };

  // Result tiers, checked from highest to lowest.
  const TIERS = [
    {
      min: 9, tag: 'Excellent', color: '#34D399',
      title: 'Outstanding mental well-being',
      desc: 'This lifestyle profile points to very strong mental health.',
      recs: [
        'Keep your current sleep and activity routine. It is clearly working.',
        'Protect your balance during exams or busy weeks.',
        'Share your habits with friends who may be struggling.',
        'Check in with yourself monthly to stay ahead of changes.',
      ],
    },
    {
      min: 7, tag: 'Good', color: '#A78BFA',
      title: 'Healthy and mostly balanced',
      desc: 'Habits look healthy, with a little room to improve.',
      recs: [
        'Aim for 7 to 9 hours of sleep on a regular schedule.',
        'Add short walks or exercise on most days.',
        'Set screen-free windows, such as the hour before bed.',
        'Take real breaks between study blocks.',
      ],
    },
    {
      min: 5, tag: 'Moderate', color: '#FBBF24',
      title: 'Some areas need attention',
      desc: 'A few habits may be affecting well-being. Small changes can help quickly.',
      recs: [
        'Cut social media time by 30 minutes a day and notice the difference.',
        'Fix your sleep first. Fixed wake-up times help most.',
        'Try 20 minutes of daily movement, even a brisk walk.',
        'Talk to a friend, mentor or counselor about your workload.',
      ],
    },
    {
      min: -Infinity, tag: 'Needs attention', color: '#F87171',
      title: 'Support could make a real difference',
      desc: 'This profile suggests high strain. Consider reaching out for support.',
      recs: [
        'Speak with a campus counselor or a mental health professional.',
        'Tell someone you trust how you have been feeling.',
        'Prioritize sleep and reduce late-night phone use.',
        'Cut back on commitments where you can, and ask for extensions if needed.',
      ],
    },
  ];

  /* ============================== Helpers ============================== */

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;

  /* ============================== Icons ============================== */

  const ICON_PATHS = {
    brain: '<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1zM15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>',
    moon: '<path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    up: '<path d="M12 19V5M5 12l7-7 7 7"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    phone: '<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>',
    heart: '<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    spark: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  };

  const iconSvg = (name) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[name]}</svg>`;

  $$('[data-i]').forEach((el) => { el.innerHTML = iconSvg(el.dataset.i); });

  /* ============================== Form options ============================== */

  function addOptions(selector, items) {
    $(selector).insertAdjacentHTML('beforeend', items.map((item) => `<option>${item}</option>`).join(''));
  }
  addOptions('#country', COUNTRIES);
  addOptions('#most_used_platform', PLATFORMS);

  /* ============================== Toasts ============================== */

  function showToast(message, type = 'info', duration = 4200) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    $('#toasts').appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ============================== Theme ============================== */

  const themeButton = $('#theme');

  function setTheme(theme) {
    root.dataset.theme = theme;
    themeButton.innerHTML = iconSvg(theme === 'dark' ? 'moon' : 'sun');
    try { localStorage.setItem('theme', theme); } catch (_) { /* storage may be blocked */ }
  }

  let savedTheme = null;
  try { savedTheme = localStorage.getItem('theme'); } catch (_) { /* ignore */ }
  setTheme(savedTheme || 'dark');
  themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

  /* ============================== Navigation ============================== */

  const navBar = $('#nav');
  const navLinks = $('#links');
  const progressBar = $('#progress');
  const backToTop = $('#totop');

  function onScroll() {
    const scrollable = root.scrollHeight - innerHeight;
    progressBar.style.width = `${scrollable > 0 ? (scrollY / scrollable) * 100 : 0}%`;
    navBar.classList.toggle('solid', scrollY > 30);
    backToTop.classList.toggle('show', scrollY > 600);
  }

  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
  $('#menu').addEventListener('click', () => navLinks.classList.toggle('open'));
  navLinks.addEventListener('click', (e) => {
    if (e.target.tagName === 'A') navLinks.classList.remove('open');
  });

  /* ============================== Scroll reveal ============================== */

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  $$('.sec').forEach((section) => {
    section.classList.add('reveal');
    revealObserver.observe(section);
  });

  /* ============================== Button ripple ============================== */

  document.addEventListener('click', (e) => {
    const button = e.target.closest('.ripple');
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('i');
    ripple.style.cssText =
      `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
    button.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });

  /* ============================== Particles ============================== */

  function startParticles() {
    if (prefersReducedMotion) return;

    const canvas = $('#particles');
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
      width = canvas.width = innerWidth;
      height = canvas.height = innerHeight;
      const count = Math.min(70, Math.floor(width / 18));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = root.dataset.theme === 'dark' ? 'rgba(196,181,253,.65)' : 'rgba(124,58,237,.45)';
      for (const p of particles) {
        p.x = (p.x + p.vx + width) % width;
        p.y = (p.y + p.vy + height) % height;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(draw);
    }

    resize();
    addEventListener('resize', resize);
    draw();
  }
  startParticles();

  /* ============================== Validation ============================== */

  const form = $('#form');
  const fields = $$('input, select', form);

  function setFieldError(field, message) {
    const wrapper = field.closest('.f');
    wrapper.classList.toggle('err', Boolean(message));
    $('small', wrapper).textContent = message || '';
    field.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function validateField(field) {
    const value = field.value.trim();

    if (!value) { setFieldError(field, 'This field is required.'); return false; }

    const rule = RULES[field.name];
    if (rule && (Number.isNaN(Number(value)) || Number(value) < rule[0] || Number(value) > rule[1])) {
      setFieldError(field, rule[2]);
      return false;
    }
    if (field.name === 'age' && !Number.isInteger(Number(value))) {
      setFieldError(field, 'Age must be a whole number.');
      return false;
    }

    setFieldError(field, '');
    return true;
  }

  fields.forEach((field) => {
    field.addEventListener('blur', () => { if (field.value) validateField(field); });
    field.addEventListener('input', () => {
      if (field.closest('.f').classList.contains('err')) validateField(field);
    });
    if (field.tagName === 'SELECT') {
      field.addEventListener('change', () => {
        field.closest('.f').classList.add('has');
        validateField(field);
      });
    }
  });

  $('#reset').addEventListener('click', () => {
    form.reset();
    fields.forEach((field) => {
      setFieldError(field, '');
      field.closest('.f').classList.remove('has');
    });
    $('#result').hidden = true;
  });

  /* ============================== Results ============================== */

  /** Extra tips based on the person's own answers (max 2). */
  function personalTips(data) {
    const tips = [];
    if (Number(data.sleep_hours_per_night) < 7) {
      tips.push(`You sleep ${data.sleep_hours_per_night}h a night. Moving toward 7 to 8h is the biggest single upgrade.`);
    }
    if (Number(data.avg_daily_usage_hours) > 5) {
      tips.push(`${data.avg_daily_usage_hours}h of daily social media is high. Try app timers on ${data.most_used_platform}.`);
    }
    if (Number(data.physical_activity_hours) < 0.5) {
      tips.push('Very little physical activity. Even 15 minutes a day lifts mood.');
    }
    if (['High', 'Very High'].includes(data.stress_level)) {
      tips.push('Your stress is high. Try breathing exercises or a regular wind-down routine.');
    }
    return tips.slice(0, 2);
  }

  /** Animates the score number from 0 to its final value. */
  function animateCounter(element, target) {
    if (prefersReducedMotion) { element.textContent = target.toFixed(2); return; }

    const duration = 1600;
    const start = performance.now();

    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = (target * eased).toFixed(2);
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function showResult(score, inputs) {
    const tier = TIERS.find((t) => score >= t.min);
    const percent = (Math.max(0, Math.min(SCORE_MAX, score)) / SCORE_MAX) * 100;
    const result = $('#result');

    result.hidden = false;
    result.style.setProperty('--tc', tier.color);

    $('#tag').textContent = tier.tag;
    $('#rtitle').textContent = tier.title;
    $('#rdesc').textContent = tier.desc;
    $('#recs').innerHTML = [...tier.recs, ...personalTips(inputs)]
      .map((text, i) => `<li style="animation-delay:${i * 0.08}s">${text}</li>`)
      .join('');

    // Reset the gauge, then fill it on the next frames so the transition plays.
    const bar = $('#bar');
    bar.style.strokeDashoffset = GAUGE_LENGTH;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      bar.style.strokeDashoffset = GAUGE_LENGTH * (1 - percent / 100);
    }));

    animateCounter($('#score'), score);
    result.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
  }

  /* ============================== Submit ============================== */

  const submitButton = $('#predict');
  const submitLabel = $('.lbl', submitButton);
  const overlay = $('#overlay');
  const overlayMessage = $('#ovmsg');

  /** Builds the JSON body with the number types FastAPI expects. */
  function buildPayload(raw) {
    return {
      ...raw,
      age: parseInt(raw.age, 10),
      daily_unlocks: parseInt(raw.daily_unlocks, 10),
      avg_daily_usage_hours: parseFloat(raw.avg_daily_usage_hours),
      study_hours: parseFloat(raw.study_hours),
      physical_activity_hours: parseFloat(raw.physical_activity_hours),
      sleep_hours_per_night: parseFloat(raw.sleep_hours_per_night),
    };
  }

  /** Turns a failed response into a readable message. */
  async function readError(response) {
    try {
      const body = await response.json();
      if (Array.isArray(body.detail)) {
        return body.detail.map((d) => `${d.loc[d.loc.length - 1]}: ${d.msg}`).join('; ');
      }
      if (body.detail) return body.detail;
    } catch (_) { /* response was not JSON */ }
    return `Server returned ${response.status}`;
  }

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle('loading', isLoading);
    submitLabel.textContent = isLoading ? 'Predicting...' : 'Predict mental health score';
    overlay.hidden = !isLoading;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const allValid = fields.map(validateField).every(Boolean);
    if (!allValid) {
      showToast('Please fix the highlighted fields.', 'error');
      const firstInvalid = $('.f.err input, .f.err select');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const raw = Object.fromEntries(new FormData(form));
    const payload = buildPayload(raw);

    const dailyHours = payload.study_hours + payload.sleep_hours_per_night + payload.physical_activity_hours;
    if (dailyHours > 24) {
      showToast('Study, sleep and activity hours add up to more than 24.', 'error');
      return;
    }

    setLoading(true);
    let messageIndex = 0;
    overlayMessage.textContent = LOADING_MESSAGES[0];
    const messageTimer = setInterval(() => {
      messageIndex = (messageIndex + 1) % LOADING_MESSAGES.length;
      overlayMessage.textContent = LOADING_MESSAGES[messageIndex];
      overlayMessage.style.animation = 'none';
      void overlayMessage.offsetHeight; // restart the fade animation
      overlayMessage.style.animation = '';
    }, 900);

    try {
      const [response] = await Promise.all([
        fetch(`${API_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        wait(MIN_LOADING_MS),
      ]);

      if (!response.ok) throw new Error(await readError(response));

      const data = await response.json();
      const score = Number(data.predicted_mental_health_score);
      if (!Number.isFinite(score)) throw new Error('Unexpected response from the model.');

      showResult(score, raw);
      showToast('Prediction ready.', 'success');
    } catch (error) {
      const message = error instanceof TypeError
        ? 'Cannot reach the API. Check that FastAPI is running.'
        : error.message;
      showToast(message, 'error', 6000);
    } finally {
      clearInterval(messageTimer);
      setLoading(false);
    }
  });

  /* ============================== 404 view ============================== */

  if (new URLSearchParams(location.search).get('e') === '404') {
    $('#notfound').hidden = false;
    $('#app').hidden = true;
    document.title = '404 · MindMetric AI';
  }
})();