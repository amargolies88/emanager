drop database if exists employeeDB;
create database employeeDB;

USE employeeDB;

drop table if exists department;
CREATE TABLE department (
id int NOT NULL AUTO_INCREMENT,
name VARCHAR(30) NOT NULL,
PRIMARY KEY (id)
);

drop table if exists role;
CREATE TABLE role (
id int NOT NULL AUTO_INCREMENT,
name VARCHAR(30) NOT NULL,
salary DECIMAL NOT NULL,
department_id INT NOT NULL,
PRIMARY KEY (id)
);

drop table if exists employee;
CREATE TABLE employee (
id int NOT NULL AUTO_INCREMENT,
first_name VARCHAR(30) NOT NULL,
last_name VARCHAR(30) NOT NULL,
role_id INT NOT NULL,
manager_id INT,
PRIMARY KEY (id)
);