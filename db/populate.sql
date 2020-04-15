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