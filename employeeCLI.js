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

function inqCreateOrView() {
    inquirer
        .prompt({
            name: "createNew",
            type: "list",
            message: "What would you like to do?",
            choices: ["Create", "View", "Exit"]
        })
        .then(({ createNew }) => {
            if (createNew === "Create") { inqCreateSelect() }
            else if (createNew === "View") { inqViewSelect() }
            else if (createNew === "Exit") { closeEmanager() }
        });
}

function inqCreateSelect(again) {
    inquirer
        .prompt({
            name: "tableSelect",
            type: "list",
            message: "Create new... (choose one)",
            choices: ["Department", "Role", "Employee"]
        })
        .then(({ tableSelect }) => {
            console.log(tableSelect);
            switch (tableSelect) {
                case "Department": inqCreateDepartment(); break;
                case "Role": inqCreateRole(); break;
                case "Employee": inqCreateEmployee(); break;
            }
        });
}

function inqViewSelect() {
    inquirer
        .prompt({
            name: "viewSelect",
            type: "list",
            message: "What would you like to view?",
            choices: ["Departments", "Roles", "Employees"],
            filter: value => value.toLowerCase().slice(0, -1) // Drop last letter and make lowercase. ie: Roles becomes role
        })
        .then(({ viewSelect }) => {
            inqView(viewSelect);
        });
}

function inqView(option) {
    inquirer
        .prompt({
            name: "viewSelect",
            type: "list",
            message: "What would you like to do?",
            choices: [`View all ${option}s`, `Select ${option} to view`, `Search specific ${option}s to view`],
            filter: value => value.slice(0, 3)
        })
        .then(({ viewSelect }) => {
            switch (viewSelect) {
                case "Vie": viewAll(option); break;
                case "Sel": viewList(option); break;
                case "Sea": viewSearch(option); break;
            }
        });
}

function viewAll(option) {
    let query = `SELECT * FROM ${option}`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        inqCreateOrView();
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


function inqCreateDepartment() {
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
                message: "Enter name of department.",
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
                    inqCreateOrView();
                });
            });
    });
}

function inqCreateRole() {
    let roleNames = [];
    let departmentNames = [];
    let roleDepartment;
    let roleQuery = `SELECT * FROM role`;
    let departmentQuery = `SELECT * FROM department`;
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
            console.log(roleNames);
            console.log(departmentNames);
            inquirer
                .prompt([
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
                ])
                .then((role) => {
                    console.log(role);
                    let idQuery = `SELECT * FROM department WHERE name = "${role.answerDepartment}"`;
                    connection.query(idQuery, (err, res) => {
                        if (err) throw err;
                        console.log(res[0].id);
                        let departmentID = res[0].id;
                        let query =
                            `INSERT INTO role (name, salary, department_id)
                        VALUES ("${role.roleName}", ${parseFloat(role.answerSalary)}, "${departmentID}");`;
                        connection.query(query, (err, res) => {
                            if (err) throw err;
                            inqCreateOrView();
                        });
                    });

                });
        });
    });
}

function inqCreateEmployee() {

}

function closeEmanager() {
    console.log("Thank you for using Emanager. Bye!");
    process.exit();
}

function viewSpecific(id, table) {
    query = `SELECT * FROM ${table} WHERE id = ${id}`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
    })
}