# file: modules/speech_recognition.py

import wave
import os
import tempfile
import io
import uuid
import time
import soundfile as sf
import numpy as np
from pydub import AudioSegment

from flask import jsonify
from flask_socketio import SocketIO, emit
from datetime import datetime
from modules.server_logging import server_logging
import speech_recognition as sr
from pydub import AudioSegment
import subprocess

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("speech_recognition.log", mode)


class speech_recognition:
    def __init__(self, websocket):
        self.websocket = websocket
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'
        self.register_events()

    def convert_to_wav(self, input_file, output_file):
        audio = AudioSegment.from_file(input_file)
        audio.export(output_file, format='wav')

    def generate_unique_filename(self):
        timestamp = int(time.time())
        unique_id = str(uuid.uuid4().hex)
        filename = f"audio_{timestamp}_{unique_id}.wav"
        return filename

    def register_events(self):
         @self.websocket.socketio.on('audio')
         def process_audio(data):
             # Extract the audio data from the request
             audio_data = data.get('audio')
             language = data.get('language', 'en-US')
             words = data.get('words', [])
             sentence = data.get('sentence', '')
             # Generate a unique filename
             filename = self.generate_unique_filename()

             # Save the audio data to a temporary file
             with tempfile.NamedTemporaryFile(suffix='.mp3', delete=False) as temp_file:
                 temp_filepath = temp_file.name
                 temp_file.write(audio_data)

             try:
                 # Convert the audio file to WAV format
                 wav_filepath = os.path.join(tempfile.gettempdir(), f"{filename}.wav")
                 self.convert_to_wav(temp_filepath, wav_filepath)

                 # Perform speech recognition on the converted WAV file
                 recognizer = sr.Recognizer()
                 with sr.AudioFile(wav_filepath) as source:
                     audio = recognizer.record(source)
                     text = recognizer.recognize_google(audio, language=language)


                 # Check if the recognized text contains any of the words
                 words_detected = [word for word in words if word.lower() in text.lower()]

                 # Check if the recognized text matches the sentence
                 sentence_detected = text.lower() == sentence.lower()
                 # Use the recognized text
                 print('Recognized text:', text)
                 # Remove the temporary files
                 os.remove(temp_filepath)
                 os.remove(wav_filepath)
                 if words_detected:
                    self.websocket.send_message('speech-recognition', {
                        'words': words_detected,
                        'language': language,
                        'text': text,
                        'event': 'words_detected',
                        'roomName': 'speech-recognition',
                        'audio_data': audio_data
                    })
                 if sentence_detected:
                    self.websocket.send_message('speech-recognition', {
                        'sentence': sentence_detected,
                        'language': language,
                        'text': text,
                        'event': 'sentence_detected',
                        'roomName': 'speech-recognition',
                        'audio_data': audio_data
                    })
                 if not sentence_detected and not words_detected:
                    self.websocket.send_message('speech-recognition', {
                        'language': language,
                        'text': text,
                        'event': 'nothing_detected',
                        'roomName': 'speech-recognition',
                        'audio_data': audio_data
                    })
             except sr.UnknownValueError as e:
                 # Handle speech recognition errors
                 error = {
                     'message': 'Speech Recognition could not understand audio',
                 }
                 self.websocket.send_message('speech-recognition', {
                     'error': error,
                     'event': 'error',
                     'roomName': 'speech-recognition',
                     'language': language
                 })
                 print(error)
             except sr.RequestError as e:
                 error = {
                     'message': 'Could not request results from Speech Recognition service:' + str(e)
                 }
                 self.websocket.send_message('speech-recognition', {
                     'error': error,
                     'event': 'error',
                     'roomName': 'speech-recognition',
                     'language': language,
                     'sample_rate': sample_rate,
                     'sample_rate': sample_width
                 })
                 print(error)





    def create_directory(self, directory_path):
        log.info('create_directory')
        log.info(directory_path)
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def mp3_to_wav(self, input_file, output_path):
        log.info('mp3_to_wav')
        log.info(input_file)
        log.info(output_path)
        audio = AudioSegment.from_file(input_file)
        audio.export(output_path, format='wav')
        log.info('success')

    def wma_to_wav(self, input_file, output_path):
        log.info('wma_to_wav')
        log.info(input_file)
        log.info(output_path)
        subprocess.run(['mplayer', '-vo', 'null', '-vc', 'null', '-af', 'resample=44100', '-ao', 'pcm:waveheader', input_file, '-ao', 'pcm:file=' + output_path])
        log.info('success')

    def recognize_file(self, filename, path, language="en-US"):
        filename = filename.split("?")[0]
        log.info('recognize_file')
        log.info(filename)
        directory_path = os.path.join(self.uploadRoot, self.uploadDirectory, path)
        self.create_directory(directory_path)
        file_path = os.path.join(directory_path, filename)
        log.info(file_path)
        try:
            if not os.path.isfile(file_path):
                return jsonify({'success': 0, 'error': 'File not found', 'filename': filename, 'path': file_path, 'language': language, 'directory': directory_path})

            # Check the file extension
            _, file_extension = os.path.splitext(filename)
            file_extension = file_extension.lower()

            if file_extension not in ['.wav', '.wma', '.mp3']:
                # return jsonify({'success': 0, 'error': 'Invalid file format', 'filename': filename, 'path': file_path, 'language': language, 'directory': directory_path})
                log.info(file_extension)

            # Convert non-WAV files to WAV format
            if file_extension == '.mp3':
                wav_file = os.path.join(directory_path, f"{os.path.splitext(filename)[0]}.wav")
                self.mp3_to_wav(file_path, wav_file)
                file_path = wav_file

            if file_extension == '.wma':
                wav_file = os.path.join(directory_path, f"{os.path.splitext(filename)[0]}.wav")
                self.wma_to_wav(file_path, wav_file)
                file_path = wav_file


            log.info(file_path)
            # Initialize recognizer class (for recognizing the speech)
            r = sr.Recognizer()

            # Reading Audio file as source
            # Listening to the audio file and store in audio_text variable
            with sr.AudioFile(file_path) as source:
                audio_text = r.listen(source)

                # recognize_() method will throw a request error if the API is unreachable, hence using exception handling
                try:
                    # Using Google Speech Recognition
                    text = r.recognize_google(audio_text, language=language)
                    log.info('Converting audio transcripts into text ...')
                    log.info(text)
                    return jsonify({'success': 1, 'text': text, 'filename': filename, 'path': file_path, 'language': language, 'directory': directory_path})
                except sr.UnknownValueError:
                    return jsonify({'success': 0, 'error': 'Speech Recognition could not understand audio', 'filename': filename, 'path': file_path,'language': language,  'directory': directory_path})
                except sr.RequestError as e:
                    return jsonify({'success': 0, 'error': 'Could not request results from Speech Recognition service: ' + str(e), 'filename': filename, 'path': file_path, 'language': language, 'directory': directory_path})

        except Exception as ex:
            return jsonify({'success': 0, 'error': 'Error occurred: ' + str(ex), 'filename': filename, 'path': file_path, 'language': language, 'directory': directory_path})

        return jsonify({'success': 0, 'error': 'Unknown error occurred', 'filename': filename, 'path': file_path,'language': language,  'directory': directory_path})

    def get_recognize_file(self, request):
        path =  request.args.get('path') if request.args.get('path') else 'records'
        filename = request.args.get('filename') if request.args.get('filename') else 'text.mp3'
        language = request.args.get('language') if request.args.get('language') else 'en-US'
        return self.recognize_file(filename, path, language)
