# Real, verified external resources, curated by topic keyword.
# Matched against a course's title/skills — not fabricated per-course.

CURATED_RESOURCES = {
    "python": [
        {"type": "Documentation", "title": "Official Python Tutorial", "url": "https://docs.python.org/3/tutorial/"},
        {"type": "Book", "title": "Automate the Boring Stuff with Python (free)", "url": "https://automatetheboringstuff.com/"},
        {"type": "Practice", "title": "Real Python Tutorials", "url": "https://realpython.com/"},
    ],
    "machine learning": [
        {"type": "Course", "title": "Kaggle: Intro to Machine Learning", "url": "https://www.kaggle.com/learn/intro-to-machine-learning"},
        {"type": "Documentation", "title": "scikit-learn User Guide", "url": "https://scikit-learn.org/stable/user_guide.html"},
    ],
    "data science": [
        {"type": "Course", "title": "Kaggle Learn (free micro-courses)", "url": "https://www.kaggle.com/learn"},
        {"type": "Practice", "title": "freeCodeCamp Data Analysis", "url": "https://www.freecodecamp.org/learn/data-analysis-with-python/"},
    ],
    "web development": [
        {"type": "Documentation", "title": "MDN Web Docs", "url": "https://developer.mozilla.org/en-US/docs/Web"},
        {"type": "Course", "title": "freeCodeCamp Responsive Web Design", "url": "https://www.freecodecamp.org/learn/2022/responsive-web-design/"},
    ],
    "excel": [
        {"type": "Documentation", "title": "Microsoft Excel Support & Training", "url": "https://support.microsoft.com/en-us/excel"},
    ],
    "sql": [
        {"type": "Practice", "title": "SQLBolt — Interactive SQL Lessons", "url": "https://sqlbolt.com/"},
        {"type": "Course", "title": "Kaggle: Intro to SQL", "url": "https://www.kaggle.com/learn/intro-to-sql"},
    ],
    "cybersecurity": [
        {"type": "Practice", "title": "TryHackMe (free tier)", "url": "https://tryhackme.com/"},
    ],
    "cloud": [
        {"type": "Documentation", "title": "Google Cloud Free Training", "url": "https://cloud.google.com/training"},
    ],
}

def get_resources_for_item(title, skills):
    text = f"{title or ''} {skills or ''}".lower()
    matched = []
    for keyword, resources in CURATED_RESOURCES.items():
        if keyword in text:
            matched.extend(resources)
    # Deduplicate by URL
    seen, unique = set(), []
    for r in matched:
        if r["url"] not in seen:
            seen.add(r["url"])
            unique.append(r)
    return unique