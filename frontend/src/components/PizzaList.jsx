import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditPizzaForm from './EditPizzaForm';

const API_URL = 'http://localhost:5000';

function PizzaList() {
    const [pizzas, setPizzas] = useState([]);
    const [editPizzaId, setEditPizzaId] = useState(null);

    useEffect(() => {
        fetchPizzas();
    }, []);

    const fetchPizzas = async () => {
        try {
            const response = await axios.get(`${API_URL}/pizzas`);
            setPizzas(response.data);
        } catch (error) {
            console.error("Error fetching pizzas:", error);
        }
    };

    const handleDelete = async (pizzaId) => {
        try {
            await axios.delete(`${API_URL}/pizzas/${pizzaId}`);
            fetchPizzas();
        } catch (error) {
            console.error("Error deleting pizza:", error);
        }
    };

    const handleEditClick = (pizzaId) => {
        setEditPizzaId(pizzaId);
    };

    const handleEditCancel = () => {
        setEditPizzaId(null);
    };

    const handlePizzaUpdated = () => {
        fetchPizzas();
        setEditPizzaId(null);
    };

    return (
        <div className="container">
            <h3 className="my-3">Pizzas</h3>
            <ul className="list-group">
                {pizzas.map((pizza) => (
                    <li key={pizza.pizza_id} className="list-group-item d-flex justify-content-between align-items-center">
                        {editPizzaId === pizza.pizza_id ? (
                            <EditPizzaForm
                                pizza={pizza}
                                onCancel={handleEditCancel}
                                onPizzaUpdated={handlePizzaUpdated}
                            />
                        ) : (
                            <>
                                <span>
                                    <strong>{pizza.name}</strong> - Toppings: 
                                    {pizza.toppings.length > 0 ? (
                                        pizza.toppings.map((topping, index) => (
                                            <span key={topping.topping_id}>
                                                {topping.name}{index < pizza.toppings.length - 1 ? ', ' : ' '}
                                            </span>
                                        ))
                                    ) : (
                                        <span> None</span>
                                    )}
                                </span>
                                <div>
                                    <button onClick={() => handleEditClick(pizza.pizza_id)} className="btn btn-secondary btn-sm mr-2">Edit</button>
                                    <button onClick={() => handleDelete(pizza.pizza_id)} className="btn btn-danger btn-sm">Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default PizzaList;