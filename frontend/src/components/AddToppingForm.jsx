import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function AddToppingForm({ onToppingAdded }) {
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/toppings`, { name });
            setName('');
            setError('');
            onToppingAdded();
        } catch (error) {
            setError(error.response?.data?.error || "An error occurred.");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-3">
            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="New Topping Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <br></br>
            <button type="submit" className="btn btn-primary">Add Topping</button>
            {error && <p className="text-danger mt-2">{error}</p>}
        </form>
    );
}

export default AddToppingForm;