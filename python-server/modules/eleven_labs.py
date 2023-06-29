import os
from flask import jsonify, send_file
from datetime import datetime
from modules.server_logging import server_logging
from modules.postgres_api import postgres_api
from io import BytesIO
import requests

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("text_to_speech.log", mode)

class eleven_labs:
    def __init__(self):
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("TEXT_TO_SPEECH_DIRECTORY") if os.getenv("TEXT_TO_SPEECH_DIRECTORY") else 'tts-files/'
        self.apiKey = os.getenv("ELEVEN_LABS_API_KEY") if os.getenv("ELEVEN_LABS_API_KEY") else ''
        self.postgres_api = postgres_api()

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('text-to-speech', result)


    def get_voices(self):
        log.info('get_voices')
        voices_url = "https://api.elevenlabs.io/v1/voices"
        response = requests.get(voices_url)
        response.raise_for_status()
        voices = response.json()
        return voices

    def get_voices_request(self, request):
        return self.get_voices()

    def create_directory(self, directory_path):
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def save_to_file(self, text, model_id, voice_id, stability, similarity_boost, filename):
        log.info('text_to_speech save_to_file')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        tts_url = f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}"
        data = {
          "text": text,
          "voice_id": voice_id,
          "model_id": model_id,
          "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost
          }
        }
        headers = {
            "Accept": "audio/mpeg",
            "xi-api-key": self.apiKey
        }

        response = requests.post(tts_url, json=data, headers=headers)

        response.raise_for_status()
        with open(file_path, 'wb') as f:
            f.write(response.content)
        log.info(text)
        log.info(voice_id)
        log.info(stability)
        log.info(similarity_boost)
        log.info(file_path)
        return file_path

    def play(self, text, model_id, voice_id, stability, similarity_boost, filename):
        log.info('text_to_speech play')
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        tts_url = f"https://api.elevenlabs.io/v1/text-to-speech/${voice_id}"
        data = {
          "text": text,
          "model_id": model_id,
          "voice_id": voice_id,
          "voice_settings": {
            "stability": stability,
            "similarity_boost": similarity_boost
          }
        }
        headers = {
            "Accept": "audio/mpeg",
            "xi-api-key": self.apiKey
        }
        response = requests.post(tts_url, json=data, headers=headers)
        response.raise_for_status()
        with open(file_path, 'wb') as f:
            f.write(response.content)
        try:
            os.system('mpg123 ' + file_path)
        except Exception as e:
            log.error(f"Failed to play audio: {e}")
        log.info(text)
        log.info(voice_id)
        log.info(stability)
        log.info(similarity_boost)
        log.info(file_path)
        return file_path

    def send_text_to_speech(self, request):
        log.info('send_text_to_speech')
        request_data = request.json
        play = request.args.get('play') if request.args.get('play') else 0
        text = request_data.get('text')
        model_id = request_data.get('model_id') if request_data.get('model_id') else 'eleven_multilingual_v1'
        voice_id = request_data.get('voice_id')
        stability = request_data.get('stability') if request_data.get('stability') else 'en'
        similarity_boost = request_data.get('similarity_boost') if request_data.get('similarity_boost') else 'en'
        filename = request.args.get('filename', 'text.mp3')
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"

        log.info(unique_filename)
        log.info(voice_id)
        file_path = self.play(text, model_id, voice_id, stability, similarity_boost, unique_filename) if play else self.save_to_file(text, model_id, voice_id, stability, similarity_boost, unique_filename)
        result = {'mode': 'eleven-labs', 'text': text, 'filename': unique_filename, 'file_path': file_path, 'voice_id': voice_id, 'stability': stability, 'similarity_boost': similarity_boost,  'play': play}
        dbEntry = self.add_response_to_database(result)
        result['dbEntry'] = dbEntry
        return jsonify(result)

    def get_text_to_speech(self, request):
        log.info('get_text_to_speech')
        filename = request.args.get('filename') if request.args.get('filename') else 'text.mp3'
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        file_path = os.path.join(directory_path, filename)

        if os.path.exists(file_path):
            log.info('file_path')
            log.info(file_path)
            return send_file(file_path, as_attachment=True)
        else:
            log.info('error File not found')
            return jsonify({'error': 'File not found'})
