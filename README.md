# Python and Angular Experimentation Project

This project provides a flexible environment for experimenting with Python backend development and Angular frontend development. It includes a Python server for backend functionality and an Angular app for frontend user interfaces. This project is ideal for developers who want to explore and test different features, APIs, and interactions between the Python backend and Angular frontend.

- Python Server
- Angular Frontend
- PostgreSQL Database
- SocketIO Websocket
- OpenAI integration

#### With some basic functionality and example code for:
- Dynamic API with GET, POST, PUT, DELETE functions
- File Manager
- Websocket Chat
- Text to speech functions
- Speech (voice) recognition
- OpenAI Tool

## Prerequisites

To run this project, ensure that you have Docker installed on your system. Docker provides a containerized environment for easy setup and deployment. You can download and install Docker from the official website ([https://www.docker.com/get-started/](https://www.docker.com/get-started)).

## Project Structure

The project structure is as follows:

- angular-python/
  - .env
  - [docker-compose.yml](./docker-compose.yml) `Docker Composition`
  - [postgres-data/](postgres-data/) `Database data`
  - [python-server/](./python-server) `Python server files`
    - [Dockerfile](./python-server/Dockerfile) `Docker configuration`
    - [requirements.txt](./python-server/requirements.txt) `Python requirements file`
    - [server.py](./python-server/server.py) `Main server / routing`
    - [server.log](./python-server/server.log) `Log file`
    - [modules/](./python-server/modules/) 
      - [file_server.py](python-server/modules/file_server.py)  `File server`
      - [file_upload.py](./python-server/modules/file_upload.py) `File upload`
      - [postgres_api.py](./python-server/modules/postgres_api.py) `Database API`
      - [websocket.py](./python-server/modules/websocket.py) `Websocket`
      - [text_to_speech.py](./python-server/modules/text_to_speech.py) `Text to speech`
      - [server_logging.py](./python-server/modules/server_logging.py) `Server logging`
    - [www/](./python-server/www/)
      - [tts-files/](./python-server/www/tts-files/) *(gets generated if needed)*
        - `... text to speech files`
      - [uploads/](./python-server/www/uploads/) *(gets generated if needed)*
        - `... uploaded files`
    - [ssl/](./python-server/ssl/)
      - [certificate.pem](python-server/ssl/certificate.pem)  `SSL certificate`
      - [private_key.pem](python-server/ssl/private_key.pem)  `SSL private key`
  - [angular-app/](./angular-app/)  `Angular frontend app`
    - [Dockerfile](./angular-app/Dockerfile_build) `Docker configuration for build mode (localhost:80)`
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

```dotenv
MODE=dev
SERVER_HOST=0.0.0.0
SERVER_DOMAIN=localhost
SERVER_PORT=80
ALLOWED_ORIGINS=*

# SSL_ACTIVE=1
SSL_PRIVATE_KEY_PATH=ssl/private_key.pem
SSL_CERTIFICATE_PATH=ssl/certificate.pem

DB_HOST=postgres-database
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_DATABASE=postgres
POSTGRES_PASSWORD=postgres

FILE_UPLOAD_ROOT='www/'
FILE_UPLOAD_DIRECTORY='uploads/'
TEXT_TO_SPEECH_DIRECTORY='tts-files/'
ALLOWED_EXTENSIONS=txt,pdf,png,jpg,jpeg,gif,mp3,wav,wma,mp4,ogg,ogv,webm,csv
MAX_CONTENT_LENGTH=10737418240

PYTHONDONTWRITEBYTECODE=1
PYTHONUNBUFFERED=1
FLASK_DEBUG=1
FLASK_ENV=development

OPENAI_API_KEY=<your OpenAi api key>

# optional: 
# OPENAI_ORGANISATION_ID=<your OpenAi organisation id>


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
   
3. Run first build:
    ```bash
    npm install
    npm run build
    ```
   
4. Run Docker Images:
    ```bash
    docker-compose up
    ```
    This command will ***build*** and start the Python server and Angular app containers defined in the docker-compose.yml file.

5. App is running at [localhost:80](http://localhost:80)

6. Optional - Start Angular serve mode at [localhost:4200](http://localhost:4200):
    ```bash
    npm start
    ```
   This will watch for code changes and automatically recompile the Angular app

7. Optional - Use SSH and PORT 443 instead PORT 80 *(replace "domain-name.com" with your domain)*
   - A. Docker compose file: [docker-compose.yml](./docker-compose.yml)
      - Change `80:80` to `443:443`
   - B. Server environment file: [.env](./.env)
     - Change (uncomment) `# SSL_ACTIVE=1` to `SSL_ACTIVE=1`
     - Change `SERVER_DOMAIN=localhost` to `SERVER_DOMAIN=domain-name.com` 
     - Change `ALLOWED_ORIGINS=*` to `ALLOWED_ORIGINS=https://domain-name.com`
     - Change `SERVER_PORT=80` to `SERVER_PORT=443`
   - C. Angular environment file: [angular-app/src/environments/environment.prod.ts](./angular-app/src/environments/environment.prod.ts)
     - Change `serverURL: 'http://localhost:80/'` to `serverURL: 'https://domain-name.com/'` 
   - D.1 If not exist, the server will now create an SSL certificate to [python-server/ssl/](./python-server/ssl/) [certificate.pem](python-server/ssl/certificate.pem)  and [private_key.pem](python-server/ssl/private_key.pem) on start up
   - D.2 Optional - To use your own key, replace files in:
     - [python-server/ssl/](./python-server/ssl/)
       - [certificate.pem](python-server/ssl/certificate.pem)  `SSL certificate`
       - [private_key.pem](python-server/ssl/private_key.pem)  `SSL private key`

#### Experiment and develop:

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
