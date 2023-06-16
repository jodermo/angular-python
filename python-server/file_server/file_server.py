import os
from dotenv import load_dotenv
from server_logging import server_logging
from flask import jsonify, send_file

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging.server_logging("file_upload.log", mode)

class file_server:
    def __init__(self):
        load_dotenv()
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'app/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'

    def get_files(self, request):
        path = '/' + self.uploadRoot + self.uploadDirectory + request.args.get('path')


        try:
            file_list = []
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                return_path = os.path.join(request.args.get('path'), item)
                if os.path.isfile(item_path):
                    file_list.append({
                        'name': item,
                        'type': 'file',
                        'path': return_path
                    })
                elif os.path.isdir(item_path):
                    file_list.append({
                        'name': item,
                        'type': 'directory',
                        'path': return_path
                    })

            return jsonify({'files': file_list})
        except Exception as e:
            return jsonify({'error': str(e)})

    def get_file(self, request):
        file_path = '/' + self.uploadRoot + self.uploadDirectory + request.args.get('path')
        if file_path:
            if os.path.isfile(file_path):
                try:
                    return send_file(file_path, as_attachment=True)
                except Exception as e:
                    return jsonify({'error': str(e)})
            else:
                return jsonify({'error': 'Invalid file path'})
        else:
            return jsonify({'error': 'File path not provided'})
