# file: server.py

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from modules.ssl_manager import ssl_manager
from modules.postgres_api import postgres_api
from modules.file_server import file_server
from modules.server_logging import server_logging
from modules.websocket import websocket
from modules.text_to_speech import text_to_speech
from modules.speech_recognition import speech_recognition
from modules.webcam import webcam
from modules.image_recognition import image_recognition
from modules.open_ai import open_ai
from modules.discord import discord
from modules.eleven_labs import eleven_labs
from modules.aws_polly import aws_polly
from modules.user_auth import user_auth
from modules.build_server import build_server

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
        log.info(__name__)
        max_content_length = 1 * 1024 * 1024 * 1024
        self.max_content_length = int(os.getenv("MAX_CONTENT_LENGTH", str(max_content_length)))
        self.host = os.getenv("SERVER_HOST", "0.0.0.0")
        self.port = int(os.getenv("SERVER_PORT", 80))
        self.apiRoute = os.getenv("API_ROUTE", "/api")
        self.api = postgres_api()
        log.info('postgres_api')
        self.file_server = file_server()
        log.info('file_server')
        self.websocket = websocket(self.app)
        log.info('websocket')
        self.text_to_speech = text_to_speech()
        log.info('websocket')
        self.speech_recognition = speech_recognition(self.websocket)
        log.info('speech_recognition')
        self.build_server = build_server(self.websocket)
        log.info('build_server')
        self.webcam = webcam()
        log.info('webcam')
        self.image_recognition = image_recognition()
        log.info('face_recognition')
        self.ssl_manager = ssl_manager()
        log.info('ssl_manager')
        self.open_ai = open_ai()
        log.info('open_ai')
        self.discord = discord()
        log.info('discord')
        self.eleven_labs = eleven_labs()
        log.info('eleven_labs')
        self.aws_polly = aws_polly()
        log.info('aws_polly')
        self.user_auth = user_auth()
        log.info('user_auth')

        log.info(max_content_length)
        self.setup_app()



    def setup_app(self):
        cors_allowed_origins = os.getenv('ALLOWED_ORIGINS', '*').split(',')
        CORS(self.app, origins=cors_allowed_origins if cors_allowed_origins else ['*'])
        self.app.config['MAX_CONTENT_LENGTH'] = self.max_content_length

        self.app.before_request(self.authenticate_request)
        self.app.before_request(self.handle_chunking)

        self.app.add_url_rule('/', methods=['GET'], view_func=self.angular_build)
        self.app.add_url_rule('/<filename>', methods=['GET'], view_func=self.angular_build)

        self.app.add_url_rule(self.apiRoute +'/build', methods=['POST'], view_func=self.build)

        self.app.add_url_rule(self.apiRoute +'/auth', methods=['POST'], view_func=self.login)

        self.app.add_url_rule(self.apiRoute +'/data', methods=['GET'], view_func=self.get_data)
        self.app.add_url_rule(self.apiRoute +'/data', methods=['POST'], view_func=self.post_data)
        self.app.add_url_rule(self.apiRoute +'/data', methods=['PUT'], view_func=self.put_data)
        self.app.add_url_rule(self.apiRoute +'/data', methods=['DELETE'], view_func=self.delete_data)

        self.app.add_url_rule(self.apiRoute +'/file', methods=['POST'], view_func=self.post_file)
        self.app.add_url_rule(self.apiRoute +'/file', methods=['GET'], view_func=self.get_file)
        self.app.add_url_rule(self.apiRoute +'/file', methods=['DELETE'], view_func=self.delete_file)
        self.app.add_url_rule(self.apiRoute +'/files', methods=['GET'], view_func=self.get_files)

        self.app.add_url_rule(self.apiRoute +'/text-to-speech', methods=['POST'], view_func=self.send_text_to_speech)
        self.app.add_url_rule(self.apiRoute +'/text-to-speech', methods=['GET'], view_func=self.get_text_to_speech)

        self.app.add_url_rule(self.apiRoute +'/speech-recognition', methods=['GET'], view_func=self.get_recognize_file)

        self.app.add_url_rule(self.apiRoute +'/open-ai/chat', methods=['POST'], view_func=self.gpt_create_chat_completion_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/completions', methods=['POST'], view_func=self.gpt_create_completion_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/images', methods=['POST'], view_func=self.gpt_generate_image_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/models', methods=['GET'], view_func=self.gpt_list_models_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/models/<model>', methods=['GET'], view_func=self.gpt_retrieve_model_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/edits', methods=['POST'], view_func=self.gpt_create_edit_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/embeddings', methods=['POST'], view_func=self.gpt_create_embeddings_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/audio/transcription', methods=['POST'], view_func=self.gpt_create_audio_transcription_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/audio/translation', methods=['POST'], view_func=self.gpt_create_audio_translation_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/files/', methods=['GET'], view_func=self.gpt_list_files_request)
        self.app.add_url_rule(self.apiRoute +'/open-ai/files/<file_id>', methods=['DELETE'], view_func=self.gpt_delete_file_request)

        self.app.add_url_rule(self.apiRoute +'/discord/acknowledgement', methods=['POST'], view_func=self.discord_acknowledgement)
        self.app.add_url_rule(self.apiRoute +'/discord/scrolled', methods=['POST'], view_func=self.discord_scrolled)
        self.app.add_url_rule(self.apiRoute +'/discord/interactions', methods=['POST'], view_func=self.discord_interaction)
        self.app.add_url_rule(self.apiRoute +'/discord/application-commands/search', methods=['GET'], view_func=self.discord_search_application_commands)
        self.app.add_url_rule(self.apiRoute +'/discord/science', methods=['POST'], view_func=self.discord_send_science_event)

        self.app.add_url_rule(self.apiRoute +'/eleven-labs/voices', methods=['GET'], view_func=self.eleven_labs_get_voices)
        self.app.add_url_rule(self.apiRoute +'/eleven-labs/text-to-speech', methods=['GET'], view_func=self.eleven_labs_get_text_to_speech)
        self.app.add_url_rule(self.apiRoute +'/eleven-labs/text-to-speech', methods=['POST'], view_func=self.eleven_labs_send_text_to_speech)

        self.app.add_url_rule(self.apiRoute +'/polly/voices', methods=['GET'], view_func=self.polly_get_voices)
        self.app.add_url_rule(self.apiRoute +'/polly/text-to-speech', methods=['GET'], view_func=self.polly_get_text_to_speech)
        self.app.add_url_rule(self.apiRoute +'/polly/text-to-speech', methods=['POST'], view_func=self.polly_send_text_to_speech)

        self.app.add_url_rule(self.apiRoute +'/webcam/video', methods=['GET'], view_func=self.get_webcam_video)
        self.app.add_url_rule(self.apiRoute +'/webcam/image', methods=['POST'], view_func=self.send_webcam_image)
        self.app.add_url_rule(self.apiRoute +'/image-recognition/<filename>', methods=['GET'], view_func=self.image_recognition_image)
        self.app.add_url_rule(self.apiRoute +'/image-recognition/stream/', methods=['POST'], view_func=self.image_recognition_stream)
        self.app.add_url_rule(self.apiRoute +'/image-recognition/model/', methods=['POST'], view_func=self.image_recognition_model)

        self.app.errorhandler(Exception)(self.handle_error)
        log.info('setup_app')

    def build(self):
        self.build_server.run()
        return jsonify({'message': 'building server' })

    def authenticate_request(self):
        excluded_routes = [
            '/',
            '/<filename>',
            self.apiRoute + '/auth',
            'filename=',
            'socket.io'
        ]
        # Check if the current request matches any excluded route
        for excluded_route in excluded_routes:
            if excluded_route in request.path:
                return None  # Bypass authentication for the excluded routes
        # Perform the authentication logic for other routes
        return self.user_auth.token_protect(request)


    def login(self):
        return self.user_auth.login(request)

    def angular_build(self, filename=None):
        log.exception('filename: ' + str(filename))
        if "." in str(filename):
            return send_file('../angular-app/' + str(filename))
        else:
            return send_file('../angular-app/index.html')

    def image_recognition_model(self):
        return self.image_recognition.create_model_request(request)

    def image_recognition_stream(self):
        return self.image_recognition.recognise_from_webcam_stream(request)

    def image_recognition_image(self, filename=None):
        log.exception('face_recognition_image: ' + str(filename))
        if "." in str(filename):
            return send_file('www/uploads/webcam-recording/webcam_images_faces/' + str(filename))
        else:
            return 'Not Found', 404



    def discord_acknowledgement(self):
        return self.discord.send_acknowledgement_request(request)

    def discord_scrolled(self):
        return self.discord.send_scrolled_event_request(request)

    def discord_search_application_commands(self):
        return self.discord.search_application_commands_request(request)

    def discord_send_science_event(self):
        return self.discord.send_science_event_request(request)

    def discord_interaction(self):
        return self.discord.send_interaction_request(request)

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

    def eleven_labs_get_voices(self):
        return self.eleven_labs.get_voices_request(request)

    def eleven_labs_get_text_to_speech(self):
        return self.eleven_labs.get_text_to_speech(request)

    def eleven_labs_send_text_to_speech(self):
        return self.eleven_labs.send_text_to_speech(request)

    def polly_get_voices(self):
        return self.aws_polly.get_voices_request(request)

    def polly_get_text_to_speech(self):
        return self.aws_polly.get_text_to_speech(request)

    def polly_send_text_to_speech(self):
        return self.aws_polly.send_text_to_speech(request)

    def send_webcam_image(self):
        return self.webcam.send_image_request(request)

    def get_webcam_video(self):
        return self.webcam.get_video_request(request)

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
