# https://platform.openai.com/docs/api-reference
import io
import os
import openai
import requests
import json
import urllib.request
from datetime import datetime
from dotenv import load_dotenv
from flask import jsonify
from modules.server_logging import server_logging
from modules.postgres_api import postgres_api
from modules.file_server import file_server

load_dotenv()

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("open_ai.log", mode)


class open_ai:
    def __init__(self):
        self.postgres_api = postgres_api()
        self.file_server = file_server()
        self.api_key = os.getenv("OPENAI_API_KEY") if os.getenv("OPENAI_API_KEY") else 0
        self.organisation_id = os.getenv("OPENAI_ORGANISATION_ID") if os.getenv("OPENAI_ORGANISATION_ID") else 0
        if self.api_key:
            if self.organisation_id:
                openai.organization = self.organisation_id
            openai.api_key = self.api_key
            openai.Model.list()
            log.info('open_ai')
            log.info(self.api_key)

    def list_models(self):
        if self.api_key:
            url = 'https://api.openai.com/v1/models'
            headers = {
                'Authorization': 'Bearer ' + self.api_key
            }
            response = requests.get(url, headers=headers)
            data = response.json()
            log.info('success' if 'error' not in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})

    def list_models_request(self, request):
        log.info('list_models_request')
        return self.list_models()




    def retrieve_model(self, model):
        log.info('retrieve_model')
        if self.api_key:
            url = f'https://api.openai.com/v1/models/{model}'
            headers = {
                'Authorization': 'Bearer ' + self.api_key
            }
            response = requests.get(url, headers=headers)
            data = response.json()
            log.info('success' if 'error' not in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})

    def retrieve_model_request(self, request):
        log.info('retrieve_model_request')
        model = request.args.get('model')  # Assuming model is passed as a query parameter
        return self.retrieve_model(model)

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('open-ai-response', result)

    def create_completion(self, prompt, role='user', model='gpt-3.5-turbo', max_tokens=None, temperature=None, top_p=None, n=None, stop=None):
        log.info('create_completion')
        log.info(prompt)
        log.info(role)
        log.info(model)
        if self.api_key:
            url = 'https://api.openai.com/v1/completions'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'prompt': prompt,
                'model': model,
                'max_tokens': max_tokens,
                'temperature': temperature,
                'top_p': top_p,
                'n': n,
                'stop': stop
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            result = {'success': 0 if 'error' in data else 1, 'prompt': prompt, 'response': data, 'time': datetime.timestamp(datetime.now())}
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            # log.info(data)
            log.info('success' if 'error' in data else 'error')
            return jsonify(result)
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'prompt': prompt, 'model': model, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})

    def create_completion_request(self, request):
        log.info('create_completion_request')
        request_data = request.json
        prompt = request_data.get('prompt')
        role = request_data.get('role') if request_data.get('role') else 'user'
        model = request_data.get('model') if request_data.get('model') else 'gpt-3.5-turbo'
        max_tokens = request_data.get('max_tokens')
        temperature = request_data.get('temperature')
        top_p = request_data.get('top_p')
        n = request_data.get('n')
        stop = request_data.get('stop')
        return self.create_completion(prompt, role, model, max_tokens, temperature, top_p, n, stop)


    def create_chat_completion(self, messages, model='gpt-3.5-turbo', temperature=0.7):
        log.info('create_chat_completion')
        log.info(messages)
        log.info(model)
        if self.api_key:
            url = 'https://api.openai.com/v1/chat/completions'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'model': model,
                'messages': messages,
                'temperature': temperature
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()


            result = {'success': (0 if 'error' in data else 1),'model': model, 'messages': messages, 'temperature': temperature, 'response': data, 'time': datetime.timestamp(datetime.now())}
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            log.info('success' if 'error' in data else 'error')
            return jsonify(result)
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'messages': messages, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})


    def create_chat_completion_request(self, request):
        log.info('create_chat_completion_request')
        request_data = request.json
        messages = request_data.get('messages')
        model = request_data.get('model') if request_data.get('model') else 'gpt-3.5-turbo'
        temperature = request_data.get('temperature', 0.7)
        return self.create_chat_completion(messages, model, temperature)




    def generate_image(self, prompt, number=1, size='1024x1024'):
        log.info('generate_image')
        log.info(prompt)
        log.info(number)
        log.info(size)
        if self.api_key:
            url = 'https://api.openai.com/v1/images/generations'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'prompt': prompt,
                'n': number,
                'size': size
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            result = {
                'success': (0 if 'error' in data else 1),
                'prompt': prompt,
                'n': number,
                'size': size,
                'response': data,
                'time': datetime.timestamp(datetime.now()),
                'files': []
            }
            images = data['data'] if 'data' in data else []
            for image in images:
                image_url = image['url']
                log.info('image_url: ' + image_url)
                timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
                filename = f"image_{timestamp}.png"
                try:
                    image_response = requests.get(image_url)
                    if image_response.status_code == 200:
                        image_data = image_response.content
                        image_stream = io.BytesIO(image_data)
                        image_stream.seek(0)
                        imageResult = self.file_server.save_file(image_stream, filename, 'open-ai-images')
                        if 'error' in imageResult:
                            log.error(imageResult['error'])
                            fileResult = {
                                'success': 0,
                                'error': imageResult['error'],
                                'prompt': prompt,
                                'n': number,
                                'size': size,
                                'response': data,
                                'time': datetime.timestamp(datetime.now())
                            }
                        else:
                            log.info('Image generated and saved successfully')
                            fileResult = {
                                'success': 1,
                                'filename': filename,
                                'prompt': prompt,
                                'n': number,
                                'size': size,
                                'response': data,
                                'imageResult': imageResult,
                                'time': datetime.timestamp(datetime.now())
                            }
                    else:
                        log.error('Error while retrieving the image: ' + str(image_response.status_code))
                        fileResult = {
                            'success': 0,
                            'error': 'Error while retrieving the image',
                            'prompt': prompt,
                            'n': number,
                            'size': size,
                            'response': data,
                            'time': datetime.timestamp(datetime.now())
                        }
                except Exception as e:
                    log.error('Error while saving the image: ' + str(e))
                    fileResult = {
                        'success': 0,
                        'error': 'Error while saving the image',
                        'prompt': prompt,
                        'n': number,
                        'size': size,
                        'response': data,
                        'time': datetime.timestamp(datetime.now())
                    }
                result['files'].append(fileResult)
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            log.info('success' if 'error' in data else 'error')
            return jsonify(result)


    def generate_image_request(self, request):
        log.info('post_completions_request')
        request_data = request.json
        prompt = request_data.get('prompt')
        number = request_data.get('number') if request_data.get('number') else 1
        size = request_data.get('size') if request_data.get('size') else '1024x1024'

        return self.generate_image(prompt, number, size)


    def create_image_edit(self, image, prompt, mask=None, n=1, size='1024x1024', response_format='url', user=None):
        if self.api_key:
            url = 'https://api.openai.com/v1/images/edits'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'image': image,
                'mask': mask,
                'prompt': prompt,
                'n': n,
                'size': size,
                'response_format': response_format,
                'user': user
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            return data

    def create_image_edit_request(self, request):
        log.info('create_image_edit_request')
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'})

        image = request.files['image']
        mask = request.files['mask'] if 'mask' in request.files else None

        request_data = request.json
        prompt = request_data.get('prompt')
        number = request_data.get('number') if request_data.get('number') else 1
        size = request_data.get('size') if request_data.get('size') else '1024x1024'
        response_format = request_data.get('response_format') if request_data.get('response_format') else 'url'
        user = request_data.get('user') if request_data.get('user') else None

        return self.create_image_edit(image, prompt, mask, number, size, response_format, user)


    def create_image_variation(self, image, n=1, size='1024x1024', response_format='url', user=None):
        if self.api_key:
            url = 'https://api.openai.com/v1/images/variations'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'image': image,
                'n': n,
                'size': size,
                'response_format': response_format,
                'user': user
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            return data

    def create_image_variation_request(self, request):
        log.info('create_image_variation_request')
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'})

        image = request.files['image']

        request_data = request.json
        number = request_data.get('number') if request_data.get('number') else 1
        size = request_data.get('size') if request_data.get('size') else '1024x1024'
        response_format = request_data.get('response_format') if request_data.get('response_format') else 'url'
        user = request_data.get('user') if request_data.get('user') else None

        return self.create_image_variation(image, number, size, response_format, user)


    def create_edit(self, input, instruction = '', n = 1, temperature = 1, top_p= 1, model = 'text-davinci-edit-001'):
        log.info('create_edit')
        if self.api_key:
            url = 'https://api.openai.com/v1/edits'
            headers = {
                'Authorization': 'Bearer ' + self.api_key,
                'Content-Type': 'application/json'
            }
            payload = {
                'model': model,
                'input': input,
                'instruction': instruction,
                'n': n,
                'temperature': temperature,
                'top_p': top_p,
            }

            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            result = {'success': 0 if 'error' in data else 1, 'response': data, 'time': datetime.timestamp(datetime.now())}
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            log.info('success' if 'error' not in data else 'error')
            return jsonify(result)
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})


    def create_edit_request(self, request):
        log.info('create_edit_request')
        input = request_data.get('input') if request_data.get('input') else ''
        instruction = request_data.get('instruction') if request_data.get('instruction') else ''
        n = request_data.get('n') if request_data.get('n') else 1
        temperature = request_data.get('temperature') if request_data.get('temperature') else 1
        top_p = request_data.get('top_p') if request_data.get('top_p') else 1
        model = request_data.get('model') if request_data.get('model') else 'text-davinci-edit-001'
        return self.create_edit(file, input, instruction,  n, temperature, top_p, model)

    def create_embeddings(self, texts, user=None, model='text-embedding-ada-002'):
        log.info('create_embeddings')
        if self.api_key:
            url = 'https://api.openai.com/v1/embeddings'
            headers = {
                'Authorization': 'Bearer ' + self.api_key,
                'Content-Type': 'application/json'
            }
            payload = {
                'model': model,
                'input': texts,
                'user': user
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            result = {
                'success': 0 if 'error' in data else 1,
                'response': data,
                'time': datetime.timestamp(datetime.now())
            }
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            log.info('success' if 'error' not in data else 'error')
            return jsonify(result)
        else:
            log.info('No API key')
            return jsonify({
                'success': 0,
                'response': {
                    'error': {
                        'code': 'No API key',
                        'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'
                    }
                }
            })

    def create_embeddings_request(self, request):
        log.info('create_embeddings_request')
        request_data = request.json
        texts = request_data.get('texts')
        return self.create_embeddings(texts)



    def create_audio_transcription(self, audio, model='whisper-1', prompt=None, response_format='json', temperature=0, language=None):
        log.info('create_audio_transcription')
        if self.api_key:
            url = 'https://api.openai.com/v1/audio/transcriptions'
            headers = {
                'Authorization': 'Bearer ' + self.api_key,
                'Content-Type': 'application/json'
            }
            payload = {
                'file': audio,
                'model': model,
                'prompt': prompt,
                'response_format': response_format,
                'temperature': temperature,
                'language': language
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            result = {
                'success': 0 if 'error' in data else 1,
                'response': data,
                'time': datetime.timestamp(datetime.now())
            }
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            log.info('success' if 'error' not in data else 'error')
            return jsonify(result)
        else:
            log.info('No API key')
            return jsonify({
                'success': 0,
                'response': {
                    'error': {
                        'code': 'No API key',
                        'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'
                    }
                }
            })

    def create_audio_transcription_request(self, request):
        log.info('create_audio_transcription_request')
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'})
        audio = request.files['file']
        model = request.form.get('model', 'whisper-1')
        prompt = request.form.get('prompt')
        response_format = request.form.get('response_format', 'json')
        temperature = float(request.form.get('temperature', 0))
        language = request.form.get('language')
        return self.create_audio_transcription(audio, model, prompt, response_format, temperature, language)


    def create_audio_translation(self, audio, model='whisper-1', prompt=None, response_format='json', temperature=0):
        log.info('create_audio_translation')
        if self.api_key:
            url = 'https://api.openai.com/v1/audio/translations'
            headers = {
                'Authorization': 'Bearer ' + self.api_key,
                'Content-Type': 'application/json'
            }
            payload = {
                'file': audio,
                'model': model,
                'prompt': prompt,
                'response_format': response_format,
                'temperature': temperature
            }
            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            result = {
                'success': 0 if 'error' in data else 1,
                'response': data,
                'time': datetime.timestamp(datetime.now())
            }
            dbEntry = self.add_response_to_database(result)
            result['dbEntry'] = dbEntry
            log.info('success' if 'error' not in data else 'error')
            return jsonify(result)
        else:
            log.info('No API key')
            return jsonify({
                'success': 0,
                'response': {
                    'error': {
                        'code': 'No API key',
                        'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'
                    }
                }
            })

    def create_audio_translation_request(self, request):
        log.info('create_audio_translation_request')
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'})
        audio = request.files['file']
        model = request.form.get('model', 'whisper-1')
        prompt = request.form.get('prompt')
        response_format = request.form.get('response_format', 'json')
        temperature = float(request.form.get('temperature', 0))
        return self.create_audio_translation(audio, model, prompt, response_format, temperature)


    def list_files(self):
        log.info('list_files')
        if self.api_key:
            url = 'https://api.openai.com/v1/files'
            headers = {
                'Authorization': 'Bearer ' + self.api_key
            }
            response = requests.get(url, headers=headers)
            data = response.json()
            log.info('success' if 'error' not in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})

    def list_files_request(self, request):
        log.info('list_files_request')
        return self.list_files()

    def delete_file(self, file_id):
        log.info('delete_file')
        if self.api_key:
            url = f'https://api.openai.com/v1/files/{file_id}'
            headers = {
                'Authorization': 'Bearer ' + self.api_key
            }
            response = requests.delete(url, headers=headers)
            data = response.json()
            log.info('success' if 'error' not in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'file_id': file_id, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})

    def delete_file_request(self, request):
        log.info('delete_file_request')
        request_data = request.json
        file_id = request_data.get('file_id')
        return self.delete_file(file_id)
