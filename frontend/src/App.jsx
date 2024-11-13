import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Home from './components/Home';
import ToppingList from './components/ToppingList';
import AddToppingForm from './components/AddToppingForm';
import PizzaList from './components/PizzaList';
import AddPizzaForm from './components/AddPizzaForm';
import './App.css';

// Component to manage toppings, includes adding and listing toppings
function ToppingsPage() {
  return (
      <div>
          <h2>Manage Toppings</h2>
          <AddToppingForm onToppingAdded={() => window.location.reload()} />
          <ToppingList />
      </div>
  );
}

// Component to manage pizzas, includes adding and listing pizzas
function PizzasPage() {
  return (
      <div>
          <h2>Manage Pizzas</h2>
          <AddPizzaForm onPizzaAdded={() => window.location.reload()} />
          <PizzaList />
      </div>
  );
}

// Main App component with Router setup
function App() {
    return (
        <Router>
            <div>
                <h1>Pizza Management Application</h1>
                <nav>
                    <Link to="/">Home</Link> | 
                    <Link to="/toppings">Manage Toppings</Link> | 
                    <Link to="/pizzas">Manage Pizzas</Link>
                </nav>
                <Routes>
                    <Route path="/" element={<Home />} /> 
                    <Route path="/toppings" element={<ToppingsPage />} /> 
                    <Route path="/pizzas" element={<PizzasPage />} /> 
                </Routes>
            </div>
        </Router>
    );
}

export default App;