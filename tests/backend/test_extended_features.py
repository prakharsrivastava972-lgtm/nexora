from fastapi.testclient import TestClient
from backend.app.main import app
import random

client = TestClient(app)


def _register_and_login():
    email = f"pytest_ext_{random.randint(10000,99999)}@example.com"
    client.post("/api/auth/register", json={
        "name": "Pytest Extended",
        "email": email,
        "password": "testpass123"
    })
    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": "testpass123"
    })
    token = login_response.json()["access_token"]
    return token


def test_trending_returns_list():
    response = client.get("/api/trending")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_search_requires_query():
    response = client.get("/api/search")
    assert response.status_code == 422  # missing required 'q' param


def test_search_returns_results_for_common_term():
    response = client.get("/api/search", params={"q": "python"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_search_with_difficulty_filter():
    response = client.get("/api/search", params={"q": "python", "difficulty": "Beginner"})
    assert response.status_code == 200
    results = response.json()
    for item in results:
        assert item["difficulty"] == "Beginner"


def test_saved_items_requires_auth():
    response = client.get("/api/saved-items")
    assert response.status_code in (401, 422)  # missing/invalid auth header


def test_saved_items_with_valid_token():
    token = _register_and_login()
    response = client.get("/api/saved-items", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_preferences_save_and_retrieve():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    save_response = client.post("/api/preferences", json={
        "interests": ["Python", "Machine Learning"],
        "skill_level": "Intermediate"
    }, headers=headers)
    assert save_response.status_code == 200

    get_response = client.get("/api/preferences", headers=headers)
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["has_onboarded"] is True
    assert "Python" in data["interests"]
    assert data["skill_level"] == "Intermediate"


def test_platform_stats_returns_real_counts():
    response = client.get("/api/platform/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] > 0
    assert isinstance(data["total_users"], int)


def test_item_detail_not_found_for_invalid_id():
    response = client.get("/api/items/999999")
    assert response.status_code == 404


def test_item_resources_returns_structure():
    response = client.get("/api/items/793/resources")
    assert response.status_code == 200
    data = response.json()
    assert "resources" in data
    assert isinstance(data["resources"], list)