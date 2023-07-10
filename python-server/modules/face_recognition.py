# file: modules/face_recognition.py

from flask import jsonify, send_file, Flask, request
import os
import face_recognition
from datetime import datetime

from modules.server_logging import server_logging
from modules.postgres_api import postgres_api
from modules.file_server import file_server

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("text_to_speech.log", mode)

class face_recognition:
    def __init__(self):
        self.postgres_api = postgres_api()
        self.file_server = file_server()

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('face-recognition', result)

    def create_directory(self, directory_path):
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def load_image_file(self, file_path):
        image = face_recognition.load_image_file(file_path)
        face_landmarks_list = face_recognition.face_landmarks(image)

    def recognise_image_from_directory(self, directory_path, unknown_image_path):
        # Load the unknown image
        unknown_image = face_recognition.load_image_file(unknown_image_path)
        unknown_encoding = face_recognition.face_encodings(unknown_image)[0]

        # Initialize an empty result dictionary
        results = {}

        # Iterate over all files in the directory
        for filename in os.listdir(directory_path):
            # Only process files with certain extensions
            if filename.endswith('.jpg') or filename.endswith('.png'):
                known_image_path = os.path.join(directory_path, filename)
                try:
                    # Load the known image and get its face encoding
                    known_image = face_recognition.load_image_file(known_image_path)
                    known_encoding = face_recognition.face_encodings(known_image)[0]

                    # Compare the known face encoding with the unknown one
                    match = face_recognition.compare_faces([known_encoding], unknown_encoding)[0]
                    # If match, add to results
                    if match:
                        results[filename] = "Match"
                    else:
                        results[filename] = "No match"
                except IndexError:
                    # If no face is found in known_image
                    results[filename] = "No face found in image"

        # Return results
        return results


    def recognise_image_from_image(self, known_image_path, unknown_image_path):
        known_image = face_recognition.load_image_file(known_image_path)
        unknown_image = face_recognition.load_image_file(unknown_image_path)

        biden_encoding = face_recognition.face_encodings(known_image)[0]
        unknown_encoding = face_recognition.face_encodings(unknown_image)[0]

        results = face_recognition.compare_faces([biden_encoding], unknown_encoding)

    def recognise_from_webcam_stream(self, video_capture):
        # Get a reference to webcam #0 (the default one)
        video_capture = cv2.VideoCapture(0)

        while True:
            # Grab a single frame of video
            ret, frame = video_capture.read()

            # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
            rgb_frame = frame[:, :, ::-1]

            # Find all the faces in the current frame of video
            face_locations = face_recognition.face_locations(rgb_frame)

            # Display the results
            for top, right, bottom, left in face_locations:
                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

            # Display the resulting image
            cv2.imshow('Video', frame)

            # Hit 'q' on the keyboard to quit!
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break

        # Release handle to the webcam
        video_capture.release()
        cv2.destroyAllWindows()
