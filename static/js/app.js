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
    'Quant': '#f7b731',
    'English': '#e63946',
    'GK': '#2a9d8f'
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

        <!-- ✅ FIXED HERE -->
        <div class="note-content">${note.overview || "No overview available"}</div>

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

          <!-- ✅ FIXED HERE -->
          <p style="font-size:0.95rem;color:var(--text2);line-height:1.7;margin-bottom:24px">
            ${note.overview || "No overview available"}
          </p>

          <h4 style="margin-bottom:12px;color:var(--text3);font-size:0.78rem;text-transform:uppercase;letter-spacing:0.06em">Key Points</h4>
          <ul class="note-keypoints" style="margin-bottom:24px">
            ${(note.key_points || []).map(kp => `<li>${kp}</li>`).join('')}
          </ul>
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