from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Table, Column, ForeignKey, String
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Base(DeclarativeBase):
    pass

# Toppings model
class Topping(Base):
    __tablename__ = "toppings"
    topping_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

    def __repr__(self):
        return f"<Topping {self.topping_id} - {self.name}>"

# Pizza-Topping association table
pizza_topping = Table(
    "pizza_topping",
    Base.metadata,
    Column("pizza_id", ForeignKey("pizzas.pizza_id"), primary_key=True),
    Column("topping_id", ForeignKey("toppings.topping_id"), primary_key=True)
)

# Pizza model
class Pizza(Base):
    __tablename__ = "pizzas"
    pizza_id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    toppings: Mapped[list[Topping]] = relationship('Topping', secondary=pizza_topping, backref="pizzas")