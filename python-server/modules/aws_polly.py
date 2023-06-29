from flask import jsonify, send_file, Flask, request
import os
from datetime import datetime
import boto3
from botocore.exceptions import BotoCoreError, NoCredentialsError
import requests
from modules.server_logging import server_logging
from modules.postgres_api import postgres_api

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("text_to_speech.log", mode)

class aws_polly:
    def __init__(self):
        aws_region = os.getenv("AWS_DEFAULT_REGION") if os.getenv("AWS_DEFAULT_REGION") else 'us-east-1'
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("TEXT_TO_SPEECH_DIRECTORY") if os.getenv("TEXT_TO_SPEECH_DIRECTORY") else 'tts-files/'
        self.polly_client = boto3.client('polly', region_name=aws_region)
        self.postgres_api = postgres_api()

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('text-to-speech', result)

    def create_directory(self, directory_path):
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def get_voices(self):
        try:
            response = self.polly_client.describe_voices()
            voices = response
            return voices
        except (BotoCoreError, NoCredentialsError) as e:
            print(f"Failed to fetch voices from AWS Polly: {e}")
            return None

    def get_voices_request(self, request):
        return self.get_voices()


    def save_to_file(self, text, filename, engine = 'standard', voice_id='Maxim', slow=False):
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        try:
            response = self.polly_client.synthesize_speech(
                Text=text,
                OutputFormat='mp3',
                Engine=engine,
                VoiceId=voice_id
            )
            # Save the audio data to a file
            with open(file_path, 'wb') as f:
                f.write(response['AudioStream'].read())
        except (BotoCoreError, NoCredentialsError) as e:
            print(f"Failed to generate audio using AWS Polly: {e}")
            return None
        return file_path

    def send_text_to_speech(self, request):
        request_data = request.json
        slow = True if request.args.get('slow') else False
        text = request_data.get('text')
        voice_id = request_data.get('voice_id') if request_data.get('voice_id') else 'Maxim'
        engine = request_data.get('engine') if request_data.get('engine') else 'standard'
        filename = request.args.get('filename', 'text.mp3')
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_filename = f"{timestamp}_{filename}"
        file_path = self.save_to_file(text, unique_filename, engine, voice_id, slow)
        if not file_path:
            return jsonify({'error': 'Failed to generate audio'})
        result = {'mode': 'polly', 'text': text, 'engine': engine, 'voice_id': voice_id,'filename': unique_filename, 'file_path': file_path}
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
