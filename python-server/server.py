import time
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
import psycopg2
import os
import json
from dotenv import load_dotenv
from psycopg2 import sql

# Load environment variables from .env file
load_dotenv()

# Access environment variables
db_host = os.getenv("DB_HOST")
db_port = os.getenv("DB_PORT")
db_user = os.getenv("DB_USER")
db_password = os.getenv("DB_PASSWORD")
db_database = os.getenv("DB_DATABASE")

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

def connect_to_postgres():
    while True:
        try:
            conn = psycopg2.connect(
                host=db_host,
                port=db_port,
                user=db_user,
                password=db_password,
                database=db_database
            )
            return conn
        except psycopg2.OperationalError as e:
            print(f"Error connecting to PostgreSQL: {e}")
            print("Retrying in 5 seconds...")
            time.sleep(5)


def table_exists(cur, table_name):
    # Check if the table exists in the database
    query = sql.SQL("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = {})").format(
        sql.Literal(table_name)
    )
    cur.execute(query)
    return cur.fetchone()[0]


def column_exists(cur, table_name, column_name):
    # Check if the column exists in the table
    query = sql.SQL("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = {} AND column_name = {})").format(
        sql.Literal(table_name),
        sql.Literal(column_name)
    )
    cur.execute(query)
    return cur.fetchone()[0]


def create_table(cur, conn, table_name, columns):
    # Create the table if it doesn't exist or if columns don't exist
    if not table_exists(cur, table_name):
        # Build the CREATE TABLE query
        create_query = sql.SQL("CREATE TABLE IF NOT EXISTS {} (id SERIAL PRIMARY KEY, value TEXT, data JSONB)").format(
            sql.Identifier(table_name)
        )
        cur.execute(create_query)
        conn.commit()
    else:
        # Alter the table to add missing columns
        if not column_exists(cur, table_name, 'value'):
            # Build the ALTER TABLE query
            alter_query = sql.SQL("ALTER TABLE {} ADD COLUMN value TEXT").format(
                sql.Identifier(table_name)
            )
            cur.execute(alter_query)
            conn.commit()



def insert_data(cur, conn, table_name, data):
    # Insert data into the table
    insert_query = sql.SQL("INSERT INTO {} (data) VALUES (%s) RETURNING id").format(sql.Identifier(table_name))
    record = (data,)
    cur.execute(insert_query, record)
    conn.commit()
    inserted_id = cur.fetchone()[0]  # Retrieve the inserted ID
    return inserted_id

@app.route('/data', methods=['GET'])
def get_data():
    # Get the tableName parameter from the query string
    table_name = request.args.get('tableName')
    data_id = request.args.get('id')

    try:
        conn = connect_to_postgres()
        cur = conn.cursor()

        # Define the table columns
        columns = {
            'id': 'SERIAL PRIMARY KEY',
            'data': 'JSONB'
        }

        # Create or update the table
        create_table(cur, conn, table_name, columns)

        if data_id:
            # Build and execute the query to fetch data by ID
            query = sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier(table_name))
            cur.execute(query, (data_id,))
            row = cur.fetchone()

            # Get the column names
            column_names = [desc[0] for desc in cur.description]

            # Convert the row into a dictionary
            data = dict(zip(column_names, row))

            response = make_response(jsonify(data))
        else:
            # Build and execute the query to fetch all data
            query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(table_name))
            cur.execute(query)
            rows = cur.fetchall()

            # Get the column names
            column_names = [desc[0] for desc in cur.description]

            # Convert the database rows into a list of dictionaries
            data = []
            for row in rows:
                row_data = dict(zip(column_names, row))
                data.append(row_data)

            response = make_response(jsonify(data))

        response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
        response.headers['Pragma'] = 'no-cache'
        response.headers['Expires'] = '0'

        # Close the database connection
        cur.close()
        conn.close()

        return response
    except psycopg2.Error as e:
        # Handle any database connection or query errors
        return jsonify({'error': str(e)})



# POST route
@app.route('/data', methods=['POST'])
def post_data():
    # Get the JSON payload from the request body
    request_data = request.json
    table_name = request_data.get('tableName')
    data = json.dumps(request_data.get('data'))  # Convert data to JSON string

    try:
        conn = connect_to_postgres()
        cur = conn.cursor()

        # Define the table columns
        columns = {
            'id': 'SERIAL PRIMARY KEY',
            'data': 'JSONB'
        }

        # Create or update the table
        create_table(cur, conn, table_name, columns)

        # Save data to PostgreSQL and retrieve the inserted ID
        inserted_id = insert_data(cur, conn, table_name, data)


        # Close the database connection
        cur.close()
        conn.close()

        # Return a response with the inserted ID
        response_data = {'message': 'Data saved successfully', 'data': request_data, 'id': inserted_id}
        return jsonify(response_data)
    except psycopg2.Error as e:
        # Handle any database connection or query errors
        return jsonify({'error': str(e)})

# PUT route
@app.route('/data', methods=['PUT'])
def put_data():
    # Get the JSON payload from the request body
    request_data = request.json
    table_name = request_data.get('tableName')
    data_id = request_data.get('data').get('id')
    new_value = request_data.get('data').get('value')

    try:
        conn = connect_to_postgres()
        cur = conn.cursor()

        # Update data in the table
        update_query = sql.SQL("UPDATE {} SET value = %s, data = %s WHERE id = %s").format(sql.Identifier(table_name))
        cur.execute(update_query, (new_value, json.dumps(request_data.get('data')), data_id))
        conn.commit()

        # Fetch the updated data
        select_query = sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier(table_name))
        cur.execute(select_query, (data_id,))
        row = cur.fetchone()

        # Get the column names
        column_names = [desc[0] for desc in cur.description]

        # Convert the row into a dictionary
        updated_data = dict(zip(column_names, row))

        # Close the database connection
        cur.close()
        conn.close()

        # Return a response with the updated data and message
        response_data = {
            'message': 'Data updated successfully',
            'data': updated_data
        }
        return jsonify(response_data)
    except psycopg2.Error as e:
        # Handle any database connection or query errors
        return jsonify({'error': str(e)})


# DELETE route
@app.route('/data', methods=['DELETE'])
def delete_data():
    # Get the JSON payload from the request body
    request_data = request.json
    table_name = request_data.get('tableName')
    data_id = request_data.get('data').get('id')

    try:
        conn = connect_to_postgres()
        cur = conn.cursor()

        # Delete data from the table
        delete_query = sql.SQL("DELETE FROM {} WHERE id = %s").format(sql.Identifier(table_name))
        cur.execute(delete_query, (data_id,))
        conn.commit()

        # Close the database connection
        cur.close()
        conn.close()

        # Return a response
        return jsonify({'message': 'Data deleted successfully', 'data': request_data})
    except psycopg2.Error as e:
        # Handle any database connection or query errors
        return jsonify({'error': str(e)})


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
