from fastapi.testclient import TestClient
import json

from src.app import app


client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    # Expect a known activity
    assert "Chess Club" in data


def test_signup_and_unregister():
    activity = "Chess Club"
    email = "testuser+pytest@mergington.edu"

    # Ensure email not present initially (remove if present)
    resp = client.get(f"/activities")
    assert resp.status_code == 200
    activities = resp.json()
    participants = activities[activity]["participants"]
    if email in participants:
        # cleanup if leftover from previous run
        del_resp = client.delete(f"/activities/{activity}/signup?email={email}")
        assert del_resp.status_code == 200

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    body = resp.json()
    assert "Signed up" in body.get("message", "")

    # Verify participant exists
    resp = client.get("/activities")
    activities = resp.json()
    assert email in activities[activity]["participants"]

    # Unregister
    resp = client.delete(f"/activities/{activity}/signup?email={email}")
    assert resp.status_code == 200
    body = resp.json()
    assert "Removed" in body.get("message", "")

    # Verify participant removed
    resp = client.get("/activities")
    activities = resp.json()
    assert email not in activities[activity]["participants"]
