// Node Package Constants
const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");

// Classes
const Department = require("./classes/department")
const Employee = require("./classes/employee")
const Role = require("./classes/role")
const Database = require("./db/querydb");

// MySQL Connection 
const connection = new Database({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "root",
    database: "employeeDB"
})

// *** Interface Starts Here ***
homeMenu("Welcome to eManager. Choose an option to get started.");

function homeMenu(message = "Main Menu. Choose an option...") {
    inquirer
        .prompt({
            name: "homeAnswer",
            type: "list",
            message: message,
            choices: ["Create", "View and Edit", "Exit"]
        })
        .then(({ homeAnswer }) => {
            switch (homeAnswer) {
                case "Create": createMenu(); break;
                case "View and Edit": editMenu(); break;
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
                });
        })
        .then(({ createAnswer }) => {
            switch (createAnswer) {
                case "Department": askDepartment(); break;
                case "Role": askRole(); break;
                case "Employee": askEmployee(); break;
                case "Back": homeMenu(); break;
                case "Exit": exit(); break;
                default: exit();
            }
        })
        .catch(err => { if (err) throw err });
}

function askDepartment() {
    connection.getCol("name", "department")
        .then(depts => depts.map(obj => obj.name))
        .then(depts => {
            return inquirer
                .prompt({
                    name: "answerDepartment",
                    type: "input",
                    message: "Enter department name...",
                    validate: (answer) => (depts.includes(answer)) ? "Department name already exists. Choose a different name." : true
                })
        })
        .then(({ answerDepartment }) => connection.insertDepartment(answerDepartment))
        .then(() => {
            console.log("Successfully added department!");
            return homeMenu();
        })
        .catch(err => { if (err) throw err });

}

function askRole() {
    let roleNames = [];
    let depList = [];
    connection.getAll("department")
        .then(departments => {
            depList = departments.map(department => {
                return {
                    name: department.name,
                    value: department.id
                };
            });
            return;
        })
        .then(() => connection.getCol("name", "role"))
        .then(roles => roles.map(obj => obj.name))
        .then(roleNames => {
            return inquirer
                .prompt([
                    {
                        name: "answerRoleName",
                        type: "input",
                        message: "Enter name of role...",
                        validate: (answer) => (roleNames.includes(answer)) ? "Role name already exists." : true
                    },
                    {
                        name: "answerRoleSalary",
                        type: "input",
                        message: "Enter salary for this role...",
                        validate: (answer) => (answer.match(/^[0-9]*$/gm)) ? true : "Enter numbers only."
                    },
                    {
                        name: "answerRoleDepartment",
                        type: "list",
                        message: "Select department for role...",
                        choices: depList
                    }
                ])
        })
        .then(answers => {
            let role = {
                name: answers.answerRoleName,
                salary: answers.answerRoleSalary,
                department_id: answers.answerRoleDepartment
            }
            return connection.insertRole(role);
        })
        .then(() => {
            console.log("Successfully added role.");
            return homeMenu();
        })
        .catch(err => { if (err) throw err });
}

function askEmployee() {
    let employees = [];
    let roles = [];
    connection.getAll("employee")
        .then(res => {
            employees = res.map(employee => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                };
            });
            employees.unshift({ name: "No Manager", value: 0 })
            return;
        })
        .then(() => connection.getAll("role"))
        .then(res => {
            roles = res.map(role => {
                return {
                    name: role.name,
                    value: role.id
                };
            });
            return;
        })
        .then(() => {
            return inquirer
                .prompt([
                    {
                        name: "answerFirstName",
                        type: "input",
                        message: "Enter employee's FIRST name..."
                    },
                    {
                        name: "answerLastName",
                        type: "input",
                        message: "Enter employee's LAST name..."
                    },
                    {
                        name: "answerRole",
                        type: "list",
                        message: "Select role for employee...",
                        choices: roles
                    },
                    {
                        name: "answerManager",
                        type: "list",
                        message: "Select manager for employee or 'No Manager' if employee does not have a manager.",
                        choices: employees
                    }
                ])
        })
        .then((answer) => {
            const employee = new Employee(answer.answerFirstName, answer.answerLastName, answer.answerRole, answer.answerManager);
            return connection.insertEmployee(employee);
        })
        .then(() => {
            console.log("Successfully added employee.");
            return homeMenu();
        })
        .catch(err => { if (err) throw err });
}

function editMenu() {
    connection.tableHasData()
        .then(({ departments, roles, employees }) => {
            return inquirer
                .prompt({
                    name: "editAnswer",
                    type: "list",
                    message: "Select category to edit...",
                    choices: [
                        { name: "Departments", disabled: (departments) ? false : "No departments to edit." },
                        { name: "Roles", disabled: (roles) ? false : "No roles to edit." },
                        { name: "Employees", disabled: (employees) ? false : "No employees to edit." },
                        { name: "Back" },
                        { name: "Exit" }
                    ]
                })
        })
        .then(({ editAnswer }) => {
            switch (editAnswer) {
                case "Departments": selectDepartments(); break;
                case "Roles": editRoles(); break;
                case "Employees": editEmployees(); break;
                case "Back": homeMenu(); break;
                case "Exit": exit(); break;
                default: exit();
            }
        })
        .catch(err => { if (err) throw err });
}

function selectDepartments() {
    let choices = [];
    connection.getAll("department")
        .then(departments => {
            choices = departments.map((obj) => {
                return {
                    name: obj.name,
                    value: obj
                }
            });
            choices.unshift("Back");
            return;
        })
        .then(() => {
            return inquirer
                .prompt({
                    name: "answerSelectDepartment",
                    type: "list",
                    message: "Select department to edit...",
                    choices: choices
                })
        })
        .then(({ answerSelectDepartment }) => {
            if (answerSelectDepartment === "Back") return editMenu();
            else return editDepartment(answerSelectDepartment);
        })
        .catch(err => { if (err) throw err });
}

function editDepartment(department) {
    inquirer
        .prompt({
            name: "editDepartment",
            type: "list",
            message: `Department: ${department.name}`,
            choices: ["Change Name", "Back", "Exit"]
        })
        .then(({ editDepartment }) => {
            switch (editDepartment) {
                case "Change Name": editDepartmentName(); break;
                case "Back": selectDepartments(); break;
                default: selectDepartments();
            }
        })
        .catch(err => { if (err) throw err });
}

function editDepartmentName() {
    console.log("EDIT DEPARTMENT NAMELEL LOL");
}

function editRoles() {
    console.log("lets edit Roles!")
}

function editEmployees() {
    console.log("lets edit Employees!")
}

function exit() {
    console.log("Thank you for using eManager. Bye!");
    connection.close();
}