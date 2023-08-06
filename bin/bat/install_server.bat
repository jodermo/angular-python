@echo off
REM Change directory to your project directory
cd /D "%~dp0\..\.."

REM Set up a virtual environment
python -m venv env

REM Activate the virtual environment
call env\Scripts\activate




pip install flask
pip install flask_cors
pip install python-dotenv
pip install cryptography
pip install psycopg2
pip install Flask-SocketIO
pip install gTTS
pip install pyaudio
pip install python-espeak
pip install PyJWT
pip install openai
pip install torch
pip install torchvision
pip install pyttsx3
pip install soundfile
pip install pydub
pip install SpeechRecognition
pip install opencv-python
pip install face-recognition
pip install imageai
pip install boto3
pip install pyinstaller

REM Install the dependencies
pip install -r python-server\requirements.txt


REM Set environment variables
set FLASK_APP=python-server\server.py

pyinstaller --onefile bin/python/start.py

pause
