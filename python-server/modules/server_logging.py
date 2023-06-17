import logging

class server_logging:
    def __init__(self, log_file, mode):
        self.mode = mode
        self.log_file = log_file

        if self.mode == 'dev':
            logging.basicConfig(level=logging.INFO)
        else:
            logging.basicConfig(filename=self.log_file, level=logging.INFO)

    def info(self, message):
        if self.mode == 'dev':
            logging.info(message)
        else:
            self._log_to_file(logging.INFO, message)

    def warning(self, message):
        if self.mode == 'dev':
            logging.warning(message)
        else:
            self._log_to_file(logging.WARNING, message)

    def error(self, message):
        if self.mode == 'dev':
            logging.error(message)
        else:
            self._log_to_file(logging.ERROR, message)

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
