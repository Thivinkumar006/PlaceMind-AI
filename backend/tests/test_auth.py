from fastapi.testclient import TestClient

def test_login_invalid_credentials(client: TestClient):
    login_data = {
        "username": "test@example.com",
        "password": "wrongpassword"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 400
    assert response.json() == {"detail": "Incorrect email or password"}
