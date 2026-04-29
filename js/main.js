// --- Active nav link ---
(function () {
  var page = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__links a, .nav__mobile a').forEach(function (a) {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();

// --- Mobile nav toggle ---
(function () {
  var btn  = document.querySelector('.nav__hamburger');
  var menu = document.querySelector('.nav__mobile');
  if (!btn || !menu) return;
  btn.addEventListener('click', function () {
    var expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    menu.setAttribute('aria-hidden', String(expanded));
    menu.classList.toggle('is-open', !expanded);
  });
  // Close on Escape
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
      btn.setAttribute('aria-expanded', 'false');
      menu.setAttribute('aria-hidden', 'true');
      menu.classList.remove('is-open');
      btn.focus();
    }
  });
})();

// --- Testimonial Carousel ---
(function () {
  document.querySelectorAll('.carousel').forEach(function (el) {
    var track = el.querySelector('.carousel__track');
    if (!track) return;
    var cards = Array.from(track.children);
    if (!cards.length) return;

    var prevBtn = el.querySelector('.carousel__btn--prev');
    var nextBtn = el.querySelector('.carousel__btn--next');
    var dotsEl  = el.querySelector('.carousel__dots');
    var idx = 0;
    var raf;

    function cols() {
      if (window.innerWidth < 640)  return 1;
      if (window.innerWidth < 1024) return 2;
      return 3;
    }
    function maxIdx() { return Math.max(0, cards.length - cols()); }

    function layout(animate) {
      var gap = 24;
      var containerW = track.parentElement.offsetWidth;
      var c = cols();
      var cardW = (containerW - gap * (c - 1)) / c;
      cards.forEach(function (card) { card.style.minWidth = cardW + 'px'; });
      go(idx, animate === false ? false : true);
    }

    function buildDots() {
      if (!dotsEl) return;
      dotsEl.innerHTML = '';
      var max = maxIdx();
      for (var i = 0; i <= max; i++) {
        (function (i) {
          var dot = document.createElement('button');
          dot.className = 'carousel__dot' + (i === 0 ? ' active' : '');
          dot.setAttribute('aria-label', 'Show testimonial group ' + (i + 1));
          dot.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
          dot.addEventListener('click', function () { go(i); });
          dotsEl.appendChild(dot);
        })(i);
      }
    }

    function go(newIdx, animate) {
      idx = Math.max(0, Math.min(newIdx, maxIdx()));
      var cardW = cards[0].offsetWidth + 24;
      if (animate === false) {
        track.style.transition = 'none';
        track.style.transform = 'translateX(-' + (idx * cardW) + 'px)';
        track.offsetHeight; // force reflow
        track.style.transition = '';
      } else {
        track.style.transform = 'translateX(-' + (idx * cardW) + 'px)';
      }
      if (dotsEl) {
        dotsEl.querySelectorAll('.carousel__dot').forEach(function (d, i) {
          d.classList.toggle('active', i === idx);
          d.setAttribute('aria-pressed', String(i === idx));
        });
      }
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { go(idx - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { go(idx + 1); });

    el.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); go(idx - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1); }
    });

    window.addEventListener('resize', function () {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        buildDots();
        layout(false);
      });
    });

    buildDots();
    layout(false);
  });
})();

// --- Safety Checklist ---
(function () {
  var widget = document.querySelector('.checklist-widget');
  if (!widget) return;

  var questions    = widget.querySelectorAll('.checklist-question');
  var progressFill = widget.querySelector('.checklist-progress__fill');
  var progressLbl  = widget.querySelector('.checklist-progress__label');
  var resultEl     = widget.querySelector('.checklist-result');
  var retakeBtn    = widget.querySelector('.js-retake');
  var answers      = new Array(questions.length).fill(null);

  var CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>';
  var CROSS_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" width="16" height="16" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';

  function updateProgress() {
    var answered = answers.filter(function (a) { return a !== null; }).length;
    var pct = (answered / questions.length) * 100;
    if (progressFill) progressFill.style.width = pct + '%';
    if (progressLbl)  progressLbl.textContent = answered + ' of ' + questions.length + ' answered';
    if (answered === questions.length) showResult();
    else if (resultEl) resultEl.className = 'checklist-result';
  }

  function showResult() {
    if (!resultEl) return;
    var yes = answers.filter(function (a) { return a === true; }).length;
    var level, label, text;
    if (yes <= 2) {
      level = 'green';
      label = 'Your Home Looks Good';
      text  = 'Your home looks good! Schedule a routine inspection to stay ahead of any issues.';
    } else if (yes <= 5) {
      level = 'yellow';
      label = 'Some Items Need Attention';
      text  = 'Some items need attention. We recommend scheduling a safety inspection soon.';
    } else {
      level = 'red';
      label = 'Potential Safety Concerns Detected';
      text  = 'Your home may have serious electrical safety concerns. Call us today — don\'t wait.';
    }
    resultEl.className = 'checklist-result visible checklist-result--' + level;
    var scoreEl = resultEl.querySelector('.checklist-result__score');
    var labelEl = resultEl.querySelector('.checklist-result__label');
    var textEl  = resultEl.querySelector('.checklist-result__text');
    var callBtn = resultEl.querySelector('.js-call-btn');
    if (scoreEl) scoreEl.textContent = yes + '/10';
    if (labelEl) labelEl.textContent = label;
    if (textEl)  textEl.textContent  = text;
    if (callBtn) callBtn.style.display = level === 'red' ? 'inline-flex' : 'none';
    resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  questions.forEach(function (q, i) {
    var yesBtn  = q.querySelector('.checklist-btn.yes');
    var noBtn   = q.querySelector('.checklist-btn.no');
    var statusEl = q.querySelector('.checklist-question__status');

    function setAnswer(val) {
      answers[i] = val;
      if (yesBtn) yesBtn.classList.toggle('selected', val === true);
      if (noBtn)  noBtn.classList.toggle('selected',  val === false);
      if (statusEl) {
        statusEl.innerHTML = val ? CROSS_SVG : CHECK_SVG;
        statusEl.className = 'checklist-question__status visible ' + (val ? 'risk' : 'safe');
        statusEl.setAttribute('aria-label', val ? 'Risk item' : 'Safe');
      }
      updateProgress();
    }

    if (yesBtn) yesBtn.addEventListener('click', function () { setAnswer(true);  });
    if (noBtn)  noBtn.addEventListener('click',  function () { setAnswer(false); });
  });

  if (retakeBtn) {
    retakeBtn.addEventListener('click', function () {
      answers.fill(null);
      questions.forEach(function (q) {
        q.querySelectorAll('.checklist-btn').forEach(function (b) { b.classList.remove('selected'); });
        var s = q.querySelector('.checklist-question__status');
        if (s) { s.innerHTML = ''; s.className = 'checklist-question__status'; s.removeAttribute('aria-label'); }
      });
      if (progressFill) progressFill.style.width = '0%';
      if (progressLbl)  progressLbl.textContent = '0 of ' + questions.length + ' answered';
      if (resultEl) resultEl.className = 'checklist-result';
      widget.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  updateProgress();
})();

// --- Contact form client-side validation ---
(function () {
  var form = document.querySelector('.contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      var err = document.getElementById(field.id + '-error');
      if (!field.value.trim()) {
        field.setAttribute('aria-invalid', 'true');
        if (err) err.classList.add('visible');
        valid = false;
      } else {
        field.setAttribute('aria-invalid', 'false');
        if (err) err.classList.remove('visible');
      }
    });
    if (!valid) {
      e.preventDefault();
      var first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
    }
  });

  form.querySelectorAll('[required]').forEach(function (field) {
    field.addEventListener('input', function () {
      var err = document.getElementById(field.id + '-error');
      if (field.value.trim()) {
        field.setAttribute('aria-invalid', 'false');
        if (err) err.classList.remove('visible');
      }
    });
  });
})();
