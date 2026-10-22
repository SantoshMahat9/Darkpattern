import sys
import os
import pytest

# Ensure backend root is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend')))

from app import create_app, db

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
            yield client

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    json_data = response.get_json()
    assert json_data['success'] is True
    assert json_data['data']['status'] == 'healthy'

def test_user_registration_and_login(client):
    # Register user
    reg_response = client.post('/api/auth/register', json={
        'email': 'testuser@example.com',
        'password': 'Password123!'
    })
    assert reg_response.status_code == 201
    assert reg_response.get_json()['success'] is True

    # Login user
    login_response = client.post('/api/auth/login', json={
        'email': 'testuser@example.com',
        'password': 'Password123!'
    })
    assert login_response.status_code == 200
    token = login_response.get_json()['data']['access_token']
    assert token is not None

    # Access /api/auth/me
    me_response = client.get('/api/auth/me', headers={
        'Authorization': f'Bearer {token}'
    })
    assert me_response.status_code == 200
    assert me_response.get_json()['data']['email'] == 'testuser@example.com'
