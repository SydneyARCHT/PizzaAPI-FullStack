from flask import Flask, jsonify, request
from sqlalchemy.orm import Session
from sqlalchemy import select
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from marshmallow import ValidationError, fields, validate
import os
from models import db, Topping, Pizza

# Initialize Flask app and configurations
app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("SQLALCHEMY_DATABASE_URI", "mysql+mysqlconnector://root:SydneyARCHTsql1!@localhost/pizza_db")
# app.config["SQLALCHEMY_DATABASE_URI"] = "mysql+mysqlconnector://root:SydneyARCHTsql1!@localhost/pizza_db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db.init_app(app)  # Initialize SQLAlchemy with app

# Initialize Marshmallow
ma = Marshmallow(app)

# ====================================== SCHEMAS ============================================
class ToppingReferenceSchema(ma.Schema):
    topping_id = fields.Integer(required=True)

class ToppingSchema(ma.Schema):
    topping_id = fields.Integer()
    name = fields.String(required=True)

    class Meta:
        fields = ("topping_id", "name")

class PizzaCreateSchema(ma.Schema):
    pizza_id = fields.Integer()
    name = fields.String(required=True, validate=validate.Length(min=1))
    toppings = fields.List(fields.Nested(ToppingReferenceSchema))

    class Meta:
        fields = ("pizza_id", "name", "toppings")

class PizzaRetrieveSchema(ma.Schema):
    pizza_id = fields.Integer()
    name = fields.String(required=True)
    toppings = fields.List(fields.Nested(ToppingSchema))

    class Meta:
        fields = ("pizza_id", "name", "toppings")

# Schema instances
topping_schema = ToppingSchema()
toppings_schema = ToppingSchema(many=True)
pizza_create_schema = PizzaCreateSchema()
pizza_retrieve_schema = PizzaRetrieveSchema(many=True)

# ====================================== ROUTES =============================================

# Toppings Routes
@app.route("/toppings", methods=["GET"])
def get_toppings():
    toppings = db.session.execute(select(Topping)).scalars().all()
    return toppings_schema.jsonify(toppings), 200

@app.route("/toppings", methods=["POST"])
def add_topping():
    try:
        topping_data = topping_schema.load(request.json)
        new_name = topping_data['name'].strip().lower()
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    with Session(db.engine) as session:
        duplicate_topping = session.execute(
            select(Topping).filter(Topping.name.ilike(new_name))
        ).scalars().first()
        if duplicate_topping:
            return jsonify({"error": f"Topping '{topping_data['name']}' already exists."}), 400
        
        new_topping = Topping(name=topping_data['name'])
        session.add(new_topping)
        session.commit()
    
    return jsonify({"message": "New Topping added successfully"}), 201

@app.route("/toppings/<int:topping_id>", methods=["PUT"])
def edit_topping(topping_id):
    try:
        topping_data = topping_schema.load(request.json)
        new_name = topping_data['name'].strip().lower()
    except ValidationError as err:
        return jsonify(err.messages), 400

    with Session(db.engine) as session:
        topping = session.execute(select(Topping).filter(Topping.topping_id == topping_id)).scalars().first()
        if not topping:
            return jsonify({"error": "Topping not found"}), 404
        
        duplicate_topping = session.execute(
            select(Topping).filter(Topping.name.ilike(new_name), Topping.topping_id != topping_id)
        ).scalars().first()
        if duplicate_topping:
            return jsonify({"error": f"Topping '{topping_data['name']}' already exists."}), 400
        
        topping.name = topping_data['name']
        session.commit()
    
    return jsonify({"message": "Topping updated successfully"}), 200
    

@app.route("/toppings/<int:topping_id>", methods=["DELETE"])
def delete_topping(topping_id):
    with Session(db.engine) as session:
        topping = session.execute(select(Topping).filter(Topping.topping_id == topping_id)).scalars().first()
        if not topping:
            return jsonify({"error": "Topping not found"}), 404
        session.delete(topping)
        session.commit()
    return jsonify({"message": "Topping removed successfully"}), 200

# Pizza Routes
@app.route("/pizzas", methods=["GET"])
def get_pizzas():
    pizzas = db.session.execute(select(Pizza)).scalars().all()
    return pizza_retrieve_schema.jsonify(pizzas), 200

@app.route("/pizzas", methods=["POST"])
def add_pizza():
    try:
        pizza_data = pizza_create_schema.load(request.json)
        new_name = pizza_data['name'].strip().lower()
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    with Session(db.engine) as session:
        duplicate_pizza = session.execute(
            select(Pizza).filter(Pizza.name.ilike(new_name))
        ).scalars().first()
        
        if duplicate_pizza:
            return jsonify({"error": f"Pizza '{pizza_data['name']}' already exists."}), 400
        
        new_pizza = Pizza(name=pizza_data['name'])
        for topping_data in pizza_data['toppings']:
            topping = session.execute(select(Topping).filter(Topping.topping_id == topping_data['topping_id'])).scalar()
            if topping:
                new_pizza.toppings.append(topping)
            else:
                return jsonify({"error": f"Topping with ID {topping_data['topping_id']} not found"}), 404
        session.add(new_pizza)
        session.commit()
    
    return jsonify({"message": "New Pizza added successfully"}), 201

@app.route("/pizzas/<int:pizza_id>", methods=["PUT"])
def update_pizza(pizza_id):
    with Session(db.engine) as session:
        pizza = session.execute(select(Pizza).filter(Pizza.pizza_id == pizza_id)).scalars().first()
        if not pizza:
            return jsonify({"error": "Pizza not found"}), 404
        try:
            pizza_data = pizza_create_schema.load(request.json)
        except ValidationError as err:
            return jsonify(err.messages), 400
        pizza.name = pizza_data['name']
        pizza.toppings.clear()
        for topping_data in pizza_data['toppings']:
            topping = session.execute(select(Topping).filter(Topping.topping_id == topping_data['topping_id'])).scalar()
            if topping:
                pizza.toppings.append(topping)
            else:
                return jsonify({"error": f"Topping with ID {topping_data['topping_id']} not found"}), 404
        session.commit()
    return jsonify({"message": "Pizza updated successfully"}), 200

@app.route("/pizzas/<int:pizza_id>", methods=["DELETE"])
def delete_pizza(pizza_id):
    with Session(db.engine) as session:
        pizza = session.execute(select(Pizza).filter(Pizza.pizza_id == pizza_id)).scalars().first()
        if not pizza:
            return jsonify({"error": "Pizza not found"}), 404
        session.delete(pizza)
        session.commit()
    return jsonify({"message": "Pizza removed successfully"}), 200

# Home route
@app.route("/")
def home():
    return "<h1>Pizza Management API</h1>"

# Run the application
if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(debug=True)