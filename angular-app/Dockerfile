# Base image with Node.js
FROM node:14 AS build

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the entire project
COPY ./ .

# Build the Angular app
RUN npm run build

# Stage 2: Create a minimal Nginx image with compiled Angular app
FROM nginx:alpine

# Copy the compiled Angular app from the previous stage
COPY --from=build /app/dist/angular-app /usr/share/nginx/html

# Copy the nginx configuration file
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 for Nginx
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
