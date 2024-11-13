import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000';

// Component for editing an existing pizza
function EditPizzaForm({ pizza, onCancel, onPizzaUpdated }) {
    const [name, setName] = useState(pizza.name); 
    const [availableToppings, setAvailableToppings] = useState([]); 
    const [selectedToppings, setSelectedToppings] = useState(
        pizza.toppings.map((topping) => topping.topping_id) // Initially selected toppings for the pizza
    );
    const [error, setError] = useState(''); 

    // Fetch available toppings from the API when component mounts
    useEffect(() => {
        const fetchToppings = async () => {
            try {
                const response = await axios.get(`${API_URL}/toppings`);
                setAvailableToppings(response.data); 
            } catch (error) {
                console.error("Error fetching toppings:", error);
            }
        };
        fetchToppings();
    }, []);


    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form default submission/reloading
        try {
            const toppings = selectedToppings.map((id) => ({ topping_id: id })); // Prepare toppings data
            await axios.put(`${API_URL}/pizzas/${pizza.pizza_id}`, { name, toppings }); // Update pizza in API
            setError(''); 
            onPizzaUpdated(); // Notify parent component to refresh pizza list
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.error || "An error occurred. Please try again.");
            } else {
                console.error("Error updating pizza:", error);
            }
        }
    };

    // Handle topping selection/deselection
    const handleToppingChange = (e) => {
        const { value, checked } = e.target;
        setSelectedToppings((prev) =>
            checked ? [...prev, parseInt(value)] : prev.filter((id) => id !== parseInt(value))
        ); // Add or remove topping ID from selected toppings
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Pizza Name"
                value={name}
                onChange={(e) => setName(e.target.value)} // Update name state on input change
                required
                className="form-control mb-2"
            />
            <div>
                <h4>Select Toppings</h4>
                {availableToppings.map((topping) => (
                    <label key={topping.topping_id} className="form-check">
                        <input
                            type="checkbox"
                            className="form-check-input"
                            value={topping.topping_id}
                            onChange={handleToppingChange} 
                            checked={selectedToppings.includes(topping.topping_id)} // Check if topping is selected
                        />
                        {topping.name}
                    </label>
                ))}
            </div>
            {error && <p className="text-danger">{error}</p>} 
            <button type="submit" className="btn btn-success mr-2">Save Changes</button>
            <button type="button" onClick={onCancel} className="btn btn-secondary">Cancel</button>
        </form>
    );
}

export default EditPizzaForm;