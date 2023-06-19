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



# Install the required system packages
RUN apt-get update && apt-get install -y libasound2-dev ffmpeg mplayer

# Copy the requirements file to the container
COPY ./python-server/requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install npm and mpg123
RUN apt-get install -y npm mpg123

RUN pip install openai

# Install nodemon using npm
RUN npm install -g nodemon

# Copy the entire project to the container
COPY ./python-server .



# Expose a port (e.g., 80) for the server to listen on
EXPOSE 443

# Define the command to run when the container starts
CMD [ "nodemon", "--watch", ".", "--ext", "py", "--exec", "python", "server.py" ]
