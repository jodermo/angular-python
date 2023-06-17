# Python and Angular Experimentation Project

This project provides a flexible environment for experimenting with Python backend development and Angular frontend development. It includes a Python server for backend functionality and an Angular app for frontend user interfaces. This project is ideal for developers who want to explore and test different features, APIs, and interactions between the Python backend and Angular frontend.

- Python Server
- Angular Frontend
- PostgreSQL Database
- SocketIO Websocket

#### With some basic functionality
- Dynamic API with GET, POST, PUT, DELETE functions
- File Upload
- File Server
- Websocket Chat
- Text to speech functions



## Prerequisites

To run this project, ensure that you have Docker installed on your system. Docker provides a containerized environment for easy setup and deployment. You can download and install Docker from the official website ([https://www.docker.com/get-started/](https://www.docker.com/get-started)).

## Project Structure

The project structure is as follows:

- angular-python/
  - .env
  - [docker-compose.yml](./docker-compose.yml) `Docker Composition`
  - [resources/](./resources) `Private app data`
    - [dist/](./resources/dist/) `Angular build`
    - [postgres-data/](./resources/postgres-data/) `Database data`
    - [uploads/](./resources/uploads/) `Uploaded files`
  - [python-server/](./python-server) `Python server files`
    - [Dockerfile](./python-server/Dockerfile) `Docker configuration`
    - [server.py](./python-server/server.py) `Main server / routing`
    - [server.log](./python-server/server.log) `Log file`
    - [index.html](./python-server/index.html) `Index file for server base route`
    - [modules/](./python-server/modules/) 
      - [file_server.py](python-server/modules/file_server.py)  `File server`
      - [file_upload.py](./python-server/modules/file_upload.py) `File upload`
      - [postgres_api.py](./python-server/modules/postgres_api.py) `Database API`
      - [websocket.py](./python-server/modules/websocket.py) `Websocket`
      - [text_to_speech.py](./python-server/modules/text_to_speech.py) `Text to speech`
      - [server_logging.py](./python-server/modules/server_logging.py) `Server logging`
  - [angular-app/](./angular-app/)  `Angular frontend app`
    - [Dockerfile](./angular-app/Dockerfile) `Docker configuration for build mode (localhost:80)`
    - [Dockerfile_serve](./angular-app/Dockerfile_serve)  `Docker configuration for serve mode (localhost:4200)`
    - [nginx.conf](./angular-app/nginx.conf) `NGINX configuration for build`
    - [package.json](./angular-app/package.json) `Node.js configuration`
    - [src](./angular-app/src/) 
      - [app](./angular-app/src/app) `Source files for frontend app`
        - [app.component.ts](./angular-app/src/app/app.component.ts) `Main app component`
        - [app-routing.module.ts](./angular-app/src/app/app-routing.module.ts) `Router configuration (frontend URLs)`
        - [file-manager/](./angular-app/src/app/file-manager/) `File manager for uploading and managing files`
        - [api-manager/](./angular-app/src/app/api-manager/) `API manager for custom API integration`
        - [welcome-page/](./angular-app/src/app/welcome-page/) `Welcome page with Angular starter content and router navigation`
        - [example-project/](./angular-app/src/app/example-project/) `Example project with documentation`


## Environment file [.env](./.env)

```
MODE=dev
SERVER_HOST=0.0.0.0
SERVER_PORT=8000
ALLOWED_ORIGINS=*

DB_HOST=postgres-database
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=postgres
POSTGRES_PASSWORD=postgres

FILE_UPLOAD_ROOT='app/'
FILE_UPLOAD_DIRECTORY='uploads/'
TEXT_TO_SPEECH_DIRECTORY='tts-files/'
ALLOWED_EXTENSIONS=txt,pdf,png,jpg,jpeg,gif
MAX_CONTENT_LENGTH=10737418240

PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
FLASK_DEBUG=1
FLASK_ENV=development


```

## Usage

To run the project, follow these steps:

1. Clone this repository:

    ```bash
   git clone https://github.com/jodermo/angular-python
    ```

2. Change into the project directory:
    ```bash
   cd angular-python/
    ```

3. Run Docker Images:
    ```bash
    docker-compose up
    ```
    This command will ***build*** and start the Python server and Angular app containers defined in the docker-compose.yml file.

4. App is running at:
    - python server: [localhost:8000](http://localhost:8000) *(restarts on file changes)*
    - Angular build : [localhost:80](http://localhost:80) *(run: `docker-compose up --build` to rebuild)*
    - Angular serve : [localhost:4200](http://localhost:4200) *(for deployment, is watching file changes)*
      

Experiment and develop:

- Modify the Python server code in the python-server/ directory as per your experimentation requirements.
- Modify the Angular app code in the angular-app/ directory for frontend experimentation.

## Documentations
- [Angular Deploayment](./documentation/angular-deployment.md)
- [app.service.ts (basic API functions)](./documentation/app.service.ts.md)

### [example-project](./documentation/example-project.md)

This is an example project template that demonstrates data management functionality. It consists of a form and a table. The form allows you to enter a table name and a value. You can load data, add new values to the table, and update or delete existing values. The table displays the data retrieved from the server. Each row represents a record with an ID and a corresponding value. You can edit the values in the table and perform update and delete operations on each record. The template provides a user-friendly interface for managing data efficiently.

## License

This project is licensed under the [MIT License](LICENSE).

Author
- Moritz Petzka - [https://petzka.com](https://petzka.com)
