import sys
import os
import pytest

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

def test_scan_missing_url(client):
    response = client.post('/api/scan', json={})
    assert response.status_code == 400
    assert response.get_json()['success'] is False

def test_scan_valid_url(client):
    response = client.post('/api/scan', json={'url': 'https://example-ecommerce-shop.com'})
    assert response.status_code == 200
    data = response.get_json()
    assert data['success'] is True
    assert 'detections' in data['data']
    assert isinstance(data['data']['detections'], list)
