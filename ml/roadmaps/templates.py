# Template-based learning roadmaps. Each goal maps to a fixed set of stages/topics,
# which get dynamically adjusted (shortened/marked known) based on the user's existing skills.
# This is deliberately NOT an LLM call — it's honest, rule-based personalization.

ROADMAP_TEMPLATES = {
    "machine learning engineer": [
        {"title": "Python Foundations", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Python Syntax", "Functions", "OOP", "NumPy", "Pandas"]},
        {"title": "Mathematics for ML", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Linear Algebra", "Probability", "Statistics"]},
        {"title": "Machine Learning", "duration": "5 weeks", "difficulty": "Intermediate",
         "topics": ["Regression", "Classification", "Clustering", "Model Evaluation"]},
        {"title": "Deep Learning", "duration": "5 weeks", "difficulty": "Advanced",
         "topics": ["Neural Networks", "CNNs", "RNNs", "Transformers"]},
        {"title": "Projects", "duration": "4 weeks", "difficulty": "Advanced",
         "topics": ["Beginner Project", "Intermediate Project", "Capstone Project"]},
    ],
    "data scientist": [
        {"title": "Python & SQL Foundations", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Python Syntax", "Pandas", "SQL Basics", "Data Cleaning"]},
        {"title": "Statistics & Analysis", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Descriptive Statistics", "Probability", "Hypothesis Testing"]},
        {"title": "Machine Learning", "duration": "4 weeks", "difficulty": "Intermediate",
         "topics": ["Regression", "Classification", "Feature Engineering"]},
        {"title": "Data Visualization", "duration": "2 weeks", "difficulty": "Intermediate",
         "topics": ["Matplotlib", "Seaborn", "Dashboards"]},
        {"title": "Projects", "duration": "3 weeks", "difficulty": "Advanced",
         "topics": ["EDA Project", "Predictive Modeling Project", "Capstone Project"]},
    ],
    "full stack developer": [
        {"title": "Frontend Foundations", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["HTML", "CSS", "JavaScript", "React Basics"]},
        {"title": "Backend Foundations", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Node.js/Python", "REST APIs", "Databases"]},
        {"title": "Full Stack Integration", "duration": "3 weeks", "difficulty": "Intermediate",
         "topics": ["Authentication", "State Management", "Deployment"]},
        {"title": "Projects", "duration": "3 weeks", "difficulty": "Advanced",
         "topics": ["CRUD App", "Full Stack Project", "Capstone Project"]},
    ],
    "cybersecurity analyst": [
        {"title": "Networking Foundations", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Networking Basics", "TCP/IP", "Linux Fundamentals"]},
        {"title": "Security Fundamentals", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Threats & Vulnerabilities", "Cryptography Basics", "Security Tools"]},
        {"title": "Practical Security", "duration": "4 weeks", "difficulty": "Intermediate",
         "topics": ["Penetration Testing Basics", "Incident Response", "SIEM Tools"]},
        {"title": "Projects", "duration": "2 weeks", "difficulty": "Advanced",
         "topics": ["CTF Practice", "Security Audit Project"]},
    ],
    "cloud engineer": [
        {"title": "Cloud Foundations", "duration": "3 weeks", "difficulty": "Beginner",
         "topics": ["Cloud Concepts", "Linux Basics", "Networking Basics"]},
        {"title": "Core Cloud Skills", "duration": "4 weeks", "difficulty": "Intermediate",
         "topics": ["Compute Services", "Storage Services", "IAM & Security"]},
        {"title": "DevOps & Automation", "duration": "3 weeks", "difficulty": "Intermediate",
         "topics": ["Infrastructure as Code", "CI/CD", "Containers"]},
        {"title": "Projects", "duration": "2 weeks", "difficulty": "Advanced",
         "topics": ["Deploy a Cloud App", "Capstone Project"]},
    ],
}

def get_available_goals():
    return list(ROADMAP_TEMPLATES.keys())

def generate_roadmap(goal, existing_skills=None):
    """
    Returns a list of stage dicts for the given goal, with topics marked
    as already_known if they match the user's existing skills (case-insensitive).
    """
    goal_key = goal.strip().lower()
    template = ROADMAP_TEMPLATES.get(goal_key)
    if not template:
        return None

    existing_skills_lower = set(s.strip().lower() for s in (existing_skills or []))

    stages = []
    for stage in template:
        topics = []
        for topic_name in stage["topics"]:
            already_known = topic_name.lower() in existing_skills_lower
            topics.append({"name": topic_name, "estimated_hours": 6, "already_known": already_known})
        stages.append({
            "title": stage["title"],
            "duration": stage["duration"],
            "difficulty": stage["difficulty"],
            "topics": topics,
        })
    return stages