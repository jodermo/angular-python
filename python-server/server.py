from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from modules.ssl_manager import ssl_manager
from modules.postgres_api import postgres_api
from modules.file_server import file_server
from modules.server_logging import server_logging
from modules.websocket import websocket
from modules.text_to_speech import text_to_speech
from modules.speech_recognition import speech_recognition
from modules.open_ai import open_ai
import os
from dotenv import load_dotenv

load_dotenv()

mode = os.getenv("MODE")
mode = mode if mode else 'dev'

log = server_logging("server.log", mode)


class Server:
    def __init__(self):
        log.info('__init__')
        self.app = Flask(__name__)
        max_content_length = 1 * 1024 * 1024 * 1024

        self.max_content_length = int(os.getenv("MAX_CONTENT_LENGTH", str(max_content_length)))
        self.host = os.getenv("SERVER_HOST", "0.0.0.0")
        self.port = int(os.getenv("SERVER_PORT", 80))
        self.api = postgres_api()
        self.file_server = file_server()
        self.websocket = websocket(self.app)
        self.text_to_speech = text_to_speech()
        self.speech_recognition = speech_recognition()
        self.ssl_manager = ssl_manager()
        self.open_ai = open_ai()
        self.setup_app()


    def setup_app(self):
        cors_allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
        CORS(self.app, origins=cors_allowed_origins if cors_allowed_origins else ['*'])
        self.app.config['MAX_CONTENT_LENGTH'] = self.max_content_length

        self.app.before_request(self.handle_chunking)
        self.app.add_url_rule('/', methods=['GET'], view_func=self.angular_build)
        self.app.add_url_rule('/<filename>', methods=['GET'], view_func=self.angular_build)
        self.app.add_url_rule('/data', methods=['GET'], view_func=self.get_data)
        self.app.add_url_rule('/data', methods=['POST'], view_func=self.post_data)
        self.app.add_url_rule('/data', methods=['PUT'], view_func=self.put_data)
        self.app.add_url_rule('/data', methods=['DELETE'], view_func=self.delete_data)
        self.app.add_url_rule('/file', methods=['POST'], view_func=self.post_file)
        self.app.add_url_rule('/files', methods=['GET'], view_func=self.get_files)
        self.app.add_url_rule('/file', methods=['GET'], view_func=self.get_file)
        self.app.add_url_rule('/file', methods=['DELETE'], view_func=self.delete_file)
        self.app.add_url_rule('/text-to-speech', methods=['POST'], view_func=self.send_text_to_speech)
        self.app.add_url_rule('/text-to-speech', methods=['GET'], view_func=self.get_text_to_speech)
        self.app.add_url_rule('/speech-recognition', methods=['GET'], view_func=self.get_recognize_file)
        self.app.add_url_rule('/open-ai/chat', methods=['POST'], view_func=self.gpt_create_chat_completion_request)
        self.app.add_url_rule('/open-ai/completions', methods=['POST'], view_func=self.gpt_create_completion_request)
        self.app.add_url_rule('/open-ai/images', methods=['POST'], view_func=self.gpt_generate_image_request)
        self.app.add_url_rule('/open-ai/models', methods=['GET'], view_func=self.gpt_list_models_request)
        self.app.add_url_rule('/open-ai/models/<model>', methods=['GET'], view_func=self.gpt_retrieve_model_request)
        self.app.add_url_rule('/open-ai/edits', methods=['POST'], view_func=self.gpt_create_edit_request)
        self.app.add_url_rule('/open-ai/embeddings', methods=['POST'], view_func=self.gpt_create_embeddings_request)
        self.app.add_url_rule('/open-ai/audio/transcription', methods=['POST'], view_func=self.gpt_create_audio_transcription_request)
        self.app.add_url_rule('/open-ai/audio/translation', methods=['POST'], view_func=self.gpt_create_audio_translation_request)
        self.app.add_url_rule('/open-ai/files/', methods=['GET'], view_func=self.gpt_list_files_request)
        self.app.add_url_rule('/open-ai/files/<file_id>', methods=['DELETE'], view_func=self.gpt_delete_file_request)


        self.app.errorhandler(Exception)(self.handle_error)
        log.info('setup_app')

    def angular_build(self, filename=None):
        log.exception('filename: ' + str(filename))
        if "." in str(filename):
            return send_file('../angular-app/' + str(filename))
        else:
            return send_file('../angular-app/index.html')

    def get_data(self):
        return self.api.get_data()

    def post_data(self):
        return self.api.post_data()

    def put_data(self):
        return self.api.put_data()

    def delete_data(self):
        return self.api.delete_data()

    def get_text_to_speech(self):
        return self.text_to_speech.get_text_to_speech(request)

    def send_text_to_speech(self):
        return self.text_to_speech.send_text_to_speech(request)

    def get_recognize_file(self):
        return self.speech_recognition.get_recognize_file(request)

    def post_file(self):
        return self.file_server.post_file(request)

    def get_file(self):
        return self.file_server.get_file(request)

    def get_files(self):
        return self.file_server.get_files(request)

    def delete_file(self):
        return self.file_server.delete_file(request)

    def gpt_create_chat_completion_request(self):
        log.info('create_chat_completion_request')
        return self.open_ai.create_chat_completion_request(request)


    def gpt_create_completion_request(self):
        return self.open_ai.create_completion_request(request)

    def gpt_generate_image_request(self):
        return self.open_ai.generate_image_request(request)


    def gpt_list_models_request(self):
        return self.open_ai.list_models_request(request)

    def gpt_retrieve_model_request(self):
        return self.open_ai.retrieve_model_request(request)

    def gpt_create_edit_request(self):
        return self.open_ai.create_edit_request(request)

    def gpt_create_embeddings_request(self):
        return self.open_ai.create_embeddings_request(request)

    def gpt_create_audio_transcription_request(self):
        return self.open_ai.create_audio_transcription_request(request)

    def gpt_create_audio_translation_request(self):
        return self.open_ai.create_audio_translation_request(request)

    def gpt_list_files_request(self):
        return self.open_ai.list_files_request(request)

    def gpt_delete_file_request(self):
        return self.open_ai.delete_file_request(request)


    def handle_error(self, e):
        log.exception(str(e))
        response = jsonify(error=str(e))
        response.status_code = 500
        return response

    def handle_chunking(self):
        transfer_encoding = request.headers.get("Transfer-Encoding", None)
        if transfer_encoding == u"chunked":
            request.environ["wsgi.input_terminated"] = True

    def run(self):
        log.exception('run')
        log.exception(self.host + ':' +  str(self.port))
        if os.getenv("SSL_ACTIVE") and os.getenv("SSL_PRIVATE_KEY_PATH"):
            log.exception('SSL active')
            context = server.ssl_manager.get_ssl_context()
            server.app.run(host=self.host, port=self.port, ssl_context=context)
        else:
            log.exception('SSL inactive')
            server.app.run(host=self.host, port=self.port)


if __name__ == '__main__':
    server = Server()
    server.run()
