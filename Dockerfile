# Base image with Node.js
FROM node:14 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./angular-app/package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the entire project
COPY ./angular-app/ .

# Build the Angular app
RUN npm run build


# Use an official Python runtime as the base image
FROM python:3.9

COPY --from=build /app/dist/angular-app ./angular-app

# Set the working directory in the container
WORKDIR /app

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -

# Install the required system packages
RUN apt-get install -y libasound2-dev ffmpeg mplayer espeak espeak-ng libespeak-dev libportaudio2 libportaudiocpp0 portaudio19-dev libsndfile1-dev libvpx-dev mpg123 nodejs npm

# Install the Python dependencies
RUN pip install --no-cache-dir pyaudio python-espeak PyJWT openai torch torchvision
COPY ./python-server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install nodemon using npm
RUN npm install -g nodemon

# Copy the entire project to the container
COPY ./python-server .


# Install PyInstaller
# RUN pip install pyinstaller

# Expose a port (e.g., 80) for the server to listen on
EXPOSE 443

# Define the command to run when the container starts
CMD [ "nodemon", "--watch", ".", "--ext", "py", "--exec", "python", "server.py" ]
