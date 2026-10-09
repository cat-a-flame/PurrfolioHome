// Purrfolio landing site interactions: sticky nav, scroll reveals,
// pointer-follow glow on feature tiles, the theme toggle, the phone preview tab bar, the footer year,
// and a couple of cat-shaped easter eggs.
(function () {
  document.documentElement.classList.remove('no-js');

  var nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  document.querySelectorAll('.tile').forEach(function (tile) {
    tile.addEventListener('pointermove', function (e) {
      var r = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      tile.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  // Theme toggle: the inline head script sets data-theme from the saved choice
  // or the system preference; an explicit choice here is remembered.
  var root = document.documentElement;
  var themeMeta = document.querySelector('meta[name="theme-color"]');
  var systemLight = window.matchMedia ? window.matchMedia('(prefers-color-scheme: light)') : null;
  var themeBtn = document.createElement('button');
  themeBtn.type = 'button';
  themeBtn.className = 'theme-switch';
  themeBtn.setAttribute('role', 'switch');
  themeBtn.setAttribute('aria-label', 'Dark mode');
  themeBtn.innerHTML =
    '<span class="ts-track" aria-hidden="true">' +
      '<span class="ts-stars"><i></i><i></i><i></i><i></i><i></i></span>' +
      '<span class="ts-clouds"><i></i><i></i></span>' +
      '<span class="ts-knob"><i></i><i></i><i></i></span>' +
    '</span>';
  document.body.appendChild(themeBtn);

  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f7f3fe' : '#0a0614');
    themeBtn.setAttribute('aria-checked', String(theme === 'dark'));
  }
  applyTheme(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  themeBtn.addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    applyTheme(next);
    try { localStorage.setItem('theme', next); } catch (e) {}
  });
  if (systemLight) {
    var onSystemChange = function (e) {
      if (!savedTheme()) applyTheme(e.matches ? 'light' : 'dark');
    };
    if (systemLight.addEventListener) systemLight.addEventListener('change', onSystemChange);
    else if (systemLight.addListener) systemLight.addListener(onSystemChange);
  }

  // Phone preview tab bar: the app's pill outline with a notch for the add
  // button (CustomTabBar.tsx), scaled to the preview and redrawn on resize.
  var pill = document.querySelector('.app-pill');
  if (pill) {
    var k = 44 / 56;
    var R = 24 * k, NR = 36 * k, NC = 12 * k;
    var drawPill = function () {
      var w = pill.clientWidth, h = pill.clientHeight, cx = w / 2;
      if (!w) return;
      pill.setAttribute('viewBox', '0 0 ' + w + ' ' + h);
      pill.firstChild.setAttribute('d', [
        'M 0 ' + R, 'A ' + R + ' ' + R + ' 0 0 1 ' + R + ' 0',
        'L ' + (cx - NR - NC) + ' 0', 'Q ' + (cx - NR) + ' 0 ' + (cx - NR) + ' ' + NC,
        'A ' + NR + ' ' + NR + ' 0 1 0 ' + (cx + NR) + ' ' + NC,
        'Q ' + (cx + NR) + ' 0 ' + (cx + NR + NC) + ' 0',
        'L ' + (w - R) + ' 0', 'A ' + R + ' ' + R + ' 0 0 1 ' + w + ' ' + R,
        'L ' + w + ' ' + (h - R), 'A ' + R + ' ' + R + ' 0 0 1 ' + (w - R) + ' ' + h,
        'L ' + R + ' ' + h, 'A ' + R + ' ' + R + ' 0 0 1 0 ' + (h - R), 'Z'
      ].join(' '));
    };
    drawPill();
    if ('ResizeObserver' in window) new ResizeObserver(drawPill).observe(pill);
    else window.addEventListener('resize', drawPill);
  }

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  // Paw prints trail the mouse across the page. Kept cheap: one passive
  // listener, a print only every 44px of travel, an opacity-only fade, and at
  // most 20 prints alive at once. Skipped for touch and reduced motion.
  if (window.matchMedia && matchMedia('(pointer: fine)').matches &&
      !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var lastX = null, lastY = 0, step = 0, live = 0;
    document.addEventListener('pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      if (lastX === null) { lastX = e.clientX; lastY = e.clientY; return; }
      var dx = e.clientX - lastX, dy = e.clientY - lastY;
      if (dx * dx + dy * dy < 44 * 44 || live >= 20) return;
      var angle = Math.atan2(dy, dx), side = step++ % 2 ? 7 : -7;
      var x = e.clientX - Math.sin(angle) * side, y = e.clientY + Math.cos(angle) * side;
      var paw = document.createElement('span');
      paw.className = 'paw-print';
      paw.setAttribute('aria-hidden', 'true');
      paw.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (angle * 180 / Math.PI + 90) + 'deg)';
      paw.addEventListener('animationend', function () { paw.remove(); live--; });
      document.body.appendChild(paw);
      live++;
      lastX = e.clientX; lastY = e.clientY;
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { lastX = null; });
  }

  // A hello for anyone who opens the dev tools.
  if (window.console && console.log) {
    console.log('%c🐾 Curious cat, huh?', 'font: 700 16px Nunito, sans-serif; color: #a78bfa');
    console.log("We're hiring… just kidding, it's just me. Say hi at purrfolioapp@proton.me");
  }
})();
