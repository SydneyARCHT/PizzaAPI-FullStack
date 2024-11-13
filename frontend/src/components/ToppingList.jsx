import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

function ToppingList() {
    const [toppings, setToppings] = useState([]);
    const [editToppingId, setEditToppingId] = useState(null);
    const [editName, setEditName] = useState('');

    useEffect(() => {
        fetchToppings();
    }, []);

    const fetchToppings = async () => {
        try {
            const response = await axios.get(`${API_URL}/toppings`);
            setToppings(response.data);
        } catch (error) {
            console.error("Error fetching toppings:", error);
        }
    };

    const handleDelete = async (toppingId) => {
        try {
            await axios.delete(`${API_URL}/toppings/${toppingId}`);
            setToppings(toppings.filter(topping => topping.topping_id !== toppingId));
        } catch (error) {
            console.error("Error deleting topping:", error);
        }
    };

    const handleEditClick = (toppingId, currentName) => {
        setEditToppingId(toppingId);
        setEditName(currentName);
    };

    const handleEditCancel = () => {
        setEditToppingId(null);
        setEditName('');
    };

    const handleEditSave = async (toppingId) => {
        try {
            await axios.put(`${API_URL}/toppings/${toppingId}`, { name: editName });
            setToppings(toppings.map(topping => 
                topping.topping_id === toppingId ? { ...topping, name: editName } : topping
            ));
            handleEditCancel();
        } catch (error) {
            console.error("Error updating topping:", error);
        }
    };

    return (
        <div className="container">
            <h3 className="my-3">Toppings</h3>
            <ul className="list-group">
                {toppings.map((topping) => (
                    <li key={topping.topping_id} className="list-group-item d-flex justify-content-between align-items-center">
                        {editToppingId === topping.topping_id ? (
                            <>
                                <input 
                                    type="text" 
                                    value={editName} 
                                    onChange={(e) => setEditName(e.target.value)} 
                                    className="form-control mr-3"
                                    style={{ maxWidth: '200px' }}
                                />
                                <button className="btn btn-success btn-sm mr-2" onClick={() => handleEditSave(topping.topping_id)}>Save</button>
                                <button className="btn btn-secondary btn-sm" onClick={handleEditCancel}>Cancel</button>
                            </>
                        ) : (
                            <>
                                <span>{topping.name}</span>
                                <div className="d-flex">
                                    <button className="btn btn-secondary btn-sm mr-2" onClick={() => handleEditClick(topping.topping_id, topping.name)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(topping.topping_id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ToppingList;