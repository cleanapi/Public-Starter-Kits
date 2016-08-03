# Starter Kit Express and Angular

## Installation

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

## Create database

To create database run
`gulp database:create`

## Model Migration
To migrate the models run

`knex migrate:latest`

To add additional models run

`knex migrate:make <model>`

