import React from 'react';
import '../Home.css';

function Home() {
    return (
        <div>
            <p>This application allows you to manage pizzas and their toppings effectively. Here's a quick guide on how to use it:</p>
            
            <section>
                <h3>Manage Toppings</h3>
                <p>
                    In the 'Manage Toppings' section, you can add new toppings to the database by filling out the form. 
                    Once a topping is added, it will automatically appear in the toppings list.
                </p>
            </section>
            
            <section>
                <h3>Manage Pizzas</h3>
                <p>
                    In the 'Manage Pizzas' section, you can create pizzas by adding a name and selecting the desired toppings. 
                    Each pizza will be displayed in the pizza list after creation.
                </p>
            </section>

            <section>
                <h3>Usage Instructions</h3>
                <p>
                    Use the navigation to switch between the home screen and management sections for toppings and pizzas.
                    Each section provides a form for adding entries and lists that display the existing data. 
                    Refreshing will show the most recent data.
                </p>
            </section>
        </div>
    );
}

export default Home;