import React, { useEffect, useState } from 'react';
import axios from 'axios';
import EditPizzaForm from './EditPizzaForm';

// API base URL
const API_URL = 'http://localhost:5000';

// PizzaList component to display, edit, and delete pizzas
function PizzaList() {
    const [pizzas, setPizzas] = useState([]); 
    const [editPizzaId, setEditPizzaId] = useState(null); 

    // Fetch pizzas from API when component mounts
    useEffect(() => {
        fetchPizzas();
    }, []);

    // Fetch pizzas from the API
    const fetchPizzas = async () => {
        try {
            const response = await axios.get(`${API_URL}/pizzas`);
            setPizzas(response.data); // Update pizzas state with data from API
        } catch (error) {
            console.error("Error fetching pizzas:", error);
        }
    };

    // Delete a pizza by its ID and update state
    const handleDelete = async (pizzaId) => {
        try {
            await axios.delete(`${API_URL}/pizzas/${pizzaId}`);
            fetchPizzas(); // Re-fetch pizzas after deletion to update list
        } catch (error) {
            console.error("Error deleting pizza:", error);
        }
    };

    // Set the pizza ID to enter edit mode
    const handleEditClick = (pizzaId) => {
        setEditPizzaId(pizzaId); 
    };

    // Cancel edit mode
    const handleEditCancel = () => {
        setEditPizzaId(null); // Clear the edit state
    };

    // Fetch pizzas and exit edit mode after successful update
    const handlePizzaUpdated = () => {
        fetchPizzas(); // Re-fetch pizzas to get updated data
        setEditPizzaId(null); // Exit edit mode
    };

    return (
        <div className="container">
            <h3 className="my-3">Pizzas</h3>
            <ul className="list-group">
                {pizzas.map((pizza) => (
                    <li key={pizza.pizza_id} className="list-group-item d-flex justify-content-between align-items-center">
                        {editPizzaId === pizza.pizza_id ? (
                            // If editing, render EditPizzaForm component
                            <EditPizzaForm
                                pizza={pizza}
                                onCancel={handleEditCancel}
                                onPizzaUpdated={handlePizzaUpdated}
                            />
                        ) : (
                            // Display pizza name, toppings, and Edit/Delete buttons if not in edit mode
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