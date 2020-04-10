// Node Package Constants
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Classes
const department = require("./classes/department")
const employee = require("./classes/employee")
const role = require("./classes/role")
const Database = require("./db/querydb");

// MySQL Connection
// const connection = mysql.createConnection({
//     host: "localhost",
//     port: 3306,
//     user: "root",
//     password: "root",
//     database: "employeeDB"
// });

const connection = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeDB"
})

alan = new employee("Alan", "Margolies", 1, 1);
let someThang;


homeMenu();
// console.log("hello");


function test() { console.log("test") }

function homeMenu() {
    inquirer
        .prompt({
            name: "homeAnswer",
            type: "list",
            message: "Welcome to eManager. Choose an option to get started.",
            choices: ["Create", "Edit", "Exit"]
        })
        .then(({ homeAnswer }) => {
            switch (homeAnswer) {
                case "Create": createMenu(); break;
                case "Edit": editMenu(); break;
                case "Exit": console.log("Thank you for using eManager. Bye!"); connection.close(); break;
            }
        })
        .catch(err => { if (err) throw err });
}

function createMenu() {
    connection.tableHasData()
        .then(({ departmentsHasData, rolesHasData, employeesHasData }) => {
            inquirer
                .prompt({
                    name: "createAnswer",
                    type: "list",
                    message: "Create...",
                    choices: [
                        { name: "Department" },
                        { name: "Role", disabled: (departmentsHasData) ? false : "Disabled: Must have created at least one department" },
                        { name: "Employee", disabled: (rolesHasData) ? false : "Disabled: Must have created at least one role" }
                    ]
                })
                .then(({ createAnswer }) => {
                    switch (createAnswer) {
                        case "Department": createDepartment(); break;
                        case "Role": createRole(); break;
                        case "Employee": createEmployee(); break;
                    }
                })
                .catch(err => { if (err) throw err });
        })
        .catch(err => console.log(err));
}

function createDepartment() {
    console.log("Create it baby");
}