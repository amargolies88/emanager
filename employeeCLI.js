// Node Package Constants
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// MySQL Connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeDB"
});

//Connect to MySQL and execute first inquirer function
connection.connect(err => {
    if (err) throw err;
    inqCreateOrView();
});

function inqCreateOrView(option) {
    let choices = ["Create", "View", "Exit"];
    if (option) choices = ["Back", "Create", "View", "Exit"];
    inquirer
        .prompt({
            name: "createNew",
            type: "list",
            message: "What would you like to do?",
            choices: choices
        })
        .then(({ createNew }) => {
            if (createNew === "Create") { inqCreateSelect() }
            else if (createNew === "View") { inqViewSelect() }
            else if (createNew === "Exit") { closeEmanager() }
            else if (createNew === "Back") { inqView(option) }
        });
}

function inqCreateSelect(again) {
    inquirer
        .prompt({
            name: "tableSelect",
            type: "list",
            message: "Create new... (choose one)",
            choices: ["Back", "Department", "Role", "Employee", "Exit"]
        })
        .then(({ tableSelect }) => {
            connection.query("SELECT * FROM role", (err, res) => {
                if (err) throw err;
                let roles = res;
                connection.query("SELECT * FROM employee", (err, res) => {
                    let employees = res;
                    switch (tableSelect) {
                        case "Department": inqCreateDepartment(); break;
                        case "Role":
                            if (roles.length !== 0) {
                                inqCreateRole();
                            } else {
                                createDepartmentForRole("You must create a department before creating roles. Would you like to create a department?");
                            }
                            break;
                        case "Employee":
                            if (employees.length !== 0) {
                                inqCreateEmployee();
                            } else {
                                
                            }
                            break;
                        case "Back": inqCreateOrView(); break;
                        case "Exit": closeEmanager();
                    }
                });
            })
        });
}

function createDepartmentForRole(message) {
    inquirer
        .prompt({
            name: "createDepartmentQuestion",
            type: "confirm",
            message: message
        })
        .then(({ createDepartmentQuestion }) => {
            (createDepartmentQuestion) ? inqCreateDepartment(1) : inqCreateOrView();
        });
}

function inqViewSelect() {
    inquirer
        .prompt({
            name: "viewSelect",
            type: "list",
            message: "What would you like to view?",
            choices: ["Back", "Departments", "Roles", "Employees", "Exit"],
            filter: value => value.toLowerCase().slice(0, -1) // Drop last letter and make lowercase. ie: Roles becomes role
        })
        .then(({ viewSelect }) => {
            if (viewSelect === "bac") inqCreateOrView();
            else if (viewSelect === "exi") closeEmanager();
            else inqView(viewSelect);
        });
}

function inqView(option) {
    inquirer
        .prompt({
            name: "viewSelect",
            type: "list",
            message: "What would you like to do?",
            choices: ["Back", `View all ${option}s`, `Select ${option} to view`, `Search specific ${option}s to view`, "Exit"],
            filter: value => value.slice(0, 3)
        })
        .then(({ viewSelect }) => {
            switch (viewSelect) {
                case "Bac": inqViewSelect(); break;
                case "Vie": viewAll(option); break;
                case "Sel": viewList(option); break;
                case "Sea": viewSearch(option); break;
                case "Exi": closeEmanager();
            }
        });
}

function getAllFrom(table, _callback) {
    let query = `SELECT * FROM ${table}`;
    connection.query(query, (err, res) => {
        if (err) throw err;

    })
}

function viewAll(option) {
    let query = `SELECT * FROM ${option}`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        inqCreateOrView(option);
    });
}

function viewList(option) {
    let optionList = [];
    let query = `SELECT * FROM ${option}`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        inquirer
            .prompt({
                name: "listSelect",
                type: "list",
                message: `Select ${option} to view`,
                choices: res
            })
            .then(({ listSelect }) => {
                let query9000 = `SELECT * FROM department WHERE name = "${listSelect}"`;
                connection.query(query9000, (err, res) => {
                    if (err) throw err;
                    console.table(res);
                    inqCreateOrView();
                })

            });
    });
}


function inqCreateDepartment(cameFrom = 0) {
    let departmentNames = [];
    let departmentQuery = `SELECT * FROM department`;
    connection.query(departmentQuery, (err, res) => {
        if (err) throw err;
        res.forEach(row => {
            departmentNames.push(row.name);
        });
        inquirer
            .prompt({
                name: "depName",
                type: "input",
                message: "Enter name of department",
                validate: value => {
                    if (value === "") return "Department input must not be empty";
                    for (let i = 0; i < departmentNames.length; i++) {
                        if (value === departmentNames[i]) return "Department already exists";
                    }
                    return true;
                }
            })
            .then(({ depName }) => {
                let query =
                    `INSERT INTO department (name)
                    VALUES ("${depName}");`
                connection.query(query, (err, res) => {
                    if (err) throw err;
                    if (cameFrom === 0) inqCreateOrView();
                    else if (cameFrom === 1) inqCreateRole(1, depName);
                    else inqCreateRole(cameFrom, depName);
                });
            });
    });
}

function inqCreateRole(alreadyRole = 0, alreadyDepartment) {
    let roleNames = [];
    let departmentNames = ["Create new department"];
    let roleDepartment;
    let roleQuery = `SELECT * FROM role`;
    let departmentQuery = `SELECT * FROM department`;
    let questions = [];
    connection.query(roleQuery, (err, res) => {
        if (err) throw err;
        res.forEach(row => {
            roleNames.push(row.name);
        });
        connection.query(departmentQuery, (err, res) => {
            if (err) throw err;
            res.forEach(row => {
                departmentNames.push(row.name);
            });
            questions = [
                {
                    name: "roleName",
                    type: "input",
                    message: "Enter role name",
                    validate: value => {
                        if (value === "") return "Role must not be empty";
                        for (let i = 0; i < roleNames.length; i++) {
                            if (value === roleNames[i]) return "Role already exists";
                        }
                        return true;
                    }
                },
                {
                    name: "answerSalary",
                    type: "input",
                    message: "Enter role salary (Do not use symbols, enter numbers only)",
                    validate: value => {
                        return (value == parseFloat(value)) ? true : "Enter numbers only.";
                    }
                },
                {
                    name: "answerDepartment",
                    type: "list",
                    message: "Select department for this role",
                    choices: departmentNames
                }
            ]
            if (alreadyRole !== 0) {
                if (alreadyRole !== 1) questions.shift();
                questions.pop();
            }
            inquirer
                .prompt(questions)
                .then((role) => {
                    if (alreadyRole !== 0) {
                        role.roleName = alreadyRole;
                        role.answerDepartment = alreadyDepartment;
                    }
                    if (role.answerDepartment === "Create new department") {
                        inqCreateDepartment(role.roleName);
                    } else {
                        let idQuery = `SELECT * FROM department WHERE name = "${role.answerDepartment}"`;
                        connection.query(idQuery, (err, res) => {
                            if (err) throw err;
                            let departmentID = res[0].id;
                            let query =
                                `INSERT INTO role (name, salary, department_id)
                            VALUES ("${role.roleName}", ${parseFloat(role.answerSalary)}, "${departmentID}");`;
                            connection.query(query, (err, res) => {
                                if (err) throw err;
                                inqCreateOrView();
                            });
                        });

                    }
                });
        });
    });
}

function inqCreateEmployee() {
    let roleQuery = `SELECT * FROM role`;
    let employeeQuery = `SELECT * FROM employee`;
    let roles = [];
    let employees = [];
    let employeeIds = [];
    connection.query(roleQuery, (err, res) => {
        if (err) throw err;
        res.forEach(e => {
            roles.push({
                name: e.name,
                value: e.id
            });
        });
        connection.query(employeeQuery, (err, res) => {
            res.forEach(e => {
                employees.push({
                    name: `${e.first_name} ${e.last_name} ID: ${e.id}`,
                    value: e.id
                });
            });
            employees.unshift("No Manager");
            let choices = [
                {
                    name: "employeeFirstName",
                    type: "input",
                    message: "Enter employee's FIRST name",
                    validate: value => {
                        if (value === "") return "Name must not be empty";
                        else return (/^[a-zA-Z]*$/.test(value)) ? true : "Input alphabet characters only"
                    }
                },
                {
                    name: "employeeLastName",
                    type: "input",
                    message: "Enter employee's LAST name",
                    validate: value => {
                        if (value === "") return "Name must not be empty";
                        else return (/^[a-zA-Z]*$/.test(value)) ? true : "Input alphabet characters only"
                    }
                }
            ]
            if (roles.length !== 0) {
                choices.push({
                    name: "employeeRole",
                    type: "list",
                    message: "Select employee's role",
                    choices: roles
                });
            } else {
                choices.push({
                    name: "employeeRole",
                    type: "input",
                    message: "Enter employee role",
                    validate: value => (value === "") ? "Name must not be empty" : true
                });
            }
            if (employees.length !== 0) {
                choices.push({
                    name: "employeeManager",
                    type: "list",
                    message: "Select manager of employee if applicable",
                    choices: employees
                });
            }
            inquirer
                .prompt(choices)
                .then(answers => {
                    let query = `INSERT INTO employee (first_name, last_name${(answers.employeeRole) ? ", role_id" : ""}${(answers.employeeManager === "No Manager") ? "" : ", manager_id"}) 
                        VALUES ("${answers.employeeFirstName}", "${answers.employeeLastName}"${(answers.employeeRole) ? `, "${answers.employeeRole}"` : ""}${(answers.employeeManager !== "No Manager") ? `, ${answers.employeeManager}` : ""});`;
                    console.log(query);
                    connection.query(query, (err, res) => {
                        if (err) throw err;
                        else console.log("Employee Created"); inqCreateOrView();
                    });
                });
        });
    });
}

function closeEmanager() {
    console.log("Thank you for using Emanager. Bye!");
    process.exit();
}

function viewSpecific(id, table) {
    query = `SELECT * FROM ${table} WHERE id = ${id}`;

    let somethang = connection.query(query, (err, res) => {
        if (err) throw err;
        return res;
    })
    return somethang;
}