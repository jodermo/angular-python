# file: modules/text_to_speech.py

from gtts import gTTS
import pyttsx3
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

    def get_pyttsx3_voices_response(self):
        log.info('get_pyttsx3_voices_response')
        voices = engine.getProperty('voices')
        log.info(voices)
        return jsonify(voices)

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

    def play_pyttsx3(self, text, rate=125, volume=1.0, female=0):
        log.info('play_pyttsx3')
        engine = pyttsx3.init()
        engine.say(text)
        engine.runAndWait()
        return 'successfully played "' + text + '""'

    def save_to_pyttsx3_file(self, text, filename, rate=125, volume=1.0, female=0):
        log.info('save_to_pyttsx3_file')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        engine = pyttsx3.init() # object creation
        # rate = engine.getProperty('rate')   # getting details of current speaking rate
        engine.setProperty('rate', rate)     # setting up new voice rate
        # volume = engine.getProperty('volume')   #getting to know current volume level (min=0 and max=1)
        engine.setProperty('volume',volume)    # setting up volume level  between 0 and 1
        voices = engine.getProperty('voices')       #getting details of current voice
        engine.setProperty('voice', voices[female].id)   #changing index, changes voices. o for male, 1 for female
        engine.save_to_file(text, file_path)
        engine.runAndWait()
        return file_path

    def send_text_to_speech(self, request):
        log.info('send_text_to_speech')
        request_data = request.json

        play = int(request.args.get('play', 0))
        offline = int(request.args.get('offline', 0))
        offline = True if offline == 1 else False
        slow = True if request.args.get('slow') else False
        text = request_data.get('text')
        lang = request_data.get('lang', 'en')
        rate = int(request_data.get('rate', 125))
        volume = float(request_data.get('volume', 1.0))
        female = int(request_data.get('female', 0))
        filename = request.args.get('filename', 'text.mp3')

        parentId = int(request_data.get('parentId', 0))
        tableName = request_data.get('tableName', False)

        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        log.info(unique_filename)
        file_path = (
            (
                self.play_pyttsx3(text, rate, volume, female) if offline else
                self.play(text, unique_filename, lang, slow)
            ) if play == 1 else (
                self.save_to_pyttsx3_file(text, unique_filename, rate, volume, female) if offline else
                self.save_to_file(text, unique_filename, lang, slow)
            )
        )
        result = {'mode': 'pyttsx3' if offline else 'gtts', 'text': text, 'filename': unique_filename, 'lang': lang, 'play': play}
        if parentId:
            result['parentId'] = parentId
        if tableName:
            result['tableName'] = tableName

        dbEntry = self.add_response_to_database(result)
        result_copy = result.copy()  # Create a copy of the result dictionary
        result_copy['dbEntry'] = dbEntry
        return jsonify(result_copy)

    def get_text_to_speech(self, request):
        filename = request.args.get('filename') if request.args.get('filename') else 'text.mp3'
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        file_path = os.path.join(directory_path, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True)
        else:
            return jsonify({'error': 'File not found'})
