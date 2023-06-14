# Use an official Python runtime as the base image
FROM python:3.9

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file to the container
COPY requirements.txt .

# Install the Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install npm
RUN apt-get update && apt-get install -y npm

# Install nodemon using npm
RUN npm install -g nodemon

# Copy the entire project to the container
COPY . .

# Expose a port (e.g., 8000) for the server to listen on
EXPOSE 8000

# Define the command to run when the container starts
CMD [ "nodemon", "--watch", ".", "--ext", "py", "--exec", "python", "server.py" ]
