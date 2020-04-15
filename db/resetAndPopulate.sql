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

USE employeeDB;

INSERT INTO department (name)
	VALUES 	("Marketing"),
			("Operations"),
			("Finance");
    
INSERT INTO role (name, salary, department_id)
	VALUES 	("Content Creator", 64000, 1),
			("Marketing Data Analyst", 92000, 1),
			("Operations Coordinator", 86000, 2),
            ("Operations Analyst", 98000, 2),
            ("Payroll Specialist", 60000, 3),
			("Credit Analyst", 58000, 3);
                
INSERT INTO employee (first_name, last_name, role_id, manager_id)
	VALUES 	("Bruno", "Callahan", 1, 0),
			("Annabel", "Barr", 1, 1),
            ("Bo", "Macgregor", 2, 1),
            ("Gavin", "Armitage", 2, 1),
			("Kaiser", "Warren", 3, 1),
            ("Danniella", "Person", 3, 5),
            ("Arianne", "Roberson", 4, 5),
            ("Blanka", "Ball", 4, 5),
			("Earl", "Rossi", 5, 1),
            ("Uzair", "Perez", 5, 9),
            ("Hayleigh", "Mcnamara", 5, 9),
            ("Sanah", "Macdonald", 5, 9);