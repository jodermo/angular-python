# https://platform.openai.com/docs/api-reference
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

class midjourney:
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY") if os.getenv("OPENAI_API_KEY") else 0
        self.organisation_id = os.getenv("OPENAI_ORGANISATION_ID") if os.getenv("OPENAI_ORGANISATION_ID") else 0

    def get_result_from_midjourney():
        '''
            Get request for getting the result of post request
        '''
        get_url = "https://discord.com/api/v9/channels/121202**/messages?limit=50"
        get_payload = {}
        get_headers = {
            'Authorization': settings.midjourney_token,
            'Content-Type': 'application/json',
            'Cookie': <my cookie here>
        }
        get_response = requests.request(
            "GET", get_url, headers=get_headers, data=get_payload
        )
        return get_response
