import os
import openai
import requests
import json
from dotenv import load_dotenv
from flask import jsonify
from modules.server_logging import server_logging

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("open_ai.log", mode)


class open_ai:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") if os.getenv("OPENAI_API_KEY") else 0
        self.organisation_id = os.getenv("OPENAI_ORGANISATION_ID") if os.getenv("OPENAI_ORGANISATION_ID") else 0
        if self.api_key:
            if self.organisation_id:
                openai.organization = self.organisation_id
            openai.api_key = self.api_key
            openai.Model.list()
            log.info('open_ai')
            log.info(self.api_key)

    def post_completions(self, prompt, role = 'user', model = 'gpt-3.5-turbo'):
        log.info('post_completions')
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
                'model': model
            }

            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            log.info('success' if 'error' in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'prompt': prompt, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'text': text, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})



    def post_completions_request(self, request):
        log.info('post_completions_request')
        request_data = request.json
        prompt = request_data.get('prompt')
        role = request_data.get('role') if request_data.get('role') else 'user'
        model = request_data.get('model') if request_data.get('model') else 'gpt-3.5-turbo'
        return self.post_completions(prompt, role, model)


    def post_chat(self, text, role = 'user', model = 'gpt-3.5-turbo'):
        log.info('post_completions')
        log.info(text)
        log.info(role)
        log.info(model)
        if self.api_key:
            url = 'https://api.openai.com/v1/chat/completions'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'model': model,
                'messages': [
                    {
                        'role': role,
                        'content': text
                    }
                ],
                'temperature': 0.7
            }

            response = requests.post(url, headers=headers, json=payload)
            data = response.json()
            log.info('success' if 'error' in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'text': text, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'text': text, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})



    def post_chat_request(self, request):
        log.info('post_chat_request')
        request_data = request.json
        text = request_data.get('text')
        role = request_data.get('role') if request_data.get('role') else 'user'
        model = request_data.get('model') if request_data.get('model') else 'gpt-3.5-turbo'
        return self.post_chat(text, role, model)

    def generate_image(self, prompt, number = 1, size = '1024x1024'):
        log.info('post_completions')
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
            data['message'] = 'Successfully generated'
            log.info('success' if 'error' in data else 'error')
            return jsonify({'success': 0 if 'error' in data else 1, 'prompt': prompt,  'number': number, 'size': size, 'response': data})
        else:
            log.info('No API key')
            return jsonify({'success': 0, 'text': prompt, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})

    def generate_image_request(self, request):
        log.info('post_completions_request')
        request_data = request.json
        prompt = request_data.get('prompt')
        number = request_data.get('number') if request_data.get('number') else 1
        size = request_data.get('size') if request_data.get('size') else '1024x1024'
        return self.generate_image(prompt, number, size)
