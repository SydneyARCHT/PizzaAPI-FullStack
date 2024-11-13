import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function AddPizzaForm({ onPizzaAdded }) {
    const [name, setName] = useState('');
    const [availableToppings, setAvailableToppings] = useState([]);
    const [selectedToppings, setSelectedToppings] = useState([]);
    const [error, setError] = useState(''); // State to store error messages

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
        e.preventDefault();
        try {
            const toppings = selectedToppings.map((id) => ({ topping_id: id }));
            await axios.post(`${API_URL}/pizzas`, { name, toppings });
            setName('');
            setSelectedToppings([]);
            setError(''); // Clear error on successful submission
            onPizzaAdded();
        } catch (error) {
            if (error.response && error.response.status === 400) {
                setError(error.response.data.error || "An error occurred. Please try again."); // Display error message
            } else {
                console.error("Error adding pizza:", error);
            }
        }
    };

    const handleToppingChange = (e) => {
        const { value, checked } = e.target;
        setSelectedToppings((prev) =>
            checked ? [...prev, parseInt(value)] : prev.filter((id) => id !== parseInt(value))
        );
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3">
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter New Pizza"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                                checked={selectedToppings.includes(topping.topping_id)}
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