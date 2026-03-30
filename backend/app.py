"""
GovPrep India - Flask Backend
Run: python app.py
"""

from flask import Flask, render_template, jsonify, request, session, redirect, url_for
import json
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = 'govprep_secret_2025_change_this'

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# ── Change this password! ──
ADMIN_PASSWORD = 'govprep@admin123'

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if not session.get('admin_logged_in'):
            return redirect('/admin/login')
        return f(*args, **kwargs)
    return decorated

# ─── Page Routes ─────────────────────────────────────────────

@app.route('/')
def home():
    exams = load_json('exams.json')
    notifications = load_json('notifications.json')['notifications']
    return render_template('index.html', exams=exams, notifications=notifications)

@app.route('/exams')
def exams():
    exams = load_json('exams.json')
    return render_template('exams.html', exams=exams)

@app.route('/exam/<exam_id>')
def exam_detail(exam_id):
    exams = load_json('exams.json')
    exam = exams.get(exam_id)
    if not exam:
        return "Exam not found", 404
    return render_template('exam_detail.html', exam=exam)

@app.route('/notes')
def notes():
    return render_template('notes.html')

@app.route('/quiz')
def quiz():
    return render_template('quiz.html')

@app.route('/videos')
def videos():
    return render_template('videos.html')

@app.route('/progress')
def progress():
    return render_template('progress.html')

# ─── Admin Routes ─────────────────────────────────────────────

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        password = request.form.get('password', '')
        if password == ADMIN_PASSWORD:
            session['admin_logged_in'] = True
            return redirect('/admin')
        return render_template('admin_login.html', error='Galat password! Dobara try karo.')
    return render_template('admin_login.html', error=None)

@app.route('/admin/logout')
def admin_logout():
    session.pop('admin_logged_in', None)
    return redirect('/')

@app.route('/admin')
@admin_required
def admin_dashboard():
    return render_template('admin.html')

# ─── Admin API: Quiz ──────────────────────────────────────────

@app.route('/admin/api/add-quiz', methods=['POST'])
@admin_required
def admin_add_quiz():
    data = load_json('quiz.json')
    body = request.get_json()
    new_id = max((q['id'] for q in data['daily']), default=0) + 1
    question = {
        'id': new_id,
        'subject': body.get('subject', 'General Awareness'),
        'question': body.get('question', '').strip(),
        'options': body.get('options', []),
        'answer': int(body.get('answer', 0)),
        'explanation': body.get('explanation', '').strip()
    }
    if not question['question'] or len(question['options']) != 4:
        return jsonify({'status': 'error', 'error': 'Invalid data'})
    data['daily'].append(question)
    save_json('quiz.json', data)
    return jsonify({'status': 'ok', 'id': new_id})

@app.route('/admin/api/delete-quiz/<int:qid>', methods=['DELETE'])
@admin_required
def admin_delete_quiz(qid):
    data = load_json('quiz.json')
    data['daily'] = [q for q in data['daily'] if q['id'] != qid]
    save_json('quiz.json', data)
    return jsonify({'status': 'ok'})

# ─── Admin API: Notes ─────────────────────────────────────────

@app.route('/admin/api/add-note', methods=['POST'])
@admin_required
def admin_add_note():
    data = load_json('notes.json')
    body = request.get_json()
    new_id = max((n['id'] for n in data['notes']), default=0) + 1
    note = {
        'id': new_id,
        'subject': body.get('subject', 'General Awareness'),
        'topic': body.get('topic', '').strip(),
        'difficulty': body.get('difficulty', 'Medium'),
        'content': body.get('content', '').strip(),
        'key_points': body.get('key_points', []),
        'formula': body.get('formula') or None,
        'example': body.get('example') or None
    }
    if not note['topic'] or not note['content']:
        return jsonify({'status': 'error', 'error': 'Topic aur content zaroor chahiye'})
    data['notes'].append(note)
    save_json('notes.json', data)
    return jsonify({'status': 'ok', 'id': new_id})

@app.route('/admin/api/delete-note/<int:nid>', methods=['DELETE'])
@admin_required
def admin_delete_note(nid):
    data = load_json('notes.json')
    data['notes'] = [n for n in data['notes'] if n['id'] != nid]
    save_json('notes.json', data)
    return jsonify({'status': 'ok'})

# ─── Admin API: Notifications ─────────────────────────────────

@app.route('/admin/api/notifications')
@admin_required
def admin_get_notifications():
    data = load_json('notifications.json')
    return jsonify(data)

@app.route('/admin/api/add-notification', methods=['POST'])
@admin_required
def admin_add_notification():
    data = load_json('notifications.json')
    body = request.get_json()
    notif = {
        'category': body.get('category', 'SSC'),
        'title': body.get('title', '').strip(),
        'source': body.get('source', '').strip(),
        'time': body.get('time', 'Today')
    }
    if not notif['title']:
        return jsonify({'status': 'error', 'error': 'Title zaroor chahiye'})
    data['notifications'].insert(0, notif)
    save_json('notifications.json', data)
    return jsonify({'status': 'ok'})

@app.route('/admin/api/delete-notification/<int:idx>', methods=['DELETE'])
@admin_required
def admin_delete_notification(idx):
    data = load_json('notifications.json')
    if 0 <= idx < len(data['notifications']):
        data['notifications'].pop(idx)
        save_json('notifications.json', data)
    return jsonify({'status': 'ok'})

# ─── Admin API: Videos ────────────────────────────────────────

@app.route('/admin/api/add-video', methods=['POST'])
@admin_required
def admin_add_video():
    data = load_json('videos.json')
    body = request.get_json()
    new_id = max((v['id'] for v in data['videos']), default=0) + 1
    video = {
        'id': new_id,
        'title': body.get('title', '').strip(),
        'channel': body.get('channel', '').strip(),
        'youtube_id': body.get('youtube_id', '').strip(),
        'category': body.get('category', 'GK'),
        'duration': body.get('duration', '').strip(),
        'thumbnail': f"https://img.youtube.com/vi/{body.get('youtube_id','').strip()}/hqdefault.jpg"
    }
    if not video['title'] or not video['youtube_id']:
        return jsonify({'status': 'error', 'error': 'Title aur YouTube ID chahiye'})
    data['videos'].append(video)
    save_json('videos.json', data)
    return jsonify({'status': 'ok', 'id': new_id})

@app.route('/admin/api/delete-video/<int:vid>', methods=['DELETE'])
@admin_required
def admin_delete_video(vid):
    data = load_json('videos.json')
    data['videos'] = [v for v in data['videos'] if v['id'] != vid]
    save_json('videos.json', data)
    return jsonify({'status': 'ok'})

# ─── Public API Endpoints ─────────────────────────────────────

@app.route('/api/notes')
def get_notes():
    subject = request.args.get('subject', None)
    search = request.args.get('search', '').lower()
    data = load_json('notes.json')
    notes = data['notes']
    if subject and subject != 'All':
        notes = [n for n in notes if n['subject'] == subject]
    if search:
        notes = [n for n in notes if
                 search in n['topic'].lower() or
                 search in n['content'].lower() or
                 search in n['subject'].lower()]
    return jsonify({'notes': notes, 'subjects': data['subjects'], 'total': len(notes)})

@app.route('/api/quiz')
def get_quiz():
    data = load_json('quiz.json')
    return jsonify({'questions': data['daily'], 'total': len(data['daily'])})

@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    body = request.get_json()
    name = body.get('name', 'Anonymous').strip()
    score = int(body.get('score', 0))
    total = int(body.get('total', 10))
    if not name or len(name) > 40:
        name = 'Anonymous'
    data = load_json('quiz.json')
    entry = {"name": name, "score": score, "total": total,
             "date": datetime.now().strftime('%Y-%m-%d')}
    data['leaderboard'].insert(0, entry)
    data['leaderboard'] = sorted(data['leaderboard'],
        key=lambda x: (-x['score'], x['date']))[:20]
    save_json('quiz.json', data)
    return jsonify({"status": "ok", "entry": entry})

@app.route('/api/leaderboard')
def get_leaderboard():
    data = load_json('quiz.json')
    return jsonify({'leaderboard': data['leaderboard']})

@app.route('/api/videos')
def get_videos():
    category = request.args.get('category', None)
    data = load_json('videos.json')
    videos = data['videos']
    if category and category != 'All':
        videos = [v for v in videos if v['category'] == category]
    return jsonify({'videos': videos})

@app.route('/api/exams')
def get_exams():
    category = request.args.get('category', None)
    data = load_json('exams.json')
    if category and category != 'All':
        filtered = {k: v for k, v in data.items() if v['category'] == category}
        return jsonify(filtered)
    return jsonify(data)

if __name__ == '__main__':
    print("\n🚀 GovPrep India is running!")
    print("📍 Visit: http://127.0.0.1:5000")
    print("⚙️  Admin: http://127.0.0.1:5000/admin\n")
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)
