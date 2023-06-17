import os
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request
from datetime import datetime
from modules.server_logging import server_logging

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("postgres_api.log", mode)

class websocket:
    def __init__(self, app):
        cors_allowed_origins = os.getenv('ALLOWED_ORIGINS', '*')
        self.socketio = SocketIO(app, cors_allowed_origins=cors_allowed_origins if cors_allowed_origins else '*')
        self.rooms = {}

        self.register_events()

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
            emit('message', {'roomName': data.get('roomName', ''),
                             'date': datetime.now().isoformat(),
                             'subject': data.get('subject', ''),
                             'message': data.get('message', ''),
                             'user': data.get('user', {'username': 'No user'})},
                 room=data['roomName'], broadcast=True)

        @self.socketio.on('join_room')
        def handle_join_room(data):
            roomName = data['roomName']
            join_room(roomName)
            if roomName not in self.rooms:
                self.rooms[roomName] = set()
