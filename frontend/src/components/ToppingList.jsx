import React, { useEffect, useState } from 'react';
import axios from 'axios';

// API base URL
const API_URL = 'http://localhost:5000';

// ToppingList component to display, edit, and delete toppings
function ToppingList() {
    const [toppings, setToppings] = useState([]); 
    const [editToppingId, setEditToppingId] = useState(null); 
    const [editName, setEditName] = useState(''); 

    // Fetch toppings from API when component mounts
    useEffect(() => {
        fetchToppings();
    }, []);

    // Fetch toppings from API
    const fetchToppings = async () => {
        try {
            const response = await axios.get(`${API_URL}/toppings`);
            setToppings(response.data); // Update toppings state with data from API
        } catch (error) {
            console.error("Error fetching toppings:", error);
        }
    };

    // Delete a topping by its ID and update state
    const handleDelete = async (toppingId) => {
        try {
            await axios.delete(`${API_URL}/toppings/${toppingId}`);
            setToppings(toppings.filter(topping => topping.topping_id !== toppingId)); // Remove deleted topping from state
        } catch (error) {
            console.error("Error deleting topping:", error);
        }
    };

    // Begin editing a topping: set the editing state and populate editName with current name
    const handleEditClick = (toppingId, currentName) => {
        setEditToppingId(toppingId); // Set the ID of the topping being edited
        setEditName(currentName); // Set the current name in the editName state
    };

    // Cancel editing a topping: reset editing states
    const handleEditCancel = () => {
        setEditToppingId(null); // Clear the ID of the topping being edited
        setEditName(''); // Reset editName state
    };

    // Save edited topping name and update state with new name
    const handleEditSave = async (toppingId) => {
        try {
            await axios.put(`${API_URL}/toppings/${toppingId}`, { name: editName }); // Send updated name to API
            setToppings(toppings.map(topping => 
                topping.topping_id === toppingId ? { ...topping, name: editName } : topping
            )); // Update the topping name in the toppings state
            handleEditCancel(); // Cancel edit mode after saving
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
                            // If editing, show input and save/cancel buttons
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
                            // Display topping name with Edit and Delete buttons
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