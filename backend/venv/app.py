from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, Session
from sqlalchemy import select
from flask_marshmallow import Marshmallow
from flask_cors import CORS
from marshmallow import ValidationError, fields, validate
import os

# Initialize Flask app and configurations
app = Flask(__name__)
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    'DATABASE_URL', 'mysql+mysqlconnector://root:SydneyARCHTsql1!@localhost/pizza_db'
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Database and Marshmallow initialization
class Base(DeclarativeBase):
    pass

db = SQLAlchemy(app, model_class=Base)
ma = Marshmallow(app)

# ====================================== MODELS =============================================
class Topping(Base):
    __tablename__ = "toppings"
    topping_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<Topping {self.topping_id} - {self.name}>"

class Pizza(Base):
    __tablename__ = "pizzas"
    pizza_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(db.String(100), unique=True, nullable=False)
    toppings: Mapped[list[Topping]] = db.relationship('Topping', secondary="pizza_topping", backref="pizzas")

pizza_topping = db.Table(
    "pizza_topping",
    Base.metadata,
    db.Column("pizza_id", db.ForeignKey("pizzas.pizza_id"), primary_key=True),
    db.Column("topping_id", db.ForeignKey("toppings.topping_id"), primary_key=True)
)

# ====================================== SCHEMAS ============================================
class ToppingReferenceSchema(ma.Schema):
    topping_id = fields.Integer(required=True)

# Full schema for retrieving toppings with details
class ToppingSchema(ma.Schema):
    topping_id = fields.Integer()
    name = fields.String(required=True)

    class Meta:
        fields = ("topping_id", "name")

# Schema for creating pizzas - expects only topping_id in each topping
class PizzaCreateSchema(ma.Schema):
    pizza_id = fields.Integer()
    name = fields.String(required=True, validate=validate.Length(min=1))
    toppings = fields.List(fields.Nested(ToppingReferenceSchema))

    class Meta:
        fields = ("pizza_id", "name", "toppings")

# Schema for retrieving pizzas - includes full details of each topping
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
        new_name = topping_data['name'].strip().lower()  # Normalize name to lowercase and trim whitespace
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    with Session(db.engine) as session:
        # Check if a topping with this lowercase name already exists
        duplicate_topping = session.execute(
            select(Topping).filter(Topping.name.ilike(new_name))
        ).scalars().first()
        if duplicate_topping:
            return jsonify({"error": f"Topping '{topping_data['name']}' already exists."}), 400
        
        # Add the topping with the original casing
        new_topping = Topping(name=topping_data['name'])
        session.add(new_topping)
        session.commit()
    
    return jsonify({"message": "New Topping added successfully"}), 201

@app.route("/toppings/<int:topping_id>", methods=["PUT"])
def edit_topping(topping_id):
    try:
        topping_data = topping_schema.load(request.json)
        new_name = topping_data['name'].strip().lower()  # Normalize name to lowercase and trim whitespace
    except ValidationError as err:
        return jsonify(err.messages), 400

    with Session(db.engine) as session:
        topping = session.execute(select(Topping).filter(Topping.topping_id == topping_id)).scalars().first()
        if not topping:
            return jsonify({"error": "Topping not found"}), 404
        
        # Check for case-insensitive duplicates with a different topping_id
        duplicate_topping = session.execute(
            select(Topping).filter(Topping.name.ilike(new_name), Topping.topping_id != topping_id)
        ).scalars().first()
        if duplicate_topping:
            return jsonify({"error": f"Topping '{topping_data['name']}' already exists."}), 400
        
        # Update the topping name with the original casing
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
    return pizza_retrieve_schema.jsonify(pizzas), 200  # Use PizzaRetrieveSchema for full details

@app.route("/pizzas", methods=["POST"])
def add_pizza():
    try:
        pizza_data = pizza_create_schema.load(request.json)
        new_name = pizza_data['name'].strip().lower()  # Normalize name to lowercase and trim whitespace
    except ValidationError as err:
        return jsonify(err.messages), 400
    
    with Session(db.engine) as session:
        # Check if a pizza with this lowercase name already exists
        duplicate_pizza = session.execute(
            select(Pizza).filter(Pizza.name.ilike(new_name))
        ).scalars().first()
        
        if duplicate_pizza:
            return jsonify({"error": f"Pizza '{pizza_data['name']}' already exists."}), 400
        
        # Add the pizza with the original casing
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