import os
from flask import jsonify
from datetime import datetime
from modules.server_logging import server_logging
import speech_recognition as sr
from pydub import AudioSegment
import subprocess

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("speech_recognition.log", mode)


class speech_recognition:
    def __init__(self):
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'

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
                return jsonify({'success': 0, 'error': 'Invalid file format', 'filename': filename, 'path': file_path, 'language': language, 'directory': directory_path})



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
