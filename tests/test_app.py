from fastapi.testclient import TestClient
from src.app import app, activities

client = TestClient(app)

TEST_ACTIVITY = "Chess Club"
TEST_EMAIL = "testuser@example.com"


def setup_function():
    # Ensure test email is not present before each test
    if TEST_EMAIL in activities[TEST_ACTIVITY]["participants"]:
        activities[TEST_ACTIVITY]["participants"].remove(TEST_EMAIL)


def teardown_function():
    # Clean up after tests
    if TEST_EMAIL in activities[TEST_ACTIVITY]["participants"]:
        activities[TEST_ACTIVITY]["participants"].remove(TEST_EMAIL)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert TEST_ACTIVITY in data
    assert "participants" in data[TEST_ACTIVITY]


def test_signup_and_unregister_flow():
    # Sign up
    resp = client.post(f"/activities/{TEST_ACTIVITY}/signup?email={TEST_EMAIL}")
    assert resp.status_code == 200
    data = resp.json()
    assert "Signed up" in data["message"]

    # Verify participant is in-memory
    assert TEST_EMAIL in activities[TEST_ACTIVITY]["participants"]

    # Try duplicate signup -> 400
    resp_dup = client.post(f"/activities/{TEST_ACTIVITY}/signup?email={TEST_EMAIL}")
    assert resp_dup.status_code == 400

    # Unregister
    resp_del = client.delete(f"/activities/{TEST_ACTIVITY}/signup?email={TEST_EMAIL}")
    assert resp_del.status_code == 200
    data_del = resp_del.json()
    assert "Removed" in data_del["message"]

    # Verify removed
    assert TEST_EMAIL not in activities[TEST_ACTIVITY]["participants"]

    # Unregister non-existent -> 404
    resp_del2 = client.delete(f"/activities/{TEST_ACTIVITY}/signup?email={TEST_EMAIL}")
    assert resp_del2.status_code == 404
