from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from postgres_api import postgres_api
from file_server import file_server
from file_upload import file_upload
from server_logging import server_logging
import os


mode = os.getenv("MODE")
mode = mode if mode else 'dev'

log = server_logging.server_logging("server.log", mode)


class Server:
    def __init__(self):
        self.app = Flask(__name__)
        max_content_length = 1 * 1024 * 1024 * 1024
        self.max_content_length = int(os.getenv("MAX_CONTENT_LENGTH", str(max_content_length)))
        self.host = os.getenv("SERVER_HOST", "0.0.0.0")
        self.port = int(os.getenv("SERVER_PORT", 8000))
        self.api = postgres_api.postgres_api()
        self.file_server = file_server.file_server()
        self.file_upload = file_upload.file_upload()
        self.setup_app()
        log.info('__init__')

    def setup_app(self):
        CORS(self.app)
        self.app.config['MAX_CONTENT_LENGTH'] = self.max_content_length

        # Add the before_request handler
        self.app.before_request(self.handle_chunking)

        self.app.add_url_rule('/', methods=['GET'], view_func=self.index_html)
        self.app.add_url_rule('/data', methods=['GET'], view_func=self.get_data)
        self.app.add_url_rule('/data', methods=['POST'], view_func=self.post_data)
        self.app.add_url_rule('/data', methods=['PUT'], view_func=self.put_data)
        self.app.add_url_rule('/data', methods=['DELETE'], view_func=self.delete_data)
        self.app.add_url_rule('/file', methods=['POST'], view_func=self.post_file)
        self.app.add_url_rule('/files', methods=['GET'], view_func=self.get_files)
        self.app.add_url_rule('/file', methods=['GET'], view_func=self.get_file)

        self.app.errorhandler(Exception)(self.handle_error)
        log.info('setup_app')


    def index_html(self):
        return send_file('index.html')

    def get_data(self):
        return self.api.get_data()

    def post_data(self):
        return self.api.post_data()

    def put_data(self):
        return self.api.put_data()

    def delete_data(self):
        return self.api.delete_data()

    def post_file(self):
        return self.file_upload.post_file(request)


    def get_files(self):
        return self.file_server.get_files(request)


    def get_file(self):
        return self.file_server.get_file(request)






    def handle_error(self, e):
        log.exception(str(e))
        response = jsonify(error=str(e))
        response.status_code = 500  # Set the status code to indicate the error
        return response

    def handle_chunking(self):
        """
        Sets the "wsgi.input_terminated" environment flag, thus enabling
        Werkzeug to pass chunked requests as streams. The gunicorn server
        should set this, but it's not yet been implemented.
        """

        transfer_encoding = request.headers.get("Transfer-Encoding", None)
        if transfer_encoding == u"chunked":
            request.environ["wsgi.input_terminated"] = True

    def run(self):
        self.app.run(host=self.host, port=self.port)


if __name__ == '__main__':
    server = Server()
    server.run()
