import time
import psycopg2
import os
import json
from dotenv import load_dotenv
from psycopg2 import sql
from flask import jsonify, request, make_response
from server_logging import server_logging

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging.server_logging("postgres_api.log", mode)

class postgres_api:
    def __init__(self):
        load_dotenv()
        self.db_host = os.getenv("DB_HOST")
        self.db_port = os.getenv("DB_PORT")
        self.db_user = os.getenv("DB_USER")
        self.db_password = os.getenv("DB_PASSWORD")
        self.db_database = os.getenv("DB_DATABASE")

    def connect_to_postgres(self):
        """
        Connects to the PostgreSQL database.
        Retries the connection in case of errors.
        """
        while True:
            try:
                conn = psycopg2.connect(
                    host=self.db_host,
                    port=self.db_port,
                    user=self.db_user,
                    password=self.db_password,
                    database=self.db_database
                )
                return conn
            except psycopg2.OperationalError as e:
                log.info(f"Error connecting to PostgreSQL: {e}")
                log.info("Retrying in 5 seconds...")
                time.sleep(5)

    def table_exists(self, cur, table_name):
        """
        Checks if a table exists in the database.

        Args:
            cur: The database cursor.
            table_name: The name of the table to check.

        Returns:
            True if the table exists, False otherwise.
        """
        query = sql.SQL("SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = {})").format(
            sql.Literal(table_name)
        )
        cur.execute(query)
        return cur.fetchone()[0]

    def column_exists(self, cur, table_name, column_name):
        """
        Checks if a column exists in a table.

        Args:
            cur: The database cursor.
            table_name: The name of the table to check.
            column_name: The name of the column to check.

        Returns:
            True if the column exists, False otherwise.
        """
        query = sql.SQL("SELECT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = {} AND column_name = {})").format(
            sql.Literal(table_name),
            sql.Literal(column_name)
        )
        cur.execute(query)
        return cur.fetchone()[0]

    def create_table(self, cur, conn, table_name, columns):
        """
        Creates a table if it doesn't exist or adds missing columns to an existing table.

        Args:
            cur: The database cursor.
            conn: The database connection.
            table_name: The name of the table to create or update.
            columns: A dictionary representing the table columns and their definitions.
                     Format: {'column_name': 'column_definition'}
        """
        if not self.table_exists(cur, table_name):
            create_query = sql.SQL("CREATE TABLE IF NOT EXISTS {} (id SERIAL PRIMARY KEY, value TEXT, data JSONB)").format(
                sql.Identifier(table_name)
            )
            cur.execute(create_query)
            conn.commit()
        else:
            for column_name, column_definition in columns.items():
                if not self.column_exists(cur, table_name, column_name):
                    alter_query = sql.SQL("ALTER TABLE {} ADD COLUMN {} {}").format(
                        sql.Identifier(table_name),
                        sql.Identifier(column_name),
                        sql.SQL(column_definition)
                    )
                    cur.execute(alter_query)
                    conn.commit()

    def insert_data(self, cur, conn, table_name, data):
        """
        Inserts data into the specified table.

        Args:
            cur: The database cursor.
            conn: The database connection.
            table_name: The name of the table to insert data into.
            data: The data to be inserted.

        Returns:
            The ID of the inserted record.
        """
        insert_query = sql.SQL("INSERT INTO {} (data) VALUES (%s) RETURNING id").format(sql.Identifier(table_name))
        record = (data,)
        cur.execute(insert_query, record)
        conn.commit()
        inserted_id = cur.fetchone()[0]
        return inserted_id

    def get_data(self):
        """
        Handles the GET request to fetch data from the database.

        Returns:
            The response containing the fetched data.
        """
        log.info('get_data')
        table_name = request.args.get('tableName')
        log.info(table_name)
        data_id = request.args.get('id')
        log.info(data_id)
        try:
            conn = self.connect_to_postgres()
            cur = conn.cursor()

            columns = {
                'id': 'SERIAL PRIMARY KEY',
                'data': 'JSONB'
            }

            self.create_table(cur, conn, table_name, columns)

            if data_id:
                query = sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier(table_name))
                cur.execute(query, (data_id,))
                row = cur.fetchone()
                column_names = [desc[0] for desc in cur.description]
                data = dict(zip(column_names, row))
                response = make_response(jsonify(data))
            else:
                query = sql.SQL("SELECT * FROM {}").format(sql.Identifier(table_name))
                cur.execute(query)
                rows = cur.fetchall()
                column_names = [desc[0] for desc in cur.description]
                data = [dict(zip(column_names, row)) for row in rows]
                response = make_response(jsonify(data))

            response.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            response.headers['Pragma'] = 'no-cache'
            response.headers['Expires'] = '0'

            cur.close()
            conn.close()

            return response
        except psycopg2.Error as e:
            log.info(str(e))
            return jsonify({'error': str(e)})

    def post_data(self):
        """
        Handles the POST request to insert data into the database.

        Returns:
            The response containing the inserted data.
        """
        request_data = request.json
        table_name = request_data.get('tableName')
        data = json.dumps(request_data.get('data'))

        try:
            conn = self.connect_to_postgres()
            cur = conn.cursor()

            columns = {
                'id': 'SERIAL PRIMARY KEY',
                'data': 'JSONB'
            }

            self.create_table(cur, conn, table_name, columns)

            inserted_id = self.insert_data(cur, conn, table_name, data)

            cur.close()
            conn.close()

            response_data = {'message': 'Data saved successfully', 'data': request_data, 'id': inserted_id}
            return jsonify(response_data)
        except psycopg2.Error as e:
            return jsonify({'error': str(e)})

    def put_data(self):
        """
        Handles the PUT request to update data in the database.

        Returns:
            The response containing the updated data.
        """
        request_data = request.json
        table_name = request_data.get('tableName')
        data_id = request_data.get('data').get('id')
        new_value = request_data.get('data').get('value')

        try:
            conn = self.connect_to_postgres()
            cur = conn.cursor()

            update_query = sql.SQL("UPDATE {} SET value = %s, data = %s WHERE id = %s").format(sql.Identifier(table_name))
            cur.execute(update_query, (new_value, json.dumps(request_data.get('data')), data_id))
            conn.commit()

            select_query = sql.SQL("SELECT * FROM {} WHERE id = %s").format(sql.Identifier(table_name))
            cur.execute(select_query, (data_id,))
            row = cur.fetchone()
            column_names = [desc[0] for desc in cur.description]
            updated_data = dict(zip(column_names, row))

            cur.close()
            conn.close()

            response_data = {
                'message': 'Data updated successfully',
                'data': updated_data
            }
            return jsonify(response_data)
        except psycopg2.Error as e:
            return jsonify({'error': str(e)})

    def delete_data(self):
        """
        Handles the DELETE request to delete data from the database.

        Returns:
            The response confirming the deletion.
        """
        log.info('delete_data')
        request_data = request.json
        table_name = request_data.get('tableName')
        log.info(table_name)
        data_id = request_data.get('data').get('id')
        log.info(data_id)
        try:
            conn = self.connect_to_postgres()
            cur = conn.cursor()

            delete_query = sql.SQL("DELETE FROM {} WHERE id = %s").format(sql.Identifier(table_name))
            cur.execute(delete_query, (data_id,))
            conn.commit()

            cur.close()
            conn.close()

            return jsonify({'message': 'Data deleted successfully', 'data': request_data})
        except psycopg2.Error as e:
            return jsonify({'error': str(e)})


    def add_or_update_api_entry(self, table_name, entry):
        """
        Adds or updates an entry in the specified table.

        Args:
            table_name: The name of the table to insert or update the entry.
            entry: A dictionary representing the entry.

        Returns:
            A dictionary with a success message if the entry is created or updated successfully,
            or an error message if an error occurs.
        """
        try:
            conn = self.connect_to_postgres()
            cur = conn.cursor()

            # Check if table exists
            table_exists = self.table_exists(cur, table_name)

            if not table_exists:
                # Create table if it doesn't exist
                create_query = sql.SQL("CREATE TABLE IF NOT EXISTS {} (id SERIAL PRIMARY KEY, data JSONB)").format(
                    sql.Identifier(table_name)
                )
                cur.execute(create_query)
                conn.commit()

            if 'id' in entry:
                # Update existing entry
                update_query = sql.SQL("UPDATE {} SET data = %s WHERE id = %s").format(sql.Identifier(table_name))
                cur.execute(update_query, (json.dumps(entry), entry['id']))
            else:
                # Insert new entry
                insert_query = sql.SQL("INSERT INTO {} (data) VALUES (%s)").format(sql.Identifier(table_name))
                cur.execute(insert_query, (json.dumps(entry),))

            conn.commit()

            cur.close()
            conn.close()

            return {'message': 'Entry created or updated successfully'}
        except psycopg2.Error as e:
            return {'error': str(e)}
