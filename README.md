# Python and Angular Experimentation Project

This project provides a basic setup for experimenting with PostgeSQL database, Python backend and Angular frontend. It includes a Python server for backend development and an Angular app for frontend development.

## Prerequisites

To run this project, make sure you have the following prerequisites installed on your system:

- Docker: [Install Docker](https://www.docker.com/get-started)

## Project Structure

The project structure is as follows:

- angular-python/
  - docker-compose.yml
  - postgres-data/
    - ... database data
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
    - PostgreSQL database: [localhost:5432](http://localhost:5432)
    - python server: [localhost:8000](http://localhost:8000)
    - Angular build: [localhost:80](http://localhost:80)
    - Angular serve: [localhost:4200](http://localhost:4200)
      

Experiment and develop:

    Modify the Python server code in the python-server/ directory as per your experimentation requirements.
    Modify the Angular app code in the angular-app/ directory for frontend experimentation.

## Documentations
- [Angular Deploayment](./documentation/angular-deployment.md)
- [app.service.ts (basic API functions)](./documentation/app.service.ts.md)

### [example-project](./documentation/example-project.md)

This is an example project template that demonstrates data management functionality. It consists of a form and a table. The form allows you to enter a table name and a value. You can load data, add new values to the table, and update or delete existing values. The table displays the data retrieved from the server. Each row represents a record with an ID and a corresponding value. You can edit the values in the table and perform update and delete operations on each record. The template provides a user-friendly interface for managing data efficiently.

## License

This project is licensed under the [MIT License](LICENSE).

Author
- Moritz Petzka - [https://petzka.com](https://petzka.com)

Acknowledgments

Special thanks to the open-source community for their contributions.
