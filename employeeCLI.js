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


home();
console.log("hello");


function test() { console.log("test") }

function home() {
    connection.tableHasData()
        .then(({ departmentsHasData, rolesHasData, employeesHasData }) => {
            inquirer
                .prompt({
                    
                })
        })
        .catch(err => console.log(err));
}