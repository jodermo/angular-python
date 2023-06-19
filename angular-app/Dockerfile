# Use the official Node.js LTS (Long Term Support) image as the base image
FROM node:lts

# Install Angular CLI globally
RUN npm install -g @angular/cli

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the working directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the entire project to the working directory
COPY . .

# Expose the default Angular serve port (4200)
EXPOSE 4200

# Start the Angular development server in watch mode
CMD ng serve --host 0.0.0.0 --port 4200 --poll 2000
