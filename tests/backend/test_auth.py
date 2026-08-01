from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_register_and_login_flow():
    import random
    email = f"pytest_user_{random.randint(1000,9999)}@example.com"

    register_response = client.post("/api/auth/register", json={
        "name": "Pytest User",
        "email": email,
        "password": "testpass123"
    })
    assert register_response.status_code == 200
    assert register_response.json()["email"] == email

    login_response = client.post("/api/auth/login", json={
        "email": email,
        "password": "testpass123"
    })
    assert login_response.status_code == 200
    assert "access_token" in login_response.json()

def test_login_with_wrong_password_fails():
    response = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401