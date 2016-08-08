# Starter Kit Express and Angular

## Docker Installation

Before starting using docker make sure you have installed docker before. https://docs.docker.com/engine/installation/

### Setting up the project

You need to copy *.env.example* file into *.env* file and add the required information you have available for the project.

### Building the image

Clone the project and run the following command:

`docker-compose build`

That will build the actual image. During the building process it will install all the required libraries and setup to run the default gulp task.

*You only need to run this command once when you start developing the project*

PROTIP: If you are short on space it is better use the following command for building the image:

`docker-compose build --force-rm=true`

### Running the image

To run the project you need to run the following command:

`docker-compose up`

This command will do the following actions:
- Install all the required npm libraries
- Install all the required bower libraries
- Run the database migrations if there exist some
- Run the default gulp task

### Accessing terminal of the image

If you need to run commands manually on the image you can open bash terminal that is executing commands on the docker container by running:

`docker-compose exec web bash`

This will open bash terminal where you can execute all the local commands like running additional migrations of installing new npm libraries.

## Local Installation

To install all the required libraries run:
`npm install`

Clone .env.example into .env file and setup the required configuration,
obligatory is the wrap api key and database configuration for Postgresql server.
Postgresql is the recommended one but you can use other sql databases, just need
to install the driver for it.

## Running
To run the application in development mode run:
`gulp`

Open the browser in the localhost:5000

## Model Migration
To migrate the models run

`knex migrate:latest`

To add additional models run

`knex migrate:make <model>`
