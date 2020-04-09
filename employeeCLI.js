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

//Connect to MySQL and execute first inquirer function
connection.insertEmployee(alan)
    .then(() => {
        console.log("lol");
        return "horse";
    })
    .then((thang) => {
        console.log(thang);
        return "horse2";
    })
    .then(otherThang => {
        console.log(otherThang);
    })
    .catch(err => {
        if (err) throw err;
    });
connection.close();
console.log("shush");