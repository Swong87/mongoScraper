### Schema

CREATE DATABASE burgers_db;
USE burgers_db;

CREATE TABLE burgers (
	id int AUTO_INCREMENT NOT NULL ,
	burger_name varchar(255),
	devoured BOOLEAN DEFAULT false,
    date TIMESTAMP NOT NULL,
	PRIMARY KEY (id)
);
