import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'notes.json')

def load_existing():
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            return json.load(f).get("notes", [])
    return []

def generate_new_notes():
    return [
        {"category": "Reasoning", "content": "Coding Decoding tricks"},
        {"category": "Quant", "content": "Percentage formulas"},
        {"category": "English", "content": "Tense rules"}
    ]

def save_notes():
    existing = load_existing()
    new_notes = generate_new_notes()

    # append instead of overwrite
    all_notes = existing + new_notes

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump({"notes": all_notes}, f, indent=2, ensure_ascii=False)

    print(f"✅ Total notes: {len(all_notes)}")

if __name__ == "__main__":
    save_notes()