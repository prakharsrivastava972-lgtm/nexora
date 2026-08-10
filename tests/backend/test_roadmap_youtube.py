from fastapi.testclient import TestClient
from backend.app.main import app
import random

client = TestClient(app)


def _register_and_login():
    email = f"pytest_roadmap_{random.randint(10000,99999)}@example.com"
    client.post("/api/auth/register", json={
        "name": "Pytest Roadmap",
        "email": email,
        "password": "testpass123"
    })
    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": "testpass123"
    })
    return login_response.json()["access_token"]


def test_roadmap_goals_list():
    response = client.get("/api/roadmap/goals")
    assert response.status_code == 200
    assert "machine learning engineer" in response.json()["goals"]


def test_roadmap_generate_and_fetch():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    generate_response = client.post("/api/roadmap/generate", json={
        "goal": "Data Scientist",
        "level": "Beginner",
        "duration": "3 months",
        "existing_skills": ["Python"]
    }, headers=headers)
    assert generate_response.status_code == 200

    get_response = client.get("/api/roadmap", headers=headers)
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["has_roadmap"] is True
    assert data["goal"] == "Data Scientist"
    assert data["progress"] == 0
    assert len(data["stages"]) > 0


def test_roadmap_invalid_goal_rejected():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/roadmap/generate", json={
        "goal": "Astronaut",
        "level": "Beginner",
        "duration": "3 months",
        "existing_skills": []
    }, headers=headers)
    assert response.status_code == 400


def test_roadmap_topic_toggle():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    client.post("/api/roadmap/generate", json={
        "goal": "Full Stack Developer",
        "level": "Beginner",
        "duration": "3 months",
        "existing_skills": []
    }, headers=headers)

    roadmap = client.get("/api/roadmap", headers=headers).json()
    topic_id = roadmap["stages"][0]["topics"][0]["id"]

    toggle_response = client.put(f"/api/roadmap/topic/{topic_id}/toggle", headers=headers)
    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True


def test_youtube_search_returns_real_links():
    response = client.get("/api/youtube/search", params={"q": "Linear Regression", "level": "Beginner"})
    assert response.status_code == 200
    data = response.json()
    assert len(data["resources"]) == 3
    for r in data["resources"]:
        assert r["url"].startswith("https://www.youtube.com/results?search_query=")