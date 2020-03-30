// Node Package Constants
const mysql = require("mysql");
const inquirer = require("inquirer");
const consoleTable = require("console.table");

// MySQL Connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeDB"
});

connection.connect(err => {
    if (err) throw err;
    startQuestions();
});

function startQuestions() {
    inquirer
        .prompt({
            name: "tableSelect",
            type: "list",
            message: "Create new:",
            choices: ["Department", "Role", "Employee"]
        })
        .then(({ tableSelect }) => {
            console.log(tableSelect);
            switch (tableSelect) {
                case "Department": inqDepartment(); break;
                case "Role": inqRole(); break;
                case "Employee": inqEmployee(); break;
            }
        });
}

function inqDepartment() {
    inquirer
        .prompt({
            name: "depName",
            type: "input",
            message: "Enter name of department."
        })
        .then(({ depName }) => {
            let query =
                `INSERT INTO department (name)
                    VALUES ("${depName}");`
            connection.query(query, (err, res) => {
                if (err) throw err;
            });
        });
}

function inqRole() {

}

function inqEmployee() {

}