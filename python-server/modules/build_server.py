import PyInstaller.__main__
import datetime
import os
import sys
from flask import jsonify
from flask_socketio import SocketIO, emit


from modules.server_logging import server_logging
from modules.websocket import websocket


mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("build_server.log", mode)

class build_server:
    def __init__(self, websocket):
        self.websocket = websocket
        self.entry_file = 'server.py'
        self.register_events()


    def register_events(self):
         @self.websocket.socketio.on('server-build')
         def receiveMessage(data):
            log.set_websocket(self.websocket)
            log.info(receiveMessage)
            log.info(data)
            log.info('Starting build process...')
            self.sendMessage('Starting build process...', False, False)
            log_messages = []
            old_stdout = sys.stdout
            old_stderr = sys.stderr
            sys.stdout = StdOutLogger(log_messages, self.websocket)
            sys.stderr = StdErrLogger(log_messages, self.websocket)

            try:
                PyInstaller.__main__.run([
                    self.entry_file,
                    '--onefile',
                    '--windowed'
                ])
                self.sendMessage('Build process completed.', False, True)
            except Exception as e:
                self.sendMessage('Build process failed.', True, True)
                self.sendMessage(str(e), True, True)
                log.info('Build process failed.')

            finally:
                sys.stdout = old_stdout
                sys.stderr = old_stderr
                # Send log messages
                for message in log_messages:
                    log.info('message')
                    self.sendMessage(message, False, False)

    def sendMessage(self, message, is_error, done):
        time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        messageData = {
            'time': time,
            'event': 'update',
            'roomName': 'server-build',
            'isError': is_error,
            'done': done,
            'message': message
        }
        # log.info(messageData)
        self.websocket.send_message('server-build', messageData)


class StdOutLogger:
    def __init__(self, log_list, websocket):
        self.log_list = log_list
        log.set_websocket(websocket)

    def write(self, message):
        log.info(message)
        self.log_list.append(message)

    def flush(self):
        pass

class StdErrLogger:
    def __init__(self, log_list, websocket):
        self.log_list = log_list


    def write(self, message):
        log.error(message)
        self.log_list.append(message)

    def flush(self):
        pass
