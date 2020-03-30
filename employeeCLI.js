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
        .then(answer => {
            switch (answer) {
                case "Department":  inqDepartment();    break;
                case "Role":        inqRole();          break;
                case "Employee":    inqEmployee();      break;
            }
        });
}

function inqDepartment() {
    
}
function inqRole() {

}
function inqEmployee() {

}