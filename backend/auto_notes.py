import json
import os
from datetime import datetime

def generate_notes(news_list):
    notes = []

    for i, news in enumerate(news_list[:5]):
        note = {
            "id": int(datetime.now().timestamp()) + i,
            "subject": "Current Affairs",
            "topic": news['title'],
            "difficulty": "Easy",
            "content": f"{news['title']} हाल ही की महत्वपूर्ण खबर है। यह परीक्षा के लिए महत्वपूर्ण हो सकती है।",
            "key_points": [
                news['title'],
                "यह करंट अफेयर्स से जुड़ा है",
                "परीक्षा में पूछे जाने की संभावना है"
            ],
            "formula": None,
            "example": None
        }

        notes.append(note)

    return notes


def update_notes():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    NOTES_PATH = os.path.join(BASE_DIR, '..', 'data', 'notes.json')
    NOTIF_PATH = os.path.join(BASE_DIR, '..', 'data', 'notifications.json')

    # load news
    with open(NOTIF_PATH, 'r', encoding='utf-8') as f:
        notif_data = json.load(f)

    news_list = notif_data['notifications']

    # load notes
    with open(NOTES_PATH, 'r', encoding='utf-8') as f:
        notes_data = json.load(f)

    new_notes = generate_notes(news_list)

    # duplicate remove
    existing_topics = [n['topic'] for n in notes_data['notes']]
    new_notes = [n for n in new_notes if n['topic'] not in existing_topics]

    # limit
    notes_data['notes'] = (new_notes + notes_data['notes'])[:50]

    # save
    with open(NOTES_PATH, 'w', encoding='utf-8') as f:
        json.dump(notes_data, f, indent=2, ensure_ascii=False)

    print(f"✅ {len(new_notes)} new notes added!")


if __name__ == "__main__":
    update_notes()