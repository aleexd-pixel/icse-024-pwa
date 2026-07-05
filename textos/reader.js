/* ═══════════════════════════════════════════════════════════
   READER.JS — Dopamine-optimized reading engine
   10 features: chunking, celebrations, bionic, streak,
   chapter cards, sounds, position memory, highlights,
   inserts, haptics
   ═══════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // ── CONFIG ──
  var WORDS_PER_CHUNK = 300;
  var INSERT_EVERY_MIN = 3;
  var INSERT_EVERY_MAX = 5;
  var ARTICLE_ID = window.location.pathname.replace(/[^a-z0-9]/gi, '_');

  // ── REWARDS (variable ratio) ──
  var REWARDS = [
    { type: 'visual', text: 'Una idea más en tu cabeza', emoji: '\uD83E\uDDE0' },
    { type: 'haptic', pattern: [50], text: null },
    { type: 'visual', text: 'Este párrafo es clave', emoji: '\uD83D\uDD11' },
    { type: 'haptic', pattern: [30, 50, 30], text: null },
    { type: 'visual', text: 'Dato para el parcial', emoji: '\uD83C\uDFAF' },
    { type: 'visual', text: 'Seguí así', emoji: '\u2192' },
    { type: 'haptic', pattern: [20], text: null },
    { type: 'visual', text: 'Ya pasaste la mitad', emoji: '\uD83C\uDFD4\uFE0F' },
  ];
  var rewardIndex = 0;

  // ── INSERTS (interleaved content) ──
  var INSERTS = [
    { type: 'question', content: '\u00BFPodr\u00EDas explicarle esto a un compa\u00F1ero en 2 oraciones?', action: 'textarea' },
    { type: 'fact', content: 'Esto que acab\u00E1s de leer es la base de muchos debates en ciencias sociales.', action: 'none' },
    { type: 'question', content: '\u00BFQu\u00E9 pasar\u00EDa si esto fuera al rev\u00E9s?', action: 'none' },
    { type: 'recall', content: 'Sin mirar arriba: \u00BFCu\u00E1les son las ideas principales que viste hasta ahora?', action: 'textarea' },
    { type: 'connection', content: 'Esto conecta con otros temas de la carrera \u2014 \u00BFves por qu\u00E9?', action: 'none' },
    { type: 'question', content: '\u00BFC\u00F3mo aplicar\u00EDas esto en un an\u00E1lisis real?', action: 'textarea' },
  ];

  // ── HAPTICS ──
  var Haptic = {
    tap: function() { if (navigator.vibrate) navigator.vibrate(10); },
    confirm: function() { if (navigator.vibrate) navigator.vibrate(25); },
    milestone: function() { if (navigator.vibrate) navigator.vibrate([40, 30, 40]); },
    celebrate: function() { if (navigator.vibrate) navigator.vibrate([30, 50, 30, 50, 60]); },
  };

  // ── SOUND ENGINE (Web Audio API) ──
  var SoundEngine = {
    ctx: null,
    enabled: false,
    init: function() {
      try {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
        this.enabled = true;
      } catch(e) {}
    },
    tick: function() {
      if (!this.enabled || !this.ctx) return;
      var osc = this.ctx.createOscillator();
      var gain = this.ctx.createGain();
      osc.connect(gain); gain.connect(this.ctx.destination);
      osc.frequency.value = 880; osc.type = 'sine';
      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);
      osc.start(); osc.stop(this.ctx.currentTime + 0.12);
    },
    milestone: function() {
      if (!this.enabled || !this.ctx) return;
      var freqs = [523, 659, 784];
      freqs.forEach(function(f, i) {
        var osc = this.ctx.createOscillator();
        var gain = this.ctx.createGain();
        osc.connect(gain); gain.connect(this.ctx.destination);
        osc.frequency.value = f; osc.type = 'sine';
        var t = this.ctx.currentTime + i * 0.12;
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        osc.start(t); osc.stop(t + 0.4);
      }.bind(this));
    },
    ambient: null,
    toggleAmbient: function() {
      if (!this.enabled || !this.ctx) return;
      if (this.ambient) {
        this.ambient.source.stop();
        this.ambient = null;
        return false;
      }
      var bufferSize = 2 * this.ctx.sampleRate;
      var buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      var data = buffer.getChannelData(0);
      var lastOut = 0;
      for (var i = 0; i < bufferSize; i++) {
        var white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }
      var source = this.ctx.createBufferSource();
      var gain = this.ctx.createGain();
      source.buffer = buffer; source.loop = true;
      gain.gain.value = 0.025;
      source.connect(gain); gain.connect(this.ctx.destination);
      source.start();
      this.ambient = { source: source, gain: gain };
      return true;
    }
  };

  // Initialize sound on first interaction
  document.addEventListener('click', function() {
    if (!SoundEngine.ctx) SoundEngine.init();
  }, { once: true });

  // ── TOAST SYSTEM ──
  function showToast(text, emoji) {
    var toast = document.createElement('div');
    toast.className = 'milestone-toast';
    toast.innerHTML = '<span>' + (emoji || '') + '</span> <span>' + text + '</span>';
    document.body.appendChild(toast);
    requestAnimationFrame(function() { toast.classList.add('visible'); });
    setTimeout(function() {
      toast.classList.remove('visible');
      setTimeout(function() { toast.remove(); }, 300);
    }, 2200);
  }

  // ── MILESTONE OVERLAY ──
  function showMilestoneOverlay(pct) {
    var messages = {
      25:  { title: 'Un cuarto',       sub: 'Ya arrancaste, lo dif\u00EDcil era eso' },
      50:  { title: 'Mitad recorrida',  sub: 'El que llega ac\u00E1, llega al final' },
      75:  { title: 'Tres cuartos',     sub: 'Ya pod\u00E9s ver la l\u00EDnea de meta' },
      100: { title: 'Texto terminado',  sub: 'Eso no se lo saca nadie' },
    };
    var msg = messages[pct];
    if (!msg) return;

    Haptic.milestone();
    SoundEngine.milestone();

    var overlay = document.createElement('div');
    overlay.className = 'milestone-overlay';
    overlay.innerHTML =
      '<div class="milestone-pct">' + pct + '%</div>' +
      '<div class="milestone-title">' + msg.title + '</div>' +
      '<div class="milestone-sub">' + msg.sub + '</div>' +
      '<button class="milestone-dismiss">Seguir leyendo</button>';
    document.body.appendChild(overlay);

    requestAnimationFrame(function() { overlay.classList.add('visible'); });

    overlay.querySelector('.milestone-dismiss').addEventListener('click', function() {
      overlay.classList.remove('visible');
      setTimeout(function() { overlay.remove(); }, 400);
    });

    // Auto-dismiss after 3s
    setTimeout(function() {
      if (overlay.parentNode) {
        overlay.classList.remove('visible');
        setTimeout(function() { overlay.remove(); }, 400);
      }
    }, 3000);
  }

  // ── VARIABLE REWARD ──
  function triggerReward(chunkIdx, totalChunks) {
    var pct = Math.round((chunkIdx / totalChunks) * 100);
    var reward = REWARDS[rewardIndex % REWARDS.length];
    rewardIndex++;

    if (reward.type === 'haptic') {
      if (navigator.vibrate) navigator.vibrate(reward.pattern);
    } else if (reward.type === 'visual' && reward.text) {
      showToast(reward.text, reward.emoji);
    }

    if ([25, 50, 75, 100].includes(pct)) {
      showMilestoneOverlay(pct);
      try { localStorage.setItem('milestone_' + ARTICLE_ID + '_' + pct, Date.now()); } catch(e) {}
    }
  }

  // ═══════════════════════════════════════
  // FEATURE 1: CHUNKING
  // ═══════════════════════════════════════
  function chunkContent(articleEl, wordsPerChunk) {
    wordsPerChunk = wordsPerChunk || WORDS_PER_CHUNK;
    var allElements = articleEl.querySelectorAll('p, h2, h3, h4, blockquote, ul, ol, table');
    var chunks = [];
    var currentChunk = document.createElement('div');
    currentChunk.className = 'reading-chunk';
    var wordCount = 0;

    allElements.forEach(function(el) {
      var elWords = el.textContent.split(/\s+/).length;
      if (el.tagName && el.tagName.match(/^H[2-4]$/) && wordCount > 50) {
        chunks.push(currentChunk);
        currentChunk = document.createElement('div');
        currentChunk.className = 'reading-chunk';
        wordCount = 0;
      }
      currentChunk.appendChild(el.cloneNode(true));
      wordCount += elWords;
      if (wordCount >= wordsPerChunk) {
        chunks.push(currentChunk);
        currentChunk = document.createElement('div');
        currentChunk.className = 'reading-chunk';
        wordCount = 0;
      }
    });
    if (currentChunk.childNodes.length > 0) chunks.push(currentChunk);
    return chunks;
  }

  // ═══════════════════════════════════════
  // FEATURE 3: BIONIC READING
  // ═══════════════════════════════════════
  function applyBionicReading(container) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode: function(node) {
        if (node.parentElement.closest('.no-bionic, code, pre, .chapter-overview, .resume-banner, .insert, .chunk-capture, .metadatos, .separador, footer, .notas'))
          return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);

    textNodes.forEach(function(node) {
      var words = node.textContent.split(/(\s+)/);
      var fragment = document.createDocumentFragment();
      words.forEach(function(word) {
        if (/^\s+$/.test(word)) { fragment.appendChild(document.createTextNode(word)); return; }
        var boldLen = Math.max(1, Math.ceil(word.length * 0.4));
        var bold = document.createElement('span');
        bold.className = 'bionic-bold';
        bold.textContent = word.slice(0, boldLen);
        fragment.appendChild(bold);
        fragment.appendChild(document.createTextNode(word.slice(boldLen)));
      });
      node.parentNode.replaceChild(fragment, node);
    });
  }

  function removeBionicReading(container) {
    container.querySelectorAll('.bionic-bold').forEach(function(span) {
      var text = document.createTextNode(span.textContent);
      span.parentNode.replaceChild(text, span);
    });
    container.normalize();
  }

  // ═══════════════════════════════════════
  // FEATURE 4: STREAK + SESSION TIMER
  // ═══════════════════════════════════════
  var sessionSeconds = 0;
  var sessionInterval = null;

  function updateStreak() {
    try {
      var today = new Date().toISOString().split('T')[0];
      var data = JSON.parse(localStorage.getItem('reading_streak') || '{}');
      if (data.lastDate === today) return;
      var yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (data.lastDate === yesterday) {
        data.count = (data.count || 0) + 1;
      } else {
        data.count = 1;
      }
      data.lastDate = today;
      data.totalMinutes = (data.totalMinutes || 0) + Math.round(sessionSeconds / 60);
      data.totalArticles = (data.totalArticles || 0) + 1;
      localStorage.setItem('reading_streak', JSON.stringify(data));
      updateStreakBadge(data.count);
    } catch(e) {}
  }

  function updateStreakBadge(count) {
    var badge = document.querySelector('.nav-streak');
    if (badge && count > 0) {
      badge.textContent = count + '\u2605';
      badge.style.display = '';
    }
  }

  function loadStreak() {
    try {
      var data = JSON.parse(localStorage.getItem('reading_streak') || '{}');
      if (data.count > 0) updateStreakBadge(data.count);
    } catch(e) {}
  }

  function startSessionTimer() {
    var timerEl = document.getElementById('sessionTimer');
    if (!timerEl) return;
    sessionInterval = setInterval(function() {
      sessionSeconds++;
      var m = Math.floor(sessionSeconds / 60);
      var s = sessionSeconds % 60;
      timerEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      if (sessionSeconds > 0 && sessionSeconds % 300 === 0) {
        showToast(m + ' minutos de lectura', '\u23F1\uFE0F');
        Haptic.confirm();
      }
    }, 1000);
  }

  function stopSessionTimer() {
    if (sessionInterval) clearInterval(sessionInterval);
  }

  // ═══════════════════════════════════════
  // FEATURE 5: CHAPTER CARDS (overview)
  // ═══════════════════════════════════════
  function buildChapterCards(articleEl) {
    var headings = articleEl.querySelectorAll('h2');
    if (headings.length < 2) return null;

    var overview = document.createElement('div');
    overview.className = 'chapter-overview';

    // Extract title and author from metadatos
    var tituloEl = articleEl.closest('.page') ? articleEl.closest('.page').querySelector('.titulo-texto') : null;
    var autorEl = articleEl.closest('.page') ? articleEl.closest('.page').querySelector('.autor') : null;
    var title = tituloEl ? tituloEl.textContent : '';
    var author = autorEl ? autorEl.textContent : '';

    var header = document.createElement('div');
    header.className = 'overview-header';
    header.innerHTML =
      '<span class="overview-est">' + headings.length + ' secciones</span>';
    overview.appendChild(header);

    if (title) {
      var titleEl = document.createElement('div');
      titleEl.className = 'overview-title';
      titleEl.textContent = title;
      overview.appendChild(titleEl);
    }
    if (author) {
      var authorEl = document.createElement('div');
      authorEl.className = 'overview-author';
      authorEl.textContent = author;
      overview.appendChild(authorEl);
    }

    headings.forEach(function(h2, i) {
      var nextP = h2.nextElementSibling;
      var preview = '';
      if (nextP && nextP.tagName === 'P') {
        preview = nextP.textContent.slice(0, 80) + '...';
      }
      var card = document.createElement('button');
      card.className = 'chapter-card';
      card.innerHTML =
        '<span class="chapter-num">' + (i < 9 ? '0' : '') + (i + 1) + '</span>' +
        '<span class="chapter-title">' + h2.textContent + '</span>' +
        '<span class="chapter-preview">' + preview + '</span>';
      card.addEventListener('click', function() {
        h2.scrollIntoView({ behavior: 'smooth' });
      });
      overview.appendChild(card);
    });

    var startBtn = document.createElement('button');
    startBtn.className = 'chapter-start-btn';
    startBtn.textContent = 'Empezar a leer \u2192';
    startBtn.addEventListener('click', function() {
      var firstChunk = document.querySelector('.reading-chunk');
      if (firstChunk) firstChunk.scrollIntoView({ behavior: 'smooth' });
    });
    overview.appendChild(startBtn);

    return overview;
  }

  // ═══════════════════════════════════════
  // FEATURE 7: POSITION MEMORY + RESUME
  // ═══════════════════════════════════════
  function savePosition(container, chunks) {
    var scrollTop = container.scrollTop;
    var containerH = container.clientHeight;
    var currentChunk = 0;
    chunks.forEach(function(chunk, i) {
      if (chunk.offsetTop <= scrollTop + containerH * 0.3) currentChunk = i;
    });
    var pct = Math.round((currentChunk / chunks.length) * 100);
    try {
      localStorage.setItem('position_' + ARTICLE_ID, JSON.stringify({
        chunkIndex: currentChunk,
        scrollTop: scrollTop,
        timestamp: Date.now(),
        percentRead: pct,
      }));
    } catch(e) {}
  }

  function offerResume(container) {
    try {
      var saved = JSON.parse(localStorage.getItem('position_' + ARTICLE_ID));
      if (!saved || saved.percentRead < 5) return false;

      var minutesAgo = Math.round((Date.now() - saved.timestamp) / 60000);
      var timeText = minutesAgo < 60 ? 'hace ' + minutesAgo + ' min' : 'hace ' + Math.round(minutesAgo / 60) + 'hs';

      var banner = document.createElement('div');
      banner.className = 'resume-banner';
      banner.innerHTML =
        '<div class="resume-pct">' + saved.percentRead + '%</div>' +
        '<div class="resume-hint">Le\u00EDste hasta la secci\u00F3n ' + (saved.chunkIndex + 1) + '</div>' +
        '<div class="resume-time">' + timeText + '</div>' +
        '<button class="resume-btn" id="resumeBtn">Continuar donde quedaste</button>' +
        '<button class="restart-btn" id="restartBtn">Desde el inicio</button>';

      container.prepend(banner);

      document.getElementById('resumeBtn').addEventListener('click', function() {
        var chunks = container.querySelectorAll('.reading-chunk');
        if (chunks[saved.chunkIndex]) {
          chunks[saved.chunkIndex].scrollIntoView({ behavior: 'smooth' });
        }
        banner.remove();
      });
      document.getElementById('restartBtn').addEventListener('click', function() {
        banner.remove();
      });
      return true;
    } catch(e) { return false; }
  }

  // ═══════════════════════════════════════
  // FEATURE 8: HIGHLIGHT + ANNOTATE
  // ═══════════════════════════════════════
  function addChunkCapture(chunk, chunkIndex) {
    var prompt = document.createElement('div');
    prompt.className = 'chunk-capture';
    prompt.innerHTML =
      '<div class="capture-question">\u00BFCu\u00E1l es la idea central de este tramo?</div>' +
      '<div class="capture-actions">' +
      '<button class="capture-highlight">Subrayar en el texto</button>' +
      '<button class="capture-skip">Continuar \u2192</button>' +
      '</div>';
    chunk.appendChild(prompt);

    var highlightBtn = prompt.querySelector('.capture-highlight');
    var skipBtn = prompt.querySelector('.capture-skip');
    var captureQ = prompt.querySelector('.capture-question');

    highlightBtn.addEventListener('click', function() {
      chunk.classList.add('highlight-mode');
      captureQ.textContent = 'Seleccion\u00E1 el texto que quieras subrayar';
      highlightBtn.style.display = 'none';

      function handler() {
        var selection = window.getSelection();
        if (!selection || !selection.toString().trim()) return;
        var range = selection.getRangeAt(0);
        var span = document.createElement('mark');
        span.className = 'user-highlight';
        try { range.surroundContents(span); } catch(e) { return; }
        saveHighlight(ARTICLE_ID, chunkIndex, selection.toString());
        Haptic.confirm();
        SoundEngine.tick();
        selection.removeAllRanges();
        captureQ.textContent = '\u00A1Subrayado! Pod\u00E9s seguir seleccionando';
      }
      chunk.addEventListener('mouseup', handler);
    });

    skipBtn.addEventListener('click', function() {
      prompt.style.opacity = '0.5';
      captureQ.textContent = 'Pod\u00E9s volver cuando quieras';
    });
  }

  function saveHighlight(articleId, chunkIndex, text) {
    try {
      var highlights = JSON.parse(localStorage.getItem('highlights_' + articleId) || '[]');
      highlights.push({ chunk: chunkIndex, text: text.trim(), timestamp: Date.now() });
      localStorage.setItem('highlights_' + articleId, JSON.stringify(highlights));
    } catch(e) {}
  }

  // ═══════════════════════════════════════
  // FEATURE 9: INSERTS (interleaved)
  // ═══════════════════════════════════════
  function addInserts(chunks) {
    var insertEvery = INSERT_EVERY_MIN + Math.floor(Math.random() * (INSERT_EVERY_MAX - INSERT_EVERY_MIN + 1));
    var insertIndex = 0;
    chunks.forEach(function(chunk, i) {
      if (i > 0 && i % insertEvery === 0 && insertIndex < INSERTS.length) {
        var ins = INSERTS[insertIndex];
        var el = document.createElement('div');
        el.className = 'insert insert-' + ins.type;
        el.innerHTML =
          '<span class="insert-label">' + (ins.type === 'question' ? 'Pregunta' : ins.type === 'recall' ? 'Recall' : ins.type === 'fact' ? 'Dato' : 'Conexi\u00F3n') + '</span>' +
          '<p class="insert-content">' + ins.content + '</p>';
        if (ins.action === 'textarea') {
          var textarea = document.createElement('textarea');
          textarea.className = 'insert-input';
          textarea.placeholder = 'Escrib\u00ED tu respuesta (no se eval\u00FAa, es para fijar)...';
          el.appendChild(textarea);
        }
        chunk.appendChild(el);
        insertIndex++;
        // Re-randomize interval for next insert
        insertEvery = INSERT_EVERY_MIN + Math.floor(Math.random() * (INSERT_EVERY_MAX - INSERT_EVERY_MIN + 1));
      }
    });
  }

  // ═══════════════════════════════════════
  // FEATURE 10: HAPTIC INTEGRATION
  // ═══════════════════════════════════════
  function initHaptics(chunks, totalChunks) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var idx = parseInt(entry.target.dataset.chunkIndex);
          Haptic.tap();
          triggerReward(idx, totalChunks);
        }
      });
    }, { threshold: 0.5 });
    chunks.forEach(function(chunk) { observer.observe(chunk); });
  }

  // ═══════════════════════════════════════
  // INIT — MAIN ENTRY POINT
  // ═══════════════════════════════════════
  window.ReaderApp = {
    init: function() {
      var contenido = document.querySelector('.contenido');
      if (!contenido) return;

      // 1. Create reading container
      var container = document.createElement('div');
      container.className = 'reading-container';

      // 2. Chapter cards (overview)
      var overview = buildChapterCards(contenido);
      if (overview) container.appendChild(overview);

      // 3. Chunk the content
      var chunks = chunkContent(contenido, WORDS_PER_CHUNK);
      var totalChunks = chunks.length;

      chunks.forEach(function(chunk, i) {
        chunk.dataset.chunkIndex = i;
        // Add captures to last chunk
        if (i === totalChunks - 1) {
          addChunkCapture(chunk, i);
        }
        container.appendChild(chunk);
      });

      // 4. Inserts
      addInserts(chunks);

      // Replace contenido with container
      contenido.style.display = 'none';
      var page = contenido.closest('.page') || contenido.parentNode;
      page.insertBefore(container, contenido.nextSibling);

      // 5. Resume banner
      var hasResume = offerResume(container);

      // 6. Progress bar
      var bar = document.getElementById('progressBar');
      container.addEventListener('scroll', function() {
        var h = container.scrollHeight - container.clientHeight;
        var pct = h > 0 ? (container.scrollTop / h) * 100 : 0;
        if (bar) bar.style.width = pct + '%';
      });

      // 7. Position memory (debounced save)
      var saveTimeout;
      container.addEventListener('scroll', function() {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(function() { savePosition(container, chunks); }, 500);
      });

      // 8. Scroll to top
      var scrollBtn = document.getElementById('scrollTopBtn');
      if (scrollBtn) {
        container.addEventListener('scroll', function() {
          scrollBtn.classList.toggle('visible', container.scrollTop > 300);
        });
        scrollBtn.addEventListener('click', function() {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        });
      }

      // 9. Section dots
      var h2s = contenido.querySelectorAll('h2');
      var dotsContainer = document.getElementById('sectionDots');
      if (dotsContainer && h2s.length > 1) {
        dotsContainer.classList.add('visible');
        // Re-map h2s to be inside chunks
        var chunkH2s = [];
        chunks.forEach(function(chunk) {
          chunk.querySelectorAll('h2').forEach(function(h2) { chunkH2s.push(h2); });
        });
        for (var d = 0; d < chunkH2s.length; d++) {
          var dot = document.createElement('div');
          dot.className = 'section-dot';
          dot.dataset.idx = d;
          dot.addEventListener('click', function() {
            chunkH2s[parseInt(this.dataset.idx)].scrollIntoView({ behavior: 'smooth' });
          });
          dotsContainer.appendChild(dot);
        }
        var allDots = dotsContainer.querySelectorAll('.section-dot');
        container.addEventListener('scroll', function() {
          var scrollY = container.scrollTop + 120;
          var active = 0;
          chunkH2s.forEach(function(h, i) {
            if (h.offsetTop <= scrollY) active = i;
          });
          allDots.forEach(function(d, idx) {
            d.classList.toggle('active', idx === active);
          });
        });
      }

      // 10. Reveal animation
      var reveals = contenido.querySelectorAll('h2, h3, blockquote');
      var revealObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(e) {
          if (e.isIntersecting) {
            e.target.classList.add('visible');
            revealObserver.unobserve(e.target);
          }
        });
      }, { root: container, threshold: 0.1 });
      reveals.forEach(function(el) { revealObserver.observe(el); });

      // 11. Haptics + rewards
      initHaptics(chunks, totalChunks);

      // 12. Session timer + streak
      startSessionTimer();
      updateStreak();
      loadStreak();

      // 13. Save streak on page unload
      window.addEventListener('beforeunload', function() {
        updateStreak();
        stopSessionTimer();
      });

      // 14. Bionic toggle
      var bionicBtn = document.getElementById('bionicToggle');
      if (bionicBtn) {
        bionicBtn.addEventListener('click', function() {
          document.body.classList.toggle('bionic-mode');
          var isActive = document.body.classList.contains('bionic-mode');
          bionicBtn.classList.toggle('active', isActive);
          try { localStorage.setItem('bionic_' + ARTICLE_ID, isActive); } catch(e) {}
          if (isActive) {
            applyBionicReading(container);
          } else {
            removeBionicReading(container);
          }
        });
        // Restore preference
        try {
          if (localStorage.getItem('bionic_' + ARTICLE_ID) === 'true') {
            document.body.classList.add('bionic-mode');
            bionicBtn.classList.add('active');
            setTimeout(function() { applyBionicReading(container); }, 100);
          }
        } catch(e) {}
      }

      // 15. Sound toggle
      var soundBtn = document.getElementById('soundToggle');
      if (soundBtn) {
        soundBtn.addEventListener('click', function() {
          if (!SoundEngine.ctx) SoundEngine.init();
          var isOn = SoundEngine.toggleAmbient();
          soundBtn.classList.toggle('active', isOn);
        });
      }

      // 16. Reading complete toast
      var toastEl = document.getElementById('readingToast');
      if (toastEl) {
        var shown = false;
        container.addEventListener('scroll', function() {
          if (shown) return;
          var h = container.scrollHeight - container.clientHeight;
          if (h > 0 && (container.scrollTop / h) > 0.95) {
            shown = true;
            toastEl.classList.add('show');
            Haptic.celebrate();
            setTimeout(function() { toastEl.classList.remove('show'); }, 3000);
          }
        });
      }
    }
  };

  // Auto-init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { window.ReaderApp.init(); });
  } else {
    window.ReaderApp.init();
  }
})();
