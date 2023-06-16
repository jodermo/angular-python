import os
from dotenv import load_dotenv
from server_logging import server_logging
from flask import jsonify

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging.server_logging("file_upload.log", mode)

class file_upload:
    def __init__(self):


        load_dotenv()
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'app/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'
        self.allowed_extensions = os.getenv("ALLOWED_EXTENSIONS", "txt,pdf,png,jpg,jpeg,gif") \
            .replace(" ", "") \
            .split(",")

    def post_file(self, request):

        log.info('post_file')

        file_path = '/' + self.uploadRoot + self.uploadDirectory +  request.args.get('path')  # File path to save the uploaded file


        log.info(file_path)

        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'})

        file = request.files['file']

        file_path += '/' + file.filename

        log.info(file.filename)

        if file.filename == '':
            return jsonify({'error': 'No file selected'})

        if file and self.allowed_file(file.filename):
            try:
                # Create the directory if it doesn't exist
                os.makedirs(os.path.dirname(file_path), exist_ok=True)

                # Open and save the file with the appropriate encoding
                with open(file_path, 'wb') as f:
                    f.write(file.read())
                log.info('File uploaded successfully')
                return jsonify({'message': 'File uploaded successfully' })
            except Exception as e:
                log.error(str(e))
                return jsonify({'error': str(e)})
        else:
            log.error('Invalid file type')
            return jsonify({'error': 'Invalid file type'})


    def is_text_file(self, file):
        text_file_extensions = ['.txt', '.csv']  # Add more extensions as needed
        filename, file_extension = os.path.splitext(file.filename)
        return file_extension.lower() in text_file_extensions

    def allowed_file(self, filename):
        allowed_extensions = set(self.allowed_extensions)
        return '.' in filename and \
               filename.rsplit('.', 1)[1].lower() in allowed_extensions
