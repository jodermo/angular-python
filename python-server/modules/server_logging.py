# file: modules/server_logging.py

import logging

class server_logging:
    def __init__(self, log_file, mode):
        self.mode = mode
        self.log_file = log_file
        self.websocket = False

        if self.mode == 'dev':
            logging.basicConfig(level=logging.INFO)
        else:
            logging.basicConfig(filename=self.log_file, level=logging.INFO)

    def set_websocket(self, websocket):
        self.websocket = websocket

    def info(self, message):
        if self.mode == 'dev':
            logging.info(message)
        else:
            self._log_to_file(logging.INFO, message)
        if self.websocket:
            try:
              self.websocket.send_message('warning', message)
            except:
              print("no websocket")


    def warning(self, message):
        if self.mode == 'dev':
            logging.warning(message)
        else:
            self._log_to_file(logging.WARNING, message)
        if self.websocket:
            try:
              self.websocket.send_message('warning', message)
            except:
              print("no websocket")



    def error(self, message):
        if self.mode == 'dev':
            logging.error(message)
        else:
            self._log_to_file(logging.ERROR, message)
        if self.websocket:
            try:
              self.websocket.send_message('warning', message)
            except:
              print("no websocket")

    def exception(self, message):
        if self.mode == 'dev':
            logging.exception(message)
        else:
            self._log_to_file(logging.ERROR, message, exc_info=True)

    def _log_to_file(self, level, message, exc_info=False):
        logger = logging.getLogger()
        file_handler = logging.FileHandler(self.log_file)
        formatter = logging.Formatter('[%(asctime)s] [%(levelname)s] [%(module)s] %(message)s')
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        logger.setLevel(level)
        logger.log(level, message, exc_info=exc_info)
        logger.removeHandler(file_handler)
