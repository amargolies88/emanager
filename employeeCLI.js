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
            choices: ["Create", "View"]
        })
        .then(({ createNew }) => {
            if (createNew === "Create") { inqCreateSelect() }
            else if (createNew === "View") { inqViewSelect() }
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
            choices: ["Departments", "Roles", "Employees"]
        })
        .then(({ viewSelect }) => {
            inqView(viewSelect.toLowerCase().slice(0, -1));
        });
}

function inqView(option) {
    console.log(option);
    inquirer
        .prompt({
            name: "viewSelect",
            type: "list",
            message: "What would you like to do?",
            choices: [`View all ${option}s`, `Select ${option} to view`, `Search specific ${option}s to view`]
        })
        .then(({ viewSelect }) => {
            switch (viewSelect.slice(0, 3)) {
                case "Vie": viewAll(option); break;
                case "Sel": viewList(option); break;
                case "Sea": viewSearch(option); break;
            }
        });
}

function viewAll(option) {
    let query = `SELECT * FROM ${option}`
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        inqCreateOrView();
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
    });
    inquirer
        .prompt({
            name: "depName",
            type: "input",
            message: "Enter name of department.",
            validate: value => (value !== "") ? true : "Department input must not be empty"
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
}

function inqCreateRole() {
    let roleNames = [];
    let roleQuery = `SELECT * FROM role`;
    connection.query(roleQuery, (err, res) => {
        if (err) throw err;
        res.forEach(row => {
            roleNames.push(row.name);
        });
    });
    inquirer
        .prompt([
            {
                name: "roleName",
                type: "input",
                message: "Enter role name",
                validate: value => {
                    for (let i = 0; i < roleNames.length; i++) {
                        if (value === roleNames[i]) return "Role already exists";
                    }
                    return true;
                }
            }
        ])
        .then(() => {

        });
}

function inqCreateEmployee() {

}