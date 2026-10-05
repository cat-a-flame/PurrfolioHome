// Purrfolio landing site interactions: sticky nav, mobile menu, scroll reveals,
// pointer-follow glow on feature tiles, the theme toggle, and the footer year.
(function () {
  document.documentElement.classList.remove('no-js');

  var nav = document.querySelector('.nav');
  function onScroll() {
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 8);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.querySelector('.nav-toggle');
  var links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

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
  themeBtn.className = 'theme-toggle';
  themeBtn.innerHTML =
    '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>' +
    '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';
  document.body.appendChild(themeBtn);

  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (e) { return null; }
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (themeMeta) themeMeta.setAttribute('content', theme === 'light' ? '#f7f3fe' : '#0a0614');
    themeBtn.setAttribute('aria-label', theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme');
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

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
