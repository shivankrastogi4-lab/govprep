import feedparser
import json
import os

RSS_FEEDS = [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.thehindu.com/news/national/feeder/default.rss"
]

def fetch_news():
    news_list = []

    for url in RSS_FEEDS:
        feed = feedparser.parse(url)
        for entry in feed.entries[:5]:
            news_list.append({
                "category": "Daily CA",
                "title": entry.title,
                "source": "News",
                "time": "Today"
            })

    return news_list


def update_notifications():
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    DATA_PATH = os.path.join(BASE_DIR, '..', 'data', 'notifications.json')

    with open(DATA_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    new_news = fetch_news()

    existing_titles = [n['title'] for n in data['notifications']]
    new_news = [n for n in new_news if n['title'] not in existing_titles]

    data['notifications'] = (new_news + data['notifications'])[:50]

    with open(DATA_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ {len(new_news)} news added!")


if __name__ == "__main__":
    update_notifications()