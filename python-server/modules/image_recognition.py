# file: modules/face_recognition.py

from flask import jsonify, send_file, Flask, request
import os
import json
import face_recognition
from datetime import datetime
import base64
import numpy as np
import cv2
from imageai.Detection import ObjectDetection

from modules.server_logging import server_logging
from modules.postgres_api import postgres_api
from modules.file_server import file_server

mode = os.getenv("MODE")
mode = mode if mode else 'dev'
log = server_logging("face_recognition.log", mode)



class image_recognition:
    def __init__(self):
        self.detectItems = False
        self.postgres_api = postgres_api()
        self.file_server = file_server()
        self.detector = ObjectDetection()
        self.uploadRoot = 'app/' + os.getenv("FILE_UPLOAD_ROOT") if os.getenv("FILE_UPLOAD_ROOT") else 'www/'
        self.uploadDirectory = os.getenv("FILE_UPLOAD_DIRECTORY") if os.getenv("FILE_UPLOAD_DIRECTORY") else 'uploads/'
        self.recognitionAnnotationsDirectory = os.getenv("RECOGNITION_ANNOTATIONS_DIRECTORY") if os.getenv("RECOGNITION_ANNOTATIONS_DIRECTORY") else 'recognition-annotations/'

    def add_model_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('image-recognition-model', result)

    def add_response_to_database(self, result):
        return self.postgres_api.add_or_update_api_entry('face-recognition', result)

    def create_directory(self, directory_path):
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

    def load_image_file(self, file_path):
        image = face_recognition.load_image_file(file_path)
        face_landmarks_list = face_recognition.face_landmarks(image)


    def create_model_request(self, request):
        request_data = request.json
        file_data = request_data.get('file')
        filename = file_data.get('filename')
        model_name = request_data.get('name', 'test-model')
        directory_path = request_data.get('path', 'recognition-model')
        model = request_data.get('model')

        xmin = int(request_data.get('xmin', 0))
        ymin = int(request_data.get('ymin', 0))
        xmax = int(request_data.get('xmax', 0))
        ymax = int(request_data.get('ymax', 0))

        file_path = '/' + self.uploadRoot + self.recognitionAnnotationsDirectory + directory_path + '/' + filename

        model_path = self.create_model(file_path, self.uploadRoot + self.recognitionAnnotationsDirectory  + directory_path, model_name, xmin, ymin, xmax, ymax)

        model = model or {
            'image': file_path,
            'path': directory_path,
            'model': model_path,
            'configuration': {
                'image_width': 200,
                'image_height': 200,
                'annotations': []
            }
        }

        annotation = {
            'name': model_name,
            'xmin': xmin,
            'ymin': ymin,
            'xmax': xmax,
            'ymax': ymax,
        }

        model['configuration']['annotations'].append(annotation)

        db_entry = self.add_model_to_database(model)

        return jsonify(db_entry)

    def create_annotations(self, image, xmin, ymin, xmax, ymax, name):
        # Perform annotation logic and return annotations as a dictionary
        # Modify this method according to your specific annotation requirements
        annotations = {
            "image_width": image.shape[1],
            "image_height": image.shape[0],
            "annotations": [
                {
                    'name' : name,
                    'xmin' : xmin,
                    'ymin' : ymin,
                    'xmax' : xmax,
                    'ymax' : ymax
                }
            ]
        }
        return annotations

    def create_model(self, file_path, directory_path, model_name, xmin, ymin, xmax, ymax):
        # Load the image
        image = face_recognition.load_image_file(file_path)

        # Set the model path
        model_path = os.path.join(directory_path, "model.h5")

        # Create annotations
        annotations = self.create_annotations(image, xmin, ymin, xmax, ymax, model_name)

        # Create the directory if it doesn't exist
        if not os.path.exists(directory_path):
            os.makedirs(directory_path)

        # Save annotations to JSON file
        annotations_path = os.path.join(directory_path, "annotations.json")
        with open(annotations_path, 'w') as f:
            json.dump(annotations, f)

        # Train the model
        self.detector.trainModel(
            train_images=file_path,
            train_annotations=annotations_path,
            compute_val_loss=True,
            validation_images=model_path,
            validation_annotations=annotations_path,
        )

        # Save the trained model
        self.detector.saveModel(model_path)

        # Return the path to the saved model
        return model_path



    def get_model(self, directory_path):
        model_path = os.path.join(directory_path, "model.h5")
        self.detector.setModelTypeAsYOLOv3()  # Set the object detection model type
        self.detector.setModelPath(model_path)  # Set the path to the model file
        return self.detector.loadModel()  # Load the object detection model
        # get_model "directory_path/model.h5"

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

    def recognise_from_webcam_stream(self, request):
        image_data = request.json.get('image', None)
        if image_data:
            # Convert the base64 image data to a NumPy array
            nparr = np.fromstring(base64.b64decode(image_data), np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

            # Convert the image from BGR color (which OpenCV uses) to RGB color (which face_recognition uses)
            rgb_frame = frame[:, :, ::-1]

            # Find all the faces in the current frame of video
            face_locations = face_recognition.face_locations(rgb_frame)

            # Prepare the face recognition results
            results = []
            for top, right, bottom, left in face_locations:
                # Draw a box around the face
                cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)

                # Append the face location to the results
                results.append({'top': top, 'right': right, 'bottom': bottom, 'left': left, 'width': right - left, 'height': bottom - top})

            if self.detectItems:
                # Perform object detection on the frame
                detections = self.detector.detectObjectsFromImage(input_image=rgb_frame, input_type="array")

                # Process object detection results and update the frame
                for detection in detections:
                    object_name = detection["name"]
                    percentage_probability = detection["percentage_probability"]
                    box_points = detection["box_points"]

                    # Draw a box around the detected object on the frame
                    top, right, bottom, left = box_points
                    cv2.rectangle(frame, (left, top), (right, bottom), (0, 0, 255), 2)


                    # Append the object detection information to the results
                    results.append({
                        'object_name': object_name,
                        'percentage_probability': percentage_probability,
                        'box_points': box_points
                    })

            # Return the face recognition and object detection results
            return jsonify(results)

        # If no image data is provided, return an error response
        return jsonify(error='No image data provided')
