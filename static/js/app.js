/* ═══════════════════════════════════════════
   GovPrep India — Main JavaScript
   ═══════════════════════════════════════════ */

'use strict';

// ─── Theme ───────────────────────────────────
const Theme = {
  key: 'govprep_theme',
  init() {
    const saved = localStorage.getItem(this.key) || 'dark';
    this.apply(saved);
  },
  apply(mode) {
    document.body.classList.toggle('light', mode === 'light');
    localStorage.setItem(this.key, mode);
    const btn = document.getElementById('themeBtn');
    if (btn) btn.textContent = mode === 'light' ? '🌙' : '☀️';
  },
  toggle() {
    const current = localStorage.getItem(this.key) || 'dark';
    this.apply(current === 'dark' ? 'light' : 'dark');
  }
};

// ─── Navbar ──────────────────────────────────
const Nav = {
  init() {
    const burger = document.getElementById('hamburger');
    const mobileNav = document.getElementById('mobileNav');
    if (burger && mobileNav) {
      burger.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });
    }
    // Mark active link
    const links = document.querySelectorAll('.nav-links a, .mobile-nav a');
    links.forEach(link => {
      if (link.href === window.location.href) link.classList.add('active');
    });
  }
};

// ─── Toast ───────────────────────────────────
function showToast(msg, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  if (type === 'success') toast.style.borderColor = 'rgba(42,157,143,0.4)';
  if (type === 'error') toast.style.borderColor = 'rgba(230,57,70,0.4)';
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ─── Progress Tracker ────────────────────────
const Tracker = {
  key: 'govprep_progress',
  load() {
    return JSON.parse(localStorage.getItem(this.key) || '{"quizzes":[],"totalScore":0,"totalQs":0,"streak":0,"lastDate":""}');
  },
  save(data) {
    localStorage.setItem(this.key, JSON.stringify(data));
  },
  recordQuiz(score, total, date) {
    const data = this.load();
    data.quizzes.unshift({ score, total, date, pct: Math.round((score / total) * 100) });
    if (data.quizzes.length > 20) data.quizzes.pop();
    data.totalScore += score;
    data.totalQs += total;
    // Streak
    const today = new Date().toDateString();
    if (data.lastDate !== today) {
      const last = new Date(data.lastDate);
      const diff = (new Date(today) - last) / 86400000;
      if (diff <= 1.5) data.streak = (data.streak || 0) + 1;
      else data.streak = 1;
      data.lastDate = today;
    }
    this.save(data);
    return data;
  },
  render() {
    const data = this.load();
    const el = id => document.getElementById(id);
    if (el('stat-quizzes')) el('stat-quizzes').textContent = data.quizzes.length;
    if (el('stat-avg')) {
      const avg = data.totalQs > 0 ? Math.round((data.totalScore / data.totalQs) * 100) : 0;
      el('stat-avg').textContent = avg + '%';
    }
    if (el('stat-streak')) el('stat-streak').textContent = (data.streak || 0) + ' 🔥';
    if (el('stat-total-score')) el('stat-total-score').textContent = data.totalScore;

    // History table
    const tbody = el('historyBody');
    if (tbody) {
      if (data.quizzes.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--text3);padding:24px">No quizzes attempted yet. Take a quiz to see your progress!</td></tr>';
      } else {
        tbody.innerHTML = data.quizzes.map((q, i) => `
          <tr>
            <td>#${i + 1}</td>
            <td>${q.score} / ${q.total}</td>
            <td><span class="tag ${q.pct >= 70 ? 'tag-green' : q.pct >= 40 ? 'tag-orange' : 'tag-red'}">${q.pct}%</span></td>
            <td>${q.date}</td>
          </tr>
        `).join('');
      }
    }
  },
  clear() {
    if (confirm('Are you sure you want to reset all your progress?')) {
      localStorage.removeItem(this.key);
      this.render();
      showToast('Progress reset!', 'info');
    }
  }
};

// ─── Quiz Engine ─────────────────────────────
const Quiz = {
  questions: [],
  current: 0,
  selected: [],
  submitted: false,
  startTime: null,
  timerInterval: null,
  elapsed: 0,

  async load() {
    const res = await fetch('/api/quiz');
    const data = await res.json();
    this.questions = data.questions;
    this.selected = new Array(this.questions.length).fill(null);
    this.startTime = Date.now();
    this.startTimer();
    this.render();
  },

  startTimer() {
    this.timerInterval = setInterval(() => {
      this.elapsed = Math.floor((Date.now() - this.startTime) / 1000);
      const el = document.getElementById('timer');
      if (el) el.textContent = this.formatTime(this.elapsed);
    }, 1000);
  },

  formatTime(s) {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  },

  render() {
    const wrap = document.getElementById('quizWrap');
    if (!wrap) return;
    if (this.current >= this.questions.length) { this.showResult(); return; }
    const q = this.questions[this.current];
    const labels = ['A', 'B', 'C', 'D'];
    const sel = this.selected[this.current];

    wrap.innerHTML = `
      <div class="quiz-header-bar">
        <div class="quiz-counter">Question <span>${this.current + 1}</span> of ${this.questions.length}</div>
        <div style="display:flex;align-items:center;gap:16px">
          <div class="quiz-timer">⏱ <span id="timer">${this.formatTime(this.elapsed)}</span></div>
          <div style="font-size:0.8rem;color:var(--text3)">${this.answered()} answered</div>
        </div>
      </div>
      <div class="question-card">
        <div class="question-header">
          <div>
            <div class="question-num">Question ${this.current + 1}</div>
            <div style="font-size:0.82rem;color:var(--text2);margin-top:2px">${q.subject}</div>
          </div>
          <span class="tag tag-blue">${q.subject}</span>
        </div>
        <div class="question-text">${q.question}</div>
        <div class="options-grid">
          ${q.options.map((opt, i) => `
            <button class="option-btn ${sel === i ? 'selected' : ''}"
              onclick="Quiz.select(${i})" ${this.submitted ? 'disabled' : ''}>
              <span class="option-label">${labels[i]}</span>
              ${opt}
            </button>
          `).join('')}
        </div>
        <div class="explanation-box ${this.submitted ? 'show' : ''}" id="explanBox">
          <strong>💡 Explanation:</strong> ${q.explanation}
        </div>
        <div class="quiz-nav">
          <button class="btn btn-ghost btn-sm" onclick="Quiz.prev()" ${this.current === 0 ? 'disabled style="opacity:0.4"' : ''}>← Prev</button>
          <div style="display:flex;gap:8px">
            ${!this.submitted ? `<button class="btn btn-outline btn-sm" onclick="Quiz.submitOne()">Check Answer</button>` : ''}
            ${this.current < this.questions.length - 1
              ? `<button class="btn btn-primary btn-sm" onclick="Quiz.next()">Next →</button>`
              : `<button class="btn btn-primary btn-sm" onclick="Quiz.finish()">Finish Quiz ✓</button>`}
          </div>
        </div>
      </div>
      ${this.renderDots()}
    `;
    // Re-apply timer
    document.getElementById('timer').textContent = this.formatTime(this.elapsed);
    // Apply answer colors if submitted
    if (this.submitted) this.colorOptions(q);
  },

  renderDots() {
    return `
      <div style="display:flex;gap:6px;justify-content:center;margin-top:16px;flex-wrap:wrap">
        ${this.questions.map((_, i) => {
          let color = 'var(--surface2)';
          if (this.selected[i] !== null) color = 'var(--accent)';
          if (i === this.current) color = 'var(--accent-blue)';
          return `<div onclick="Quiz.goto(${i})" style="width:28px;height:28px;border-radius:6px;background:${color};cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.7rem;font-weight:700;color:${i===this.current?'#000':'var(--text2)'}";transition:all 0.15s>${i + 1}</div>`;
        }).join('')}
      </div>
    `;
  },

  colorOptions(q) {
    const btns = document.querySelectorAll('.option-btn');
    const sel = this.selected[this.current];
    btns.forEach((btn, i) => {
      if (i === q.answer) btn.classList.add('correct');
      else if (i === sel && sel !== q.answer) btn.classList.add('wrong');
    });
  },

  answered() { return this.selected.filter(s => s !== null).length; },

  select(i) {
    if (this.submitted) return;
    this.selected[this.current] = i;
    this.submitted = false;
    this.render();
  },

  submitOne() {
    if (this.selected[this.current] === null) { showToast('Please select an answer first!'); return; }
    this.submitted = true;
    this.render();
  },

  next() { this.submitted = false; this.current++; this.render(); },
  prev() { this.submitted = false; this.current--; this.render(); },
  goto(i) { this.submitted = false; this.current = i; this.render(); },

  finish() {
    clearInterval(this.timerInterval);
    const score = this.questions.reduce((acc, q, i) => acc + (this.selected[i] === q.answer ? 1 : 0), 0);
    this.showResult(score);
  },

  showResult(score) {
    if (score === undefined) {
      score = this.questions.reduce((acc, q, i) => acc + (this.selected[i] === q.answer ? 1 : 0), 0);
    }
    clearInterval(this.timerInterval);
    const total = this.questions.length;
    const pct = Math.round((score / total) * 100);
    const date = new Date().toLocaleDateString('en-IN');
    Tracker.recordQuiz(score, total, date);

    let grade = 'Excellent! 🏆'; let gradeClass = 'grade-excellent';
    if (pct < 70) { grade = 'Good effort! 👍'; gradeClass = 'grade-good'; }
    if (pct < 50) { grade = 'Keep practicing! 📚'; gradeClass = 'grade-average'; }
    if (pct < 30) { grade = 'More practice needed! 💪'; gradeClass = 'grade-poor'; }

    const wrap = document.getElementById('quizWrap');
    wrap.innerHTML = `
      <div class="quiz-result">
        <div style="font-size:3rem;margin-bottom:16px">🎯</div>
        <div class="result-score">${score}<span class="out-of"> / ${total}</span></div>
        <div class="result-label">${pct}% Accuracy • Time: ${this.formatTime(this.elapsed)}</div>
        <div class="result-grade ${gradeClass}">${grade}</div>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-bottom:40px">
          <button class="btn btn-primary" onclick="Quiz.restart()">🔄 Retake Quiz</button>
          <button class="btn btn-outline" onclick="window.location.href='/notes'">📚 Study Notes</button>
        </div>
        ${this.renderReviewSection()}
      </div>
    `;
    // Save to leaderboard
    this.saveScore(score, total);
  },

  renderReviewSection() {
    return `
      <div style="text-align:left;margin-top:24px;border-top:1px solid var(--border);padding-top:24px">
        <h3 style="margin-bottom:16px;font-size:1rem">Question Review</h3>
        ${this.questions.map((q, i) => {
          const correct = this.selected[i] === q.answer;
          const icon = correct ? '✅' : '❌';
          return `
            <div style="padding:12px;border-radius:8px;background:var(--surface2);margin-bottom:10px;border:1px solid var(--border)">
              <div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:8px">
                <span>${icon}</span>
                <div style="font-size:0.88rem;font-weight:600">${i+1}. ${q.question}</div>
              </div>
              ${!correct ? `<div style="font-size:0.8rem;color:var(--accent3);padding-left:22px">Correct: ${q.options[q.answer]}</div>` : ''}
              <div style="font-size:0.8rem;color:var(--text3);padding-left:22px;margin-top:4px">${q.explanation}</div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  },

  async saveScore(score, total) {
    const name = localStorage.getItem('govprep_name') || 'Anonymous';
    try {
      await fetch('/api/submit-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, score, total })
      });
      loadLeaderboard();
    } catch (e) { console.warn('Could not save score', e); }
  },

  restart() {
    this.current = 0;
    this.selected = new Array(this.questions.length).fill(null);
    this.submitted = false;
    this.elapsed = 0;
    this.startTime = Date.now();
    this.startTimer();
    this.render();
  }
};

// ─── Leaderboard ─────────────────────────────
async function loadLeaderboard() {
  const el = document.getElementById('leaderboardList');
  if (!el) return;
  try {
    const res = await fetch('/api/leaderboard');
    const data = await res.json();
    const rankClasses = ['gold', 'silver', 'bronze'];
    el.innerHTML = data.leaderboard.slice(0, 10).map((entry, i) => `
      <div class="leaderboard-row">
        <div class="lb-rank ${rankClasses[i] || ''}">${i + 1}</div>
        <div class="lb-name">${entry.name}</div>
        <div class="lb-score">${entry.score}/${entry.total}</div>
        <div class="lb-date">${entry.date}</div>
      </div>
    `).join('') || '<div style="color:var(--text3);text-align:center;padding:24px">No scores yet. Be the first!</div>';
  } catch (e) {
    el.innerHTML = '<div style="color:var(--text3);text-align:center">Could not load leaderboard.</div>';
  }
}

// ─── Notes ───────────────────────────────────
const Notes = {
  current: 'All',
  search: '',
  modal: null,

  async load(subject = 'All', search = '') {
    this.current = subject;
    this.search = search;
    const grid = document.getElementById('notesGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading notes...</div>';
    try {
      const params = new URLSearchParams();
      if (subject !== 'All') params.append('subject', subject);
      if (search) params.append('search', search);
      const res = await fetch('/api/notes?' + params);
      const data = await res.json();
      if (data.notes.length === 0) {
        grid.innerHTML = '<div class="empty-state"><div class="icon">📭</div><p>No notes found.</p></div>';
        return;
      }
      grid.innerHTML = data.notes.map(note => this.renderCard(note)).join('');
    } catch (e) {
      grid.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Error loading notes.</p></div>';
    }
  },

  subjectColors: {
    'Reasoning': '#4cc9f0',
    'Quantitative Aptitude': '#f7b731',
    'English': '#e63946',
    'General Awareness': '#2a9d8f'
  },

  difficultyTag: {
    'Easy': 'tag-green',
    'Medium': 'tag-orange',
    'Hard': 'tag-red'
  },

  renderCard(note) {
    const color = this.subjectColors[note.subject] || 'var(--accent)';
    return `
      <div class="note-card" style="--note-color:${color}">
        <div class="note-header">
          <div class="note-topic">${note.topic}</div>
          <span class="tag ${this.difficultyTag[note.difficulty] || 'tag-blue'}">${note.difficulty}</span>
        </div>
        <div class="note-subject-badge" style="margin-bottom:10px">${note.subject}</div>
        <div class="note-content">${note.content}</div>
        ${note.formula ? `<div class="note-formula">📐 ${note.formula}</div>` : ''}
        <ul class="note-keypoints">
          ${(note.key_points || []).slice(0, 3).map(kp => `<li>${kp}</li>`).join('')}
        </ul>
        <button class="note-expand-btn" onclick='Notes.openModal(${JSON.stringify(note).replace(/'/g, "&#39;")})'>
          Read Full Note →
        </button>
      </div>
    `;
  },

  openModal(note) {
    const color = this.subjectColors[note.subject] || 'var(--accent)';
    const overlay = document.getElementById('noteModal');
    overlay.innerHTML = `
      <div class="modal" onclick="event.stopPropagation()">
        <div class="modal-header">
          <div>
            <div style="font-size:0.72rem;color:${color};font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin-bottom:4px">${note.subject}</div>
            <h2 style="font-size:1.3rem">${note.topic}</h2>
            <span class="tag ${this.difficultyTag[note.difficulty] || 'tag-blue'}" style="margin-top:8px;display:inline-flex">${note.difficulty}</span>
          </div>
          <button class="modal-close" onclick="Notes.closeModal()">✕</button>
        </div>
        <div class="modal-body">
          <h4 style="margin-bottom:8px;color:var(--text3);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em">Overview</h4>
          <p style="font-size:0.95rem;color:var(--text2);line-height:1.7;margin-bottom:24px">${note.content}</p>
          ${note.formula ? `
            <h4 style="margin-bottom:8px;color:var(--text3);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em">Formula</h4>
            <div class="note-formula" style="margin-bottom:24px">📐 ${note.formula}</div>
          ` : ''}
          <h4 style="margin-bottom:12px;color:var(--text3);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em">Key Points</h4>
          <ul class="note-keypoints" style="margin-bottom:24px">
            ${(note.key_points || []).map(kp => `<li>${kp}</li>`).join('')}
          </ul>
          ${note.example ? `
            <h4 style="margin-bottom:8px;color:var(--text3);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em">Example</h4>
            <div style="background:var(--bg2);border:1px solid var(--border);border-radius:8px;padding:14px 16px;font-size:0.88rem;color:var(--text2);line-height:1.7">${note.example}</div>
          ` : ''}
        </div>
      </div>
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('noteModal').classList.remove('open');
    document.body.style.overflow = '';
  }
};

// ─── Videos ──────────────────────────────────
const Videos = {
  async load(category = 'All') {
    const grid = document.getElementById('videosGrid');
    if (!grid) return;
    grid.innerHTML = '<div class="loading"><div class="spinner"></div> Loading videos...</div>';
    try {
      const params = category !== 'All' ? `?category=${category}` : '';
      const res = await fetch('/api/videos' + params);
      const data = await res.json();
      grid.innerHTML = data.videos.map(v => `
        <div class="video-card">
          <div class="video-thumb">
            <img src="${v.thumbnail}" alt="${v.title}" loading="lazy" onerror="this.src='https://via.placeholder.com/480x270/1e2230/636b82?text=Video'">
            <div class="video-play-btn" onclick="Videos.play('${v.youtube_id}', '${v.title.replace(/'/g,"&#39;")}')">
              <div class="play-icon">▶</div>
            </div>
            <div class="video-duration">${v.duration}</div>
          </div>
          <div class="video-body">
            <div class="video-title">${v.title}</div>
            <div class="video-channel">📺 ${v.channel}</div>
            <div style="display:flex;gap:8px;align-items:center">
              <span class="tag tag-blue">${v.category}</span>
              <button class="video-watch-btn" onclick="Videos.play('${v.youtube_id}', '${v.title.replace(/'/g,"&#39;")}')">▶ Watch</button>
            </div>
          </div>
        </div>
      `).join('');
    } catch (e) {
      grid.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>Could not load videos.</p></div>';
    }
  },

  play(id, title) {
    const overlay = document.getElementById('videoModal');
    overlay.innerHTML = `
      <div class="modal" style="max-width:800px;width:100%" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3 style="font-size:1rem;max-width:600px">${title}</h3>
          <button class="modal-close" onclick="Videos.closeModal()">✕</button>
        </div>
        <div class="video-modal-body">
          <iframe src="https://www.youtube.com/embed/${id}?autoplay=1" allowfullscreen allow="autoplay"></iframe>
        </div>
      </div>
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('videoModal').classList.remove('open');
    document.body.style.overflow = '';
  }
};

// ─── PYQ (previous year questions) ──────────
function initPYQ() {
  document.querySelectorAll('.pyq-option').forEach(btn => {
    btn.addEventListener('click', function() {
      const card = this.closest('.pyq-card');
      if (card.dataset.answered) return;
      card.dataset.answered = 'true';
      const correctIdx = parseInt(card.dataset.answer);
      const allBtns = card.querySelectorAll('.pyq-option');
      allBtns.forEach((b, i) => {
        b.disabled = true;
        if (i === correctIdx) b.classList.add('pyq-correct');
        else if (b === this) b.classList.add('pyq-wrong');
      });
    });
  });
}

// ─── Name Prompt ─────────────────────────────
function promptName() {
  const existing = localStorage.getItem('govprep_name');
  if (!existing) {
    const name = prompt('Enter your name for the leaderboard (optional):');
    if (name && name.trim()) localStorage.setItem('govprep_name', name.trim().slice(0, 30));
  }
}

// ─── Init ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  Theme.init();
  Nav.init();

  const themeBtn = document.getElementById('themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', () => Theme.toggle());

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', function(e) {
      if (e.target === this) {
        this.classList.remove('open');
        document.body.style.overflow = '';
        // Stop any video playing
        const iframe = this.querySelector('iframe');
        if (iframe) iframe.src = '';
      }
    });
  });

  // Page-specific inits
  const page = document.body.dataset.page;

  if (page === 'quiz') {
    promptName();
    Quiz.load();
    loadLeaderboard();
  }

  if (page === 'notes') {
    Notes.load();
  }

  if (page === 'videos') {
    Videos.load();
  }

  if (page === 'progress') {
    Tracker.render();
  }

  if (page === 'exam-detail') {
    initPYQ();
  }
});
