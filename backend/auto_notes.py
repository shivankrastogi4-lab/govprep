import json
import os
import random

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'notes.json')

# 🧠 STATIC TOPICS
reasoning = [
    "Coding Decoding: Pattern-based logic questions",
    "Blood Relation: Family tree problems",
    "Direction Test: Left-right orientation",
    "Syllogism: Logical Venn diagram problems",
    "Seating Arrangement: Puzzle solving tricks"
]

quant = [
    "Percentage: Basic formula and tricks",
    "Profit & Loss: CP/SP formulas",
    "Time & Work: Work efficiency concept",
    "Simple Interest: SI = (P×R×T)/100",
    "Speed Distance: Distance = Speed × Time"
]

english = [
    "Tense Rules: Present, Past, Future",
    "Articles: A, An, The usage",
    "Prepositions: In, On, At rules",
    "Active Passive Voice basics",
    "Synonyms & Antonyms tricks"
]

def generate_notes():
    notes = []

    # GK placeholder (already from news)
    notes.append({"category": "GK", "content": "Daily Current Affairs Updated"})

    for r in reasoning:
        notes.append({"category": "Reasoning", "content": r})

    for q in quant:
        notes.append({"category": "Quant", "content": q})

    for e in english:
        notes.append({"category": "English", "content": e})

    return notes


def save_notes():
    notes = generate_notes()

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump({"notes": notes}, f, indent=2, ensure_ascii=False)

    print(f"✅ {len(notes)} notes added!")


if __name__ == "__main__":
    save_notes()