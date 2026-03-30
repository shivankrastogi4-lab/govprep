import json
import os
import random
from datetime import datetime

def generate_mcq(news_list):
    questions = []

    for i, news in enumerate(news_list[:5]):
        correct = news['title']

        # fake options banane ke liye shuffle
        options = [correct]
        fake_options = [
            "India launches new scheme",
            "Government announces policy",
            "New education reform introduced",
            "International summit held"
        ]

        while len(options) < 4:
            opt = random.choice(fake_options)
            if opt not in options:
                options.append(opt)

        random.shuffle(options)

        question = {
            "id": int(datetime.now().timestamp()) + i,
            "subject": "Current Affairs",
            "question": f"Which of the following is a recent news headline?",
            "options": options,
            "answer": options.index(correct),
            "explanation": correct
        }

        questions.append(question)

    return questions


def update_quiz():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    QUIZ_PATH = os.path.join(BASE_DIR, '..', 'data', 'quiz.json')
    NOTIF_PATH = os.path.join(BASE_DIR, '..', 'data', 'notifications.json')

    # load news
    with open(NOTIF_PATH, 'r', encoding='utf-8') as f:
        notif_data = json.load(f)

    news_list = notif_data['notifications']

    # load quiz
    with open(QUIZ_PATH, 'r', encoding='utf-8') as f:
        quiz_data = json.load(f)

    new_questions = generate_mcq(news_list)

    # duplicate avoid
    existing_q = [q['question'] for q in quiz_data['daily']]
    new_questions = [q for q in new_questions if q['question'] not in existing_q]

    quiz_data['daily'] = (new_questions + quiz_data['daily'])[:50]

    # save
    with open(QUIZ_PATH, 'w', encoding='utf-8') as f:
        json.dump(quiz_data, f, indent=2, ensure_ascii=False)

    print(f"✅ {len(new_questions)} new quiz added!")


if __name__ == "__main__":
    update_quiz()