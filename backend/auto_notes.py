import json
import os
import random

DATA_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'notes.json')

subjects = ["Reasoning", "Quant", "English", "GK"]

topics = {
    "Reasoning": ["Coding Decoding", "Blood Relation", "Syllogism", "Seating Arrangement"],
    "Quant": ["Percentage", "Profit & Loss", "Time & Work", "SI & CI"],
    "English": ["Tense", "Articles", "Prepositions", "Vocabulary"],
    "GK": ["Current Affairs", "Static GK", "History", "Geography"]
}

difficulty_levels = ["Easy", "Medium", "Hard"]

def generate_note():
    subject = random.choice(subjects)
    topic = random.choice(topics[subject])
    difficulty = random.choice(difficulty_levels)

    return {
        "subject": subject,
        "topic": topic,
        "difficulty": difficulty,
        "overview": f"{topic} important concepts",
        "key_points": [
            f"Understand basics of {topic}",
            f"Practice questions of {topic}",
            f"Revise {topic} regularly"
        ]
    }

def main():
    # Load existing data
    if os.path.exists(DATA_PATH):
        with open(DATA_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)
    else:
        data = {"notes": []}

    # Generate 20 new notes
    new_notes = [generate_note() for _ in range(20)]

    # Add new notes
    data["notes"].extend(new_notes)

    # Save back
    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print("✅ 20 new notes added!")

if __name__ == "__main__":
    main()