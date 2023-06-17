from gtts import gTTS
import os
from flask import jsonify, send_file
from datetime import datetime
from modules.server_logging import server_logging

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("text_to_speech.log", mode)

class text_to_speech:
    def __init__(self):
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'app/'
        self.uploadDirectory = os.getenv("TEXT_TO_SPEECH_DIRECTORY") if os.getenv("TEXT_TO_SPEECH_DIRECTORY") else 'tts-files/'

    def create_directory(self, directory_path):
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def save_to_file(self, text, filename, lang='en'):
        log.info('text_to_speech play')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        tts = gTTS(text=text, lang=lang)
        tts.save(file_path)
        log.info(text)
        log.info(lang)
        log.info(file_path)
        return file_path

    def play(self, text, filename, lang='en'):
        log.info('text_to_speech play')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        tts = gTTS(text, lang=lang)
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
        text = request_data.get('text')
        lang = request_data.get('lang') if request_data.get('lang') else 'en'
        filename = request.args.get('filename', 'text.mp3')
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        log.info(unique_filename)
        file_path = self.play(text, unique_filename, lang) if play else self.save_to_file(text, unique_filename, lang)
        return jsonify({'text': text, 'filename': unique_filename, 'lang': lang, 'play': play})

    def get_text_to_speech(self, request):
        filename = request.args.get('filename') if request.args.get('filename') else 'text.mp3'
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        file_path = os.path.join(directory_path, filename)

        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'})
