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
        .then(answer => {
            switch (answer) {
                case "Create": createMenu(); break;
                case "Edit": editMenu(); break;
                case "Exit": exit(); break;
            }
        })
        .catch(err => { if (err) throw err });
}

function createMenu() {
    connection.tableHasData()
        .then(({ departmentsHasData, rolesHasData, employeesHasData }) => {
            inquirer
                .prompt({
                    name: "menu",
                    type: "list",
                    choices: [{ name: "Create" }, { name: "Edit", disabled: true }]
                })
                .then(answers => { console.log(answers) })
                .catch(err => { if (err) throw err });
        })
        .catch(err => console.log(err));
}

function exit() {
    process.exit();
}