"""
GovPrep India - Flask Backend
Run: python app.py
"""

from flask import Flask, render_template, jsonify, request
import json
import os
from datetime import datetime

app = Flask(__name__, template_folder='../templates', static_folder='../static')

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

def load_json(filename):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_json(filename, data):
    path = os.path.join(DATA_DIR, filename)
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ─── Page Routes ─────────────────────────────────────────────

@app.route('/')
def home():
    exams = load_json('exams.json')
    return render_template('index.html', exams=exams)

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

# ─── API Endpoints ────────────────────────────────────────────

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
    
    return jsonify({
        'notes': notes,
        'subjects': data['subjects'],
        'total': len(notes)
    })

@app.route('/api/quiz')
def get_quiz():
    data = load_json('quiz.json')
    return jsonify({
        'questions': data['daily'],
        'total': len(data['daily'])
    })

@app.route('/api/submit-score', methods=['POST'])
def submit_score():
    body = request.get_json()
    name = body.get('name', 'Anonymous').strip()
    score = int(body.get('score', 0))
    total = int(body.get('total', 10))
    
    if not name or len(name) > 40:
        name = 'Anonymous'
    
    data = load_json('quiz.json')
    entry = {
        "name": name,
        "score": score,
        "total": total,
        "date": datetime.now().strftime('%Y-%m-%d')
    }
    
    data['leaderboard'].insert(0, entry)
    # Keep only top 20
    data['leaderboard'] = sorted(
        data['leaderboard'], 
        key=lambda x: (-x['score'], x['date'])
    )[:20]
    
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
    print("📍 Visit: http://127.0.0.1:5000\n")
    port = int(os.environ.get('PORT', 5000))
    app.run(debug=False, host='0.0.0.0', port=port)