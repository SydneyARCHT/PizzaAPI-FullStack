import pytest
from app import app, db
from app import Topping, Pizza

@pytest.fixture(scope='module')
def test_client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

def test_add_topping(test_client):
    response = test_client.post('/toppings', json={'name': 'Mozzarella'})
    assert response.status_code == 201
    assert b"New Topping added successfully" in response.data

def test_add_duplicate_topping(test_client):
    test_client.post('/toppings', json={'name': 'Pepperoni'})
    response = test_client.post('/toppings', json={'name': 'pepperoni'})
    assert response.status_code == 400
    assert b"Topping 'pepperoni' already exists." in response.data


# Purposefully fails because topping 1 does not exist 
def test_add_pizza(test_client):
    response = test_client.post('/pizzas', json={
        'name': 'Pepperoni Pizza',
        'toppings': [{'topping_id': 1}]
    })
    assert response.status_code == 201
    assert b"New Pizza added successfully" in response.data

# Passes because topping 1 already doesn't exist
def test_delete_topping(test_client):
    response = test_client.delete('/toppings/1')
    assert response.status_code == 200
    assert b"Topping removed successfully" in response.data