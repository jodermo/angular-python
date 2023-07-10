import os
import jwt
from dotenv import load_dotenv
from flask import Flask, request, jsonify, send_file, Response
from modules.server_logging import server_logging

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("user_auth.log", mode)

class user_auth:
    def __init__(self):
        load_dotenv()
        self.username = os.getenv("USER_NAME") if os.getenv("USER_NAME") else 'Admin'
        self.password = os.getenv("USER_PASSWORD") if os.getenv("USER_PASSWORD") else False
        self.secret_key = os.getenv("SECRET_KEY") if os.getenv("SECRET_KEY") else 'secret_key'

    def login(self, request):
        request_data = request.json
        username = request_data.get('username')
        password = request_data.get('password')
        if self.password == False:
            token = self.generate_token(username)
            return jsonify({'token': token})
        if username == self.username and password == self.password:
            token = self.generate_token(username)
            return jsonify({'token': token})
        return jsonify({'error': 'Invalid username or password'}), 401

    def generate_token(self, username):
        token = jwt.encode({'username': username}, self.secret_key, algorithm='HS256')
        return token

    def password_protect(self, request):
        auth = request.authorization
        if not auth or not self.check_password(auth.username, auth.password):
            return self.authenticate_password()

    def check_password(self, username, password):
        if self.password == False:
            return True
        return username == self.username and password == self.password

    def token_protect(self, request):
        if request.method == 'OPTIONS':
            return
        if self.password == False:
            return
        auth_header = request.authorization
        if not auth_header or not self.check_token(str(auth_header)):
            return self.authenticate_token()

    def check_token(self, auth_header):
        if self.password == False:
            return True
        if auth_header and 'Bearer' in auth_header:
            token = auth_header.split(' ')[1]
            try:
                decoded_token = jwt.decode(token, self.secret_key, algorithms=['HS256'])
                return True
            except jwt.ExpiredSignatureError:
                return False
            except jwt.InvalidTokenError:
                return False
        return False


    def authenticate_password(self):
        return Response(
            "Unauthorized Access",
            401,
            {"WWW-Authenticate": 'Basic realm="Login Required"'}
        )
        
    def authenticate_token(self):
        return Response(
            "Unauthorized Access",
            401,
            {"WWW-Authenticate": 'Basic realm="Token Required"'}
        )
