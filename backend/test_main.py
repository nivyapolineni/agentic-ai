import pytest
from fastapi.testclient import TestClient
import os
from backend.main import app

client = TestClient(app)

def test_read_main():
    # Simple check that we can reach the server
    # We don't have a GET / but the app is up
    pass

def test_process_passport_no_file():
    response = client.post("/process-passport")
    assert response.status_code == 422

def test_process_passport_mock():
    mock_file_path = "tests/assets/mock_passport.png"
    if not os.path.exists(mock_file_path):
        pytest.skip("Mock passport image not found")

    with open(mock_file_path, "rb") as f:
        response = client.post(
            "/process-passport",
            files={"file": ("passport.png", f, "image/png")}
        )

    assert response.status_code == 200
    data = response.json()
    assert "firstName" in data
    assert "lastName" in data
    assert "dob" in data
    assert "passportNumber" in data
