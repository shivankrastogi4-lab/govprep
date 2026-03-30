"""
GovPrep India - Flask Backend
Run: python app.py
"""

from flask import Flask, render_template, jsonify, request, session, redirect
import json
import os
from datetime import datetime
from functools import wraps

app = Flask(__name__, template_folder='../templates', static_folder='../static')
app.secret_key = 'govprep_secret_2025_change_this'

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

ADMIN_PASSWORD = 'govprep@admin123'

# ─── HELPERS ─────────────────────────────────────────────

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

# ─── PAGE ROUTES ─────────────────────────────────────────

@app.route('/')
def home():
    exams = load_json('exams.json')
    notifications = load_json('notifications.json')['notifications']
    return render_template('index.html', exams=exams, notifications=notifications)

@app.route('/notes')
def notes_page():
    return render_template('notes.html')

@app.route('/quiz')
def quiz_page():
    return render_template('quiz.html')

@app.route('/videos')
def videos_page():
    return render_template('videos.html')

@app.route('/progress')
def progress_page():
    return render_template('progress.html')

# ─── API ROUTES ──────────────────────────────────────────

@app.route('/api/notes')
def get_notes():
    data = load_json('notes.json')
    return jsonify(data)

@app.route('/api/quiz')
def get_quiz():
    data = load_json('quiz.json')
    return jsonify(data)

@app.route('/api/videos')
def get_videos():
    data = load_json('videos.json')
    return jsonify(data)

@app.route('/api/notifications')
def get_notifications():
    data = load_json('notifications.json')
    return jsonify(data)

# ─── JSON DIRECT ROUTES (IMPORTANT FIX 🔥) ────────────────

@app.route('/data/notes.json')
def serve_notes_json():
    return jsonify(load_json('notes.json'))

@app.route('/data/quiz.json')
def serve_quiz_json():
    return jsonify(load_json('quiz.json'))

@app.route('/data/notifications.json')
def serve_notifications_json():
    return jsonify(load_json('notifications.json'))

# ─── RUN APP (ALWAYS LAST) ───────────────────────────────

if __name__ == "__main__":
    print("🚀 GovPrep running...")
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=True, host='0.0.0.0', port=port)