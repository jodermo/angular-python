import os
import mimetypes
from dotenv import load_dotenv
from flask import jsonify, send_file
from modules.server_logging import server_logging
from datetime import datetime

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("file_upload.log", mode)


class file_server:
    def __init__(self):
        load_dotenv()
        self.uploadRoot = 'app/' + os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'
        self.allowed_extensions = os.getenv("ALLOWED_EXTENSIONS", "txt,pdf,png,jpg,jpeg,gif,mp3,wav,wma,mp4,ogg,ogv,webm,csv") \
            .replace(" ", "") \
            .split(",")

    def is_text_file(self, file):
        text_file_extensions = ['.txt', '.csv']  # Add more extensions as needed
        filename, file_extension = os.path.splitext(file.filename)
        return file_extension.lower() in text_file_extensions

    def allowed_file(self, filename):
        allowed_extensions = set(self.allowed_extensions)
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions

    def get_files(self, request):
        path = '/' + self.uploadRoot + self.uploadDirectory + request.args.get('path')
        try:
            file_list = []
            for item in os.listdir(path):
                item_path = os.path.join(path, item)
                return_path = os.path.join(request.args.get('path'), item)
                if os.path.isfile(item_path):
                    file_size = os.path.getsize(item_path)  # Get the file size
                    mime_type, _ = mimetypes.guess_type(item_path)  # Get the MIME type
                    file_list.append({
                        'name': item,
                        'type': 'file',
                        'path': return_path,
                        'size': file_size,
                        'mime_type': mime_type,
                        'directory': request.args.get('path')
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

    def post_file(self, request):
        log.info('post_file')
        path = request.args.get('path')
        file_path = '/' + self.uploadRoot + self.uploadDirectory + path  # File path to save the uploaded file
        log.info(file_path)
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'})
        file = request.files['file']
        file_extension = os.path.splitext(file.filename)[1]  # Get the file extension
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")  # Generate timestamp
        file_name = f"{timestamp}_{file.filename}"  # Append timestamp to file name
        full_file_path = file_path + '/' + file_name
        log.info(file.filename)
        if file.filename == '':
            return jsonify({'error': 'No file selected'})
        if file and self.allowed_file(file.filename):
            try:
                # Create the directory if it doesn't exist
                os.makedirs(os.path.dirname(full_file_path), exist_ok=True)
                # Open and save the file with the appropriate encoding
                with open(full_file_path, 'wb') as f:
                    f.write(file.read())
                log.info('File uploaded successfully')
                return jsonify({'message': 'File uploaded successfully', 'filename': file_name, 'originalname': file.filename, 'path': path})
            except Exception as e:
                log.error(str(e))
                return jsonify({'error': str(e)})
        else:
            log.error('Invalid file type')
            return jsonify({'error': 'Invalid file type'})

    def delete_file(self, request):
        log.info('delete_file')

        path = request.args.get('path')
        log.info(path)
        filename = request.args.get('filename')
        log.info(filename)
        path = '/' + self.uploadRoot + self.uploadDirectory + path
        file_path = os.path.join(path, filename)

        log.info(file_path)

        try:
            if os.path.isfile(file_path):
                os.remove(file_path)
                log.info(f'File "{filename}" deleted successfully')
                return jsonify({'message': f'File "{filename}" deleted successfully'})
            else:
                log.error(f'File "{filename}" does not exist')
                return jsonify({'error': f'File "{filename}" does not exist'})
        except Exception as e:
            log.error(str(e))
            return jsonify({'error': str(e)})
