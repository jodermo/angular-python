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

class discord:
    def __init__(self):
        self.token = 'MTA2NjA0NjIwNjEwMDM4NTgwMw.kq9p_OMQCGQZgLKj2bFuOprUy5M'
        self.cookie = ''

    def send_acknowledgement(self, message_id):
        post_url = f'https://discord.com/api/v9/channels/1066308382820159510/messages/{message_id}/ack'
        post_payload = {"token": None, "last_viewed": 3070}
        post_headers = {
            'Authorization': 'Bearer ' + self.token,
            'Content-Type': 'application/json'
        }
        response = requests.post(post_url, headers=post_headers, json=post_payload)
        return response.json()

    def send_acknowledgement_request(self, request):
        request_data = request.json
        message_id = request_data.get('message_id')
        result = self.send_acknowledgement(message_id)
        return jsonify(result)

    def send_scrolled_event(self):
        post_url = 'https://discord.com/api/v9/science'
        post_payload = {
            "token": "MTA2NjA0NjIwNjEwMDM4NTgwMw.kq9p_OMQCGQZgLKj2bFuOprUy5M",
            "events": [{
                "type": "application_command_browser_scrolled",
                "properties": {
                    "client_track_timestamp": 1687252775035,
                    "client_heartbeat_session_id": "f3367bbf-c30c-4df1-a420-c7daafa7f330",
                    "guild_id": "1066308382006444092",
                    "guild_size_total": 2,
                    "guild_num_channels": 2,
                    "guild_num_text_channels": 1,
                    "guild_num_voice_channels": 1,
                    "guild_num_roles": 2,
                    "guild_member_num_roles": 0,
                    "guild_member_perms": "140737488355327",
                    "guild_is_vip": False,
                    "is_member": True,
                    "num_voice_channels_active": 0,
                    "channel_id": "1066308382820159510",
                    "channel_type": 0,
                    "channel_size_total": 0,
                    "channel_member_perms": "140737488355327",
                    "channel_hidden": False,
                    "client_performance_memory": 0,
                    "accessibility_features": 524544,
                    "rendered_locale": "en-US",
                    "accessibility_support_enabled": False,
                    "client_uuid": "CzDEVGBbyw65M5xZhAka2IgBAAAHAAAA",
                    "client_send_timestamp": 1687252775112
                }
            }]
        }
        post_headers = {
            'Authorization': 'Bearer ' + self.token,
            'Content-Type': 'application/json'
        }
        response = requests.post(post_url, headers=post_headers, json=post_payload)
        return response.json()




    def send_scrolled_event_request(self, request):
        result = self.send_scrolled_event()
        return jsonify(result)


    def send_interaction(self, type = 2):
        post_url = 'https://discord.com/api/v9/interactions'
        post_payload = {
            "type": 2,
            "application_id": "936929561302675456",
            "guild_id": "1066308382006444092",
            "channel_id": "1066308382820159510",
            "session_id": "cb1b02d95a0f0449fc353bcc12ea3527",
            "data": {
                "version": "1118961510123847772",
                "id": "938956540159881230",
                "name": "imagine",
                "type": 1,
                "options": [
                    {
                        "type": 3,
                        "name": "prompt",
                        "value": "a picture of an picture od an picture of an picture"
                    }
                ],
                "application_command": {
                    "id": "938956540159881230",
                    "application_id": "936929561302675456",
                    "version": "1118961510123847772",
                    "default_member_permissions": None,
                    "type": 1,
                    "nsfw": False,
                    "name": "imagine",
                    "description": "Create images with Midjourney",
                    "dm_permission": True,
                    "contexts": [0, 1, 2],
                    "options": [
                        {
                            "type": 3,
                            "name": "prompt",
                            "description": "The prompt to imagine",
                            "required": True
                        }
                    ]
                },
                "attachments": []
            },
            "nonce": "1120653071999827968"
        }
        post_headers = {
            'Authorization': 'Bearer ' + self.token,
            'Content-Type': 'application/json'
        }
        response = requests.post(post_url, headers=post_headers, json=post_payload)
        return response.json()

    def send_interaction_request(self, request):
        request_data = request.json
        type = request_data.get('type')
        result = self.send_interaction()
        return jsonify(result)


    def search_application_commands(self, type=1, limit=10, command_ids=None, include_applications=True):
        query_params = {
            "type": type,
            "limit": limit,
            "command_ids": command_ids,
            "include_applications": include_applications
        }
        get_url = 'https://discord.com/api/v9/channels/1066308382820159510/application-commands/search'
        response = requests.get(get_url, params=query_params)
        return response.json()

    def search_application_commands_request(self, request):
        request_data = request.json
        type = request_data.get('type')
        limit = request_data.get('limit')
        command_ids = request_data.get('command_ids')
        include_applications = request_data.get('include_applications')
        result = self.search_application_commands(type, limit, command_ids, include_applications)
        return jsonify(result)

    def send_science_event(self):
        post_url = 'https://discord.com/api/v9/science'
        post_payload = {
            "token": self.token,
            "events": [{
                "type": "application_command_search_open_timing",
                "properties": {
                    "client_track_timestamp": 1687254886435,
                    "client_heartbeat_session_id": "6d6ba07e-d206-40f4-aa9c-74c7a3d03304",
                    "cached": False,
                    "duration_ms": 250,
                    "guild_id": "1066308382006444092",
                    "guild_size_total": 2,
                    "guild_num_channels": 2,
                    "guild_num_text_channels": 1,
                    "guild_num_voice_channels": 1,
                    "guild_num_roles": 2,
                    "guild_member_num_roles": 0,
                    "guild_member_perms": "140737488355327",
                    "guild_is_vip": False,
                    "is_member": True,
                    "num_voice_channels_active": 0,
                    "channel_id": "1066308382820159510",
                    "channel_type": 0,
                    "channel_size_total": 0,
                    "channel_member_perms": "140737488355327",
                    "channel_hidden": False,
                    "client_performance_memory": 0,
                    "accessibility_features": 524544,
                    "rendered_locale": "en-US",
                    "accessibility_support_enabled": False,
                    "client_uuid": "CzDEVGBbyw6EATK9Di062IgBAAAHAAAA",
                    "client_send_timestamp": 1687254886465
                }
            }]
        }
        post_headers = {
            'Content-Type': 'application/json'
        }
        response = requests.post(post_url, headers=post_headers, json=post_payload)
        return response.json()

    def send_science_event_request(self):
        request_data = request.json
        type = request_data.get('type')
        result = self.send_science_event()
        return jsonify(result)
