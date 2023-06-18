import os
import openai
import wandb
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

    def gpt_request(self, text):
        if self.api_key:
            url = 'https://api.openai.com/v1/chat/completions'
            headers = {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + self.api_key
            }
            payload = {
                'model': 'gpt-3.5-turbo',
                'messages': [
                    {'role': 'user', 'content': text}
                ],
                'temperature': 0.7
            }

            response = requests.post(url, headers=headers, json=payload)
            data = response.json()

            return jsonify({'success': 0 if 'error' in data else 1, 'text': text, 'response': data})
        else:
            return jsonify({'success': 0, 'text': text, 'response': {'error': {'code': 'No API key', 'message': 'Set your API key to OPENAI_API_KEY=KEY in .env file'}}})



    def send_gpt_prompt(self, request):
        log.info('send_gpt_prompt')
        request_data = request.json
        text = request_data.get('text')
        return self.gpt_request(text)
