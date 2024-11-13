import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000';

// Component for adding a new pizza
function AddPizzaForm({ onPizzaAdded }) {
    const [name, setName] = useState(''); 
    const [availableToppings, setAvailableToppings] = useState([]); 
    const [selectedToppings, setSelectedToppings] = useState([]); 
    const [error, setError] = useState(''); 

    // Fetch available toppings from the API when component mounts
    useEffect(() => {
        const fetchToppings = async () => {
            try {
                const response = await axios.get(`${API_URL}/toppings`);
                setAvailableToppings(response.data); // Populate available toppings
            } catch (error) {
                console.error("Error fetching toppings:", error);
            }
        };
        fetchToppings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission/reloading
        try {
            const toppings = selectedToppings.map((id) => ({ topping_id: id })); // Prepare selected toppings data
            await axios.post(`${API_URL}/pizzas`, { name, toppings }); 
            setName(''); 
            setSelectedToppings([]); 
            setError(''); 
            onPizzaAdded(); // Notify parent component to refresh pizza list
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.error || "An error occurred. Please try again.");
            } else {
                console.error("Error adding pizza:", error);
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
        <form onSubmit={handleSubmit} className="mb-3">
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter New Pizza"
                    value={name}
                    onChange={(e) => setName(e.target.value)} // Update name state on input change
                    required
                />
            </div>
            <div className="form-group">
                <h4>Select Toppings</h4>
                {availableToppings.length > 0 ? (
                    availableToppings.map((topping) => (
                        <div key={topping.topping_id} className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                value={topping.topping_id}
                                onChange={handleToppingChange} 
                                checked={selectedToppings.includes(topping.topping_id)} // Check if topping is selected
                            />
                            <label className="form-check-label">{topping.name}</label>
                        </div>
                    ))
                ) : (
                    <p>Loading toppings...</p>
                )}
            </div>
            {error && <p className="text-danger">{error}</p>} 
            <button type="submit" className="btn btn-primary">Add Pizza</button>
        </form>
    );
}

export default AddPizzaForm;