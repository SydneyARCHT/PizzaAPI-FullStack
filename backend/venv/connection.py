import mysql.connector
from mysql.connector import Error

def connect_db():
    db_name = "pizza_db"
    user = "root"
    password = "SydneyARCHTsql1!" 
    host = "localhost"

    try:
        conn = mysql.connector.connect(
            database=db_name,
            user=user,
            password=password,
            host=host
        )

        # check for a connection
        if conn.is_connected():
            print("Connected to MySQL Database successfully!")
            return conn
    except Error as e:
        print(f"Error: {e}")
        return None
    
# connect_db()