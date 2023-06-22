from gtts import gTTS
import os
from flask import jsonify, send_file
from datetime import datetime
from io import BytesIO
from modules.server_logging import server_logging
from modules.postgres_api import postgres_api

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("text_to_speech.log", mode)

class text_to_speech:
    def __init__(self):
        self.postgres_api = postgres_api()
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("TEXT_TO_SPEECH_DIRECTORY") if os.getenv("TEXT_TO_SPEECH_DIRECTORY") else 'tts-files/'

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('text-to-speech', result)

    def create_directory(self, directory_path):
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def save_to_file(self, text, filename, lang='en', slow=False):
        log.info('text_to_speech play')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        tts = gTTS(text=text, lang=lang, slow=slow)
        tts.save(file_path)
        log.info(text)
        log.info(lang)
        log.info(file_path)
        return file_path

    def play(self, text, filename, lang='en', slow=False):
        log.info('text_to_speech play')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        tts = gTTS(text, lang=lang, slow=slow)
        tts.save(file_path)
        try:
            os.system('mpg123 ' + file_path)
        except Exception as e:
            log.error(f"Failed to play audio: {e}")
        log.info(text)
        log.info(lang)
        log.info(file_path)
        return file_path

    def send_text_to_speech(self, request):
        request_data = request.json
        play = request.args.get('play') if request.args.get('play') else 0
        slow = True if request.args.get('slow') else False
        text = request_data.get('text')
        lang = request_data.get('lang') if request_data.get('lang') else 'en'
        filename = request.args.get('filename', 'text.mp3')
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        log.info(unique_filename)
        file_path = self.play(text, unique_filename, lang, slow) if play else self.save_to_file(text, unique_filename, lang, slow)

        result = {'text': text, 'filename': unique_filename, 'lang': lang, 'play': play}
        dbEntry = self.add_response_to_database(result)
        result['dbEntry'] = dbEntry

        return jsonify(result)

    def get_text_to_speech(self, request):
        filename = request.args.get('filename') if request.args.get('filename') else 'text.mp3'
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        file_path = os.path.join(directory_path, filename)

        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'})
