# file: modules/webcam.py

import os
import cv2
import numpy as np
from flask_socketio import SocketIO, join_room, leave_room, emit
from flask import request, jsonify, send_file
from datetime import datetime
from modules.server_logging import server_logging
from modules.postgres_api import postgres_api

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("webcam.log", mode)

class webcam:
    def __init__(self):
        self.uploadRoot = os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'

    def store_image_mp4(self, image, file_path='video-streams', file_name='record.mp4', fps=30):
        if image is None:
            log.error('No image file received')
            return None

        video_file = os.path.join(self.uploadRoot, self.uploadDirectory, file_path, file_name)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")  # Generate timestamp
        image_name = f"{timestamp}_{int(fps)}.jpg"  # Append timestamp to image name
        image_path = os.path.join(self.uploadRoot, self.uploadDirectory, file_path, file_name + '_images', image_name)
        image_path = image_path.replace('.mp4', '')
        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(video_file), exist_ok=True)
        os.makedirs(os.path.dirname(image_path), exist_ok=True)

        with open(image_path, 'wb') as f:
            f.write(image.read())

        # Delete the existing video file
        if os.path.isfile(video_file):
            os.remove(video_file)

        image_directory = os.path.dirname(image_path)

        # Recreate the video file and add the frames again
        try:
            frame_files = sorted(os.listdir(image_directory))
            if not frame_files:
                return None

            first_frame = cv2.imread(os.path.join(image_directory, frame_files[0]))
            if first_frame is None:
                raise Exception("Failed to read the first frame")

            frame_height, frame_width, _ = first_frame.shape

            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            output_video = cv2.VideoWriter(video_file, fourcc, fps, (frame_width, frame_height))
            for frame_file in frame_files:
                frame = cv2.imread(os.path.join(image_directory, frame_file))
                if frame is None:
                    raise Exception(f"Failed to read frame file: {frame_file}")
                output_video.write(frame)

            output_video.release()
            return video_file

        except Exception as e:
            print('Error regenerating video file:', str(e))
            return None

    def store_image_webm(self, image, file_path='video-streams', file_name='record.webm', fps=30):
        if image is None:
            log.error('No image file received')
            return None

        video_file = os.path.join(self.uploadRoot, self.uploadDirectory, file_path, file_name)
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")  # Generate timestamp
        image_name = f"{timestamp}_{int(fps)}.jpg"  # Append timestamp to image name
        image_path = os.path.join(self.uploadRoot, self.uploadDirectory, file_path, file_name + '_images', image_name)
        image_path = image_path.replace('.webm', '')


        # Create the directory if it doesn't exist
        os.makedirs(os.path.dirname(video_file), exist_ok=True)
        os.makedirs(os.path.dirname(image_path), exist_ok=True)


        with open(image_path, 'wb') as f:
            f.write(image.read())

        # Delete the existing video file
        if os.path.isfile(video_file):
            os.remove(video_file)

        image_directory = os.path.dirname(image_path)
        # Recreate the video file and add the frames again
        try:
            frame_files = sorted(os.listdir(image_directory))
            if not frame_files:
                return None

            first_frame = cv2.imread(os.path.join(image_directory, frame_files[0]))
            if first_frame is None:
                raise Exception("Failed to read the first frame")

            frame_height, frame_width, _ = first_frame.shape
            fourcc = cv2.VideoWriter_fourcc(*'VP90')  # Use VP8 codec for WebM
            output_video = cv2.VideoWriter(video_file, fourcc, fps, (frame_width, frame_height))
            for frame_file in frame_files:
                frame = cv2.imread(os.path.join(image_directory, frame_file))
                if frame is None:
                    raise Exception(f"Failed to read frame file: {frame_file}")
                output_video.write(frame)

            output_video.release()
            return video_file

        except Exception as e:
            print('Error regenerating video file:', str(e))
            return None

    def send_image_request(self, request):
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        try:
            image = request.files['file']
            fps = request.form.get('fps', 30)
            file_path = request.form.get('path', 'video-streams')
            file_name = request.form.get('filename', 'webcam_webm')
            video_file = self.store_image_webm(image, file_path, file_name, float(fps))
            if video_file is None:
                return jsonify({'error': 'Failed to store image'}), 500

            return jsonify({'message': 'Image sent successfully', 'filename': file_name, 'path': file_path, 'video_file': video_file, 'fps': fps}), 200

        except Exception as e:
            log.error('Error sending image request: ' + str(e))
            return jsonify({'error': 'An error occurred while processing the image request'}), 500


    def get_video_request(self, request):
        file_path = request.args.get('path', 'video-streams')
        file_name = request.args.get('filename', 'webcam_webm')
        video_file = os.path.join(self.uploadRoot, self.uploadDirectory, file_path, file_name)

        if not os.path.isfile(video_file):
            return jsonify({'error': 'Video file not found', 'filename': file_name, 'path': file_path}), 404

        # If the video file exists, you can proceed with returning the file or any other required processing

        return send_file(video_file, mimetype='video/webm')

        try:
            return send_file(video_file, as_attachment=True, mimetype='video/webm', conditional=True)

        except Exception as e:
            log.error('Error sending video file: ' + str(e))
            return jsonify({'error': 'An error occurred while sending the video file'}), 500

