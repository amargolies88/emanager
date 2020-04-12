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
                case "Exit": exit(); break;
            }
        })
        .catch(err => { if (err) throw err });
}

function createMenu() {
    connection.tableHasData()
        .then(({ departments, roles, employees }) => {
            return inquirer
                .prompt({
                    name: "createAnswer",
                    type: "list",
                    message: "Create...",
                    choices: [
                        { name: "Department" },
                        { name: "Role", disabled: (departments) ? false : "Disabled, create department first." },
                        { name: "Employee", disabled: (roles) ? false : "Disabled, create role first." },
                        { name: "Back" },
                        { name: "Exit" }
                    ]
                })
                .then(({ createAnswer }) => {
                    switch (createAnswer) {
                        case "Department": askDepartment(); break;
                        case "Role": createRole(); break;
                        case "Employee": createEmployee(); break;
                        case "Back": homeMenu(); break;
                        case "Exit": exit(); break;
                        default: exit();
                    }
                })
        })
        .catch(err => { if (err) throw err });
}

function askDepartment() {
    connection.getCol("name", "department")
        .then(depts => depts.map(obj => obj.name))
        .then(depts => {
            console.log(depts);
            return inquirer
                .prompt({
                    name: "answerDepartment",
                    type: "input",
                    message: "Enter department name...",
                    validate: (answer) => (depts.includes(answer)) ? "Department name already exists. Choose a different name." : true
                })
        })
        .then(({ answerDepartment }) => connection.insertDepartment(answerDepartment))
        .then(() => homeMenu())
        .catch(err => { if (err) throw err });

}

function exit() {
    console.log("Thank you for using eManager. Bye!");
    connection.close();
}