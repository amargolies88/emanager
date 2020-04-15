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
	VALUES 	("Awesome Department"),
			("Horse Department"),
			("Sween Department");
    
INSERT INTO role (name, salary, department_id)
	VALUES 	("Best Role", 20000, 1),
			("Almost Best Role", 19999, 1),
			("Horse Tamer", 10000, 2),
            ("Pony Tamer", 500, 2),
            ("Festering Festerer", 99, 3),
			("Sween Lord", 100, 3);
                
INSERT INTO employee (first_name, last_name, role_id, manager_id)
	VALUES 	("Alan", "Margolies", 1, 0),
			("Alijandro", "Margulez", 1, 1),
            ("Alex", "Marxolies", 2, 1),
            ("Arnold", "Marstrongarm", 2, 1),
			("Horselord1", "McHorse1", 3, 1),
            ("Horselord2", "McHorse2", 3, 5),
            ("Horselord3", "McHorse3", 4, 5),
            ("Horselord4", "McHorse4", 4, 5),
			("Swone1", "McSwone1", 5, 1),
            ("Swone2", "McSwone2", 5, 9),
            ("Swone3", "McSwone3", 5, 9),
            ("Swone4", "McSwone4", 5, 9);