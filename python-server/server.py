from flask import Flask, jsonify, request

app = Flask(__name__)

# GET API route
@app.route('/api/data', methods=['GET'])
def get_data():
    # Code to fetch data from a database or any other source
    data = [
        {'id': 1, 'name': 'John'},
        {'id': 2, 'name': 'Jane'},
        {'id': 3, 'name': 'Bob'}
    ]
    return jsonify(data)

# POST API route
@app.route('/api/data', methods=['POST'])
def post_data():
    # Get the JSON payload from the request body
    data = request.json

    # Code to process the data, such as saving it to a database
    # ...

    # Return a response
    return jsonify({'message': 'Data saved successfully'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
