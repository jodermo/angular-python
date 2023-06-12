# Python and Angular Experimentation Project

This project provides a basic setup for experimenting with Python backend and Angular frontend. It includes a Python server for backend development and an Angular app for frontend development.

## Prerequisites

To run this project, make sure you have the following prerequisites installed on your system:

- Docker: [Install Docker](https://www.docker.com/get-started)

## Project Structure

The project structure is as follows:

- project/
  - docker-compose.yml
  - python-server/
    - Dockerfile
    - server.py
    - requirements.txt
  - angular-app/
    - Dockerfile
    - nginx.conf
    - package.json
    - ... other Angular project files


## Usage

To run the project, follow these steps:

1. Clone this repository:

    ```bash
   git clone https://github.com/your-username/your-repo.git
    ```

2. Change into the project directory:
    ```bash
   cd project/
    ```

3. Change into the project directory:
    ```bash
    docker-compose up
    ```
    This command will build and start the Python server and Angular app containers defined in the docker-compose.yml file.

Access the application:

    The Python server API can be accessed at: http://localhost:8000/api/data
    The Angular app can be accessed at: http://localhost:4200

Experiment and develop:

    Modify the Python server code in the python-server/ directory as per your experimentation requirements.
    Modify the Angular app code in the angular-app/ directory for frontend experimentation.


## License

This project is licensed under the [MIT License](LICENSE).

Author

    Moritz Petzka

Acknowledgments

Special thanks to the open-source community for their contributions.
