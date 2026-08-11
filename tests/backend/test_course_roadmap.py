from fastapi.testclient import TestClient
from backend.app.main import app
import random

client = TestClient(app)


def _register_and_login():
    email = f"pytest_course_{random.randint(10000,99999)}@example.com"
    client.post("/api/auth/register", json={
        "name": "Pytest Course",
        "email": email,
        "password": "testpass123"
    })
    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": "testpass123"
    })
    return login_response.json()["access_token"]


def _get_test_item_id():
    # Use item 1, assumed to exist from the seeded 992-course dataset
    return 1


def test_create_course_roadmap():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    item_id = _get_test_item_id()

    response = client.post(f"/api/courses/{item_id}/roadmap", headers=headers)
    assert response.status_code == 200
    assert response.json()["status"] == "created"


def test_create_course_roadmap_idempotent():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    item_id = _get_test_item_id()

    first = client.post(f"/api/courses/{item_id}/roadmap", headers=headers)
    second = client.post(f"/api/courses/{item_id}/roadmap", headers=headers)
    assert first.json()["status"] == "created"
    assert second.json()["status"] == "already_exists"


def test_get_course_roadmap_has_topics():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    item_id = _get_test_item_id()

    client.post(f"/api/courses/{item_id}/roadmap", headers=headers)
    response = client.get(f"/api/courses/{item_id}/roadmap", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["has_roadmap"] is True
    assert data["progress"] == 0
    assert len(data["topics"]) > 0


def test_get_course_roadmap_no_roadmap_yet():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    item_id = _get_test_item_id()

    response = client.get(f"/api/courses/{item_id}/roadmap", headers=headers)
    assert response.status_code == 200
    assert response.json()["has_roadmap"] is False


def test_toggle_course_topic():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    item_id = _get_test_item_id()

    client.post(f"/api/courses/{item_id}/roadmap", headers=headers)
    roadmap = client.get(f"/api/courses/{item_id}/roadmap", headers=headers).json()
    topic_id = roadmap["topics"][0]["id"]

    toggle_response = client.put(f"/api/courses/topic/{topic_id}/toggle", headers=headers)
    assert toggle_response.status_code == 200
    assert toggle_response.json()["completed"] is True


def test_toggle_topic_wrong_user_forbidden():
    token_a = _register_and_login()
    headers_a = {"Authorization": f"Bearer {token_a}"}
    item_id = _get_test_item_id()

    client.post(f"/api/courses/{item_id}/roadmap", headers=headers_a)
    roadmap = client.get(f"/api/courses/{item_id}/roadmap", headers=headers_a).json()
    topic_id = roadmap["topics"][0]["id"]

    token_b = _register_and_login()
    headers_b = {"Authorization": f"Bearer {token_b}"}
    response = client.put(f"/api/courses/topic/{topic_id}/toggle", headers=headers_b)
    assert response.status_code == 403


def test_my_courses_reflects_progress():
    token = _register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    item_id = _get_test_item_id()

    client.post(f"/api/courses/{item_id}/roadmap", headers=headers)
    roadmap = client.get(f"/api/courses/{item_id}/roadmap", headers=headers).json()
    topic_id = roadmap["topics"][0]["id"]
    client.put(f"/api/courses/topic/{topic_id}/toggle", headers=headers)

    response = client.get("/api/my-courses", headers=headers)
    assert response.status_code == 200
    courses = response.json()
    matching = [c for c in courses if c["item_id"] == item_id]
    assert len(matching) == 1
    assert matching[0]["progress"] > 0