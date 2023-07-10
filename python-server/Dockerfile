# Use an official Python runtime as the base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Install the required system packages
RUN apt-get update && apt-get install -y libasound2-dev ffmpeg mplayer espeak espeak-ng libespeak-dev libportaudio2 libportaudiocpp0 portaudio19-dev libsndfile1-dev libvpx-dev


# Install the Python dependencies

RUN pip install pyaudio
RUN pip install python-espeak
RUN pip install PyJWT

COPY ./python-server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install npm and mpg123
RUN apt-get install -y npm mpg123

# Install nodemon using npm
RUN npm install -g nodemon

# Copy the entire project to the container
COPY ./python-server .

# Expose a port (e.g., 80) for the server to listen on
EXPOSE 443

# Define the command to run when the container starts
CMD [ "nodemon", "--watch", ".", "--ext", "py", "--exec", "python", "server.py" ]
