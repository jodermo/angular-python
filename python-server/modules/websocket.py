# file: modules/websocket.py

import os
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request
from datetime import datetime
from modules.server_logging import server_logging
from modules.postgres_api import postgres_api

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("websocket.log", mode)

class websocket:
    def __init__(self, app):
        self.postgres_api = postgres_api()
        cors_allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
        self.socketio = SocketIO(app, cors_allowed_origins=cors_allowed_origins if cors_allowed_origins else '*')
        self.rooms = {}
        self.register_events()

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('websocket-message', result)

    def register_events(self):
        @self.socketio.on('connect')
        def handle_connect():
            log.info('Client connected')
            emit('message', {'text': 'Connected'})

        @self.socketio.on('disconnect')
        def handle_disconnect():
            log.info('Client disconnected')

        @self.socketio.on('message')
        def handle_message(data):
            log.info('Received message:')
            log.info(data)
            message = {
                'roomName': data.get('roomName', ''),
                'date': datetime.now().isoformat(),
                'subject': data.get('subject', ''),
                'message': data.get('message', ''),
                'user': data.get('user', {'username': 'No user'})
            }
            self.add_response_to_database(message)
            emit('message', message, room=data['roomName'], broadcast=True)

        @self.socketio.on('join_room')
        def handle_join_room(data):
            log.info('handle_join_room:')
            log.info(data)
            roomName = data['roomName']
            join_room(roomName)
            if roomName not in self.rooms:
                self.rooms[roomName] = set()
