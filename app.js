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
});

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
});

// *** CLI STARTS HERE ***
homeMenu("Welcome to eManager. Choose an option to get started.");

// function for main menu prompt
function homeMenu(message = "Main Menu. Choose an option...") {
    inquirer
        .prompt({
            name: "homeAnswer",
            type: "list",
            message: message,
            choices: ["Create", "View", "Edit", "Exit"]
        })
        .then(({ homeAnswer }) => {
            switch (homeAnswer) {
                case "Create": createMenu(); break;
                case "Edit": editMenu(); break;
                case "View": viewMenu(); break;
                case "Exit": exit(); break;
            }
        })
        .catch(err => { if (err) throw err });
}

//prompts what type of item to create
function createMenu() {
    connection.tableHasData()
        .then(({ departments, roles, employees }) => {
            let choices = [
                { name: "Department" },
                { name: "Role", disabled: (departments) ? false : "Disabled, create department first." },
                { name: "Employee", disabled: (roles) ? false : "Disabled, create role first." }
            ]
            return inquirer
                .prompt({
                    name: "createAnswer",
                    type: "list",
                    message: "Create...",
                    choices: addMenu(choices),
                    default: 3
                });
        })
        .then(({ createAnswer }) => {
            switch (createAnswer) {
                case "Department": askDepartment(); break;
                case "Role": askRole(); break;
                case "Employee": askEmployee(); break;
                case "Main Menu": homeMenu(); break;
                case "Back": homeMenu(); break;
                case "Exit": exit(); break;
                default: exit();
            }
        })
        .catch(err => { if (err) throw err });
}

//prompt user to input name of department
function askDepartment() {
    connection.getCol("name", "department")
        .then(depts => depts.map(obj => obj.name))
        .then(depts => {
            return inquirer
                .prompt({
                    name: "answerDepartment",
                    type: "input",
                    message: "Enter department name...",
                    validate: (answer) => {
                        if (answer === "") return "Department name cannot be empty.";
                        if (depts.includes(answer)) return "Department name already exists. Choose a different name.";
                        return true;
                    }
                })
        })
        // add department to database using user's answer
        .then(({ answerDepartment }) => connection.insertDepartment(answerDepartment))
        .then(() => {
            console.log("Successfully added department!");
            return homeMenu();
        })
        .catch(err => { if (err) throw err });

}

// ask user for information on role they want to create
function askRole() {
    let roleNames = [];
    let depList = [];
    // get all departments from database to use in list question
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
                        validate: (answer) => {
                            if (roleNames.includes(answer)) return "Role name already exists.";
                            if (answer === "") return "Role name cannot be empty.";
                            return true;
                        }
                    },
                    {
                        name: "answerRoleSalary",
                        type: "input",
                        message: "Enter salary for this role...",
                        validate: (answer) => {
                            if (answer === "") return "Salary cannot be empty.";
                            if (!answer.match(/^[0-9]*$/gm)) return "Enter numbers only.";
                            return true;
                        }
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
            // formatting role object to be used in insertRole() function
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

// ask user for information regarding employee they want to create
function askEmployee() {
    let employees = [];
    let roles = [];
    // get all employees to use in manager list question
    connection.getAll("employee")
        .then(res => {
            // map employee list so that employee object shows in answer
            // and first and last name show in list
            employees = res.map(employee => {
                return {
                    name: `${employee.first_name} ${employee.last_name}`,
                    value: employee.id
                };
            });
            employees.unshift({ name: "No Manager", value: 0 })
            return;
        })
        // get all roles to validate new role has a unique name
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
                        message: "Enter employee's FIRST name...",
                        validate: answer => {
                            if (answer === "") return "Input cannot be empty.";
                            if (!answer.match(/^[A-Z]+$/i)) return "Enter alphabet characters only.";
                            return true;
                        }
                    },
                    {
                        name: "answerLastName",
                        type: "input",
                        message: "Enter employee's LAST name...",
                        validate: answer => {
                            if (answer === "") return "Input cannot be empty.";
                            if (!answer.match(/^[A-Z]+$/i)) return "Enter alphabet characters only.";
                            return true;
                        }
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
        .then((answer) => { // construct employee and insert into database
            const employee = new Employee(answer.answerFirstName, answer.answerLastName, answer.answerRole, answer.answerManager);
            return connection.insertEmployee(employee);
        })
        .then(() => {
            console.log("Successfully added employee.");
            return homeMenu();
        })
        .catch(err => { if (err) throw err });
}

// prompt categories to view
function viewMenu() {
    inquirer
        .prompt({
            name: "viewAnswer",
            type: "list",
            message: "Select option to view...",
            choices: addMenu(["View Departments", "View Roles", "View Employees", "View Employees By Manager"]),
            default: 3
        })
        .then(({ viewAnswer }) => {
            switch (viewAnswer) {
                case "Exit": return exit();
                case "Main Menu": return homeMenu();
                case "Back": return homeMenu();
                case "View Departments": return viewDepartments();
                case "View Roles": return viewRoles();
                case "View Employees": return viewEmployees();
                case "View Employees By Manager": return viewEmployeesByManager();
            }
        })
        .catch(err => { if (err) throw err });
}

// display information regarding departments
function viewDepartments() {
    let depts = [];
    let salaries = [];
    // get all departments from database
    connection.getAll("department")
    // map departments to have a "ub" property which will be used to calculate 'utilized budget'
        .then(rows => depts = rows.map(obj => {
            return {
                id: obj.id,
                name: obj.name,
                ub: 0
            };
        }))
        .then(() => connection.getEmployeeBudgetView())
        .then(emps => {
            // for each employee add their salary to their department's 'ub' property
            salaries = emps;
            for (let i = 0; i < salaries.length; i++) {
                const emp = salaries[i];
                for (let j = 0; j < depts.length; j++) {
                    const dept = depts[j];
                    if (emp.department_id === dept.id) {
                        dept.ub += emp.salary;
                    }
                }
            }
            // map departments for better column title formatting
            depts = depts.map(obj => {
                return {
                    ID: obj.id,
                    Name: obj.name,
                    "Utilized Budget": obj.ub
                };
            });
            console.table(depts);
            return;
        })
        .then(() => viewMenu())
        .catch(err => { if (err) throw err });
}

// get and console.table roles, super simple!
function viewRoles() {
    connection.getRoleView()
        .then(rows => console.table(rows))
        .then(() => viewMenu())
        .catch(err => { if (err) throw err });
}

// get and console.table employees
function viewEmployees() {
    connection.getEmployeeView()
        .then(view => console.table(view))
        .then(() => viewMenu())
        .catch(err => { if (err) throw err });
}

// prompt to select manager to view their employees
function viewEmployeesByManager() {
    let managerIds = [];
    let choices = [];
    // get list of employees
    connection.getAll("employee")
        .then(emps => {
            // collect all manager ids so we can find out who is a manager
            managerIds = emps.map(obj => obj.manager_id);
            // remove duplicate ids
            managerIds = [...new Set(managerIds)];
            // set choices to have only employees whose ID is
            // included in the unique manager id list
            choices = emps.filter(emp => managerIds.includes(emp.id));
            // map choices to display names as choices with employee object as answer
            choices = choicesMapEmployee(choices);
            return inquirer
                .prompt({
                    name: "viewManagerEmployees",
                    type: "list",
                    message: "Select manager...",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ viewManagerEmployees }) => {
            switch (viewManagerEmployees) {
                case "Exit": return exit();
                case "Main Menu": return homeMenu();
                case "Back": return viewMenu();
                // send selected manager to function:
                default: return displayEmployeesByManager(viewManagerEmployees);
            }
        })
        .catch(err => { if (err) throw err });
}

// get list of employees that have this manager and console.table them
function displayEmployeesByManager(manager) {
    connection.getEmployeeForManager(manager.id)
        .then(emps => console.table(emps))
        .then(() => viewEmployeesByManager())
        .catch(err => { if (err) throw err });
}

// prompt to select category to edit
function editMenu() {
    connection.tableHasData()
        .then(({ departments, roles, employees }) => {
            // only allow selecting categories that have something in them to edit
            let choices = [
                { name: "Departments", disabled: (departments) ? false : "No departments to edit." },
                { name: "Roles", disabled: (roles) ? false : "No roles to edit." },
                { name: "Employees", disabled: (employees) ? false : "No employees to edit." }
            ];
            return inquirer
                .prompt({
                    name: "editAnswer",
                    type: "list",
                    message: "Select category to edit...",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ editAnswer }) => {
            switch (editAnswer) {
                case "Departments": selectDepartments(); break;
                case "Roles": selectRoles(); break;
                case "Employees": selectEmployees(); break;
                case "Main Menu": homeMenu(); break;
                case "Back": homeMenu(); break;
                case "Exit": exit(); break;
                default: exit();
            }
        })
        .catch(err => { if (err) throw err });
}

// select departments to edit
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
            return;
        })
        .then(() => {
            return inquirer
                .prompt({
                    name: "answerSelectDepartment",
                    type: "list",
                    message: "Select department to edit...",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ answerSelectDepartment }) => {
            switch (answerSelectDepartment) {
                case "Main Menu": homeMenu(); break;
                case "Back": return editMenu();
                case "Exit": return exit();
                default: return editDepartment(answerSelectDepartment);
            }
        })
        .catch(err => { if (err) throw err });
}

// options for editing selected department
function editDepartment(department) {
    inquirer
        .prompt({
            name: "editDepartment",
            type: "list",
            message: `Department: ${department.name}`,
            choices: addMenu(["Change Name", "Delete Department"]),
            default: 3
        })
        .then(({ editDepartment }) => {
            switch (editDepartment) {
                case "Change Name": editDepartmentName(department); break;
                case "Delete Department": deleteDepartment(department); break;
                case "Main Menu": homeMenu(); break;
                case "Back": selectDepartments(); break;
                case "Exit": exit(); break;
                default: selectDepartments();
            }
        })
        .catch(err => { if (err) throw err });
}

function editDepartmentName(targetDept) {
    connection.getCol("name", "department")
        .then(departments => {
            return inquirer
                .prompt({
                    name: "newDeptName",
                    type: "input",
                    message: "Enter new name...",
                    validate: (answer) => {
                        if (answer === "") return "Input cannot be empty.";
                        if (departments.map(dept => dept.name).includes(answer) && (answer !== targetDept.name)) return "Department name already exists. Choose a different name.";
                        return true;
                    }
                })
        })
        .then(({ newDeptName }) => connection.update("department", "name", newDeptName, targetDept.id))
        .then(() => {
            console.log("Successfully updated department name.");
            return selectDepartments();
        })
        .catch(err => { if (err) throw err });

}

function deleteDepartment(dept) {
    inquirer
        .prompt({
            name: "deptDeleteConfirm",
            type: "confirm",
            message: `Are you sure you want to delete department ${dept.name}?`
        })
        .then(({ deptDeleteConfirm }) => {
            if (!deptDeleteConfirm) {
                return editDepartment(dept);
            } else {
                return inquirer
                    .prompt({
                        name: "moveOrKeep",
                        type: "list",
                        message: "What would you like to do with the employees and roles contained within this department?",
                        choices: addMenu(["Move to new department", "Remove All"]),
                        default: 3
                    })
            }
        })
        .then(({ moveOrKeep }) => {
            switch (moveOrKeep) {
                case "Exit": return exit();
                case "Main Menu": homeMenu(); break;
                case "Back": return editDepartment(dept);
                case "Remove All": return deleteDepartmentDeleteAll(dept);
                case "Move to new department": return deleteDepartmentMoveAll(dept);
            }
        })
        .catch(err => { if (err) return err });
}

function deleteDepartmentMoveAll(dept) {
    let choices = [];
    connection.getAll("department")
        .then(rows => {
            choices = rows.filter(row => dept.id !== row.id);
            choices = choices.map(row => {
                return {
                    name: row.name,
                    value: row
                }
            });
            return inquirer
                .prompt({
                    name: "receivingDept",
                    type: "list",
                    message: "Move roles and employees to department...",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ receivingDept }) => connection.updateMore("role", "department_id", receivingDept.id, dept.id))
        .then(() => console.log("Successfully moved roles."))
        .then(() => connection.deleteFromWhere("department", "id", dept.id))
        .then(() => {
            console.log("Successfully deleted department.");
            return selectDepartments();
        })
        .catch(err => { if (err) throw err });
}

function deleteDepartmentDeleteAll(dept) {
    connection.deleteAllByDept(dept.id)
        .then(() => {
            console.log("Successfully deleted department and all employees and roles within.");
            return editMenu();
        })
        .catch(err => { if (err) throw err });
}

function selectRoles() {
    let choices = [];
    connection.getRoleExtra()
        .then(roles => {
            choices = roles.map((obj) => {
                return {
                    name: `${obj.name}   (Salary: ${obj.salary}   Department: ${obj.department_name})`,
                    value: obj
                }
            });
            return;
        })
        .then(() => {
            return inquirer
                .prompt({
                    name: "answerSelectRoles",
                    type: "list",
                    message: "Select role to edit...",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ answerSelectRoles }) => {
            switch (answerSelectRoles) {
                case "Main Menu": homeMenu(); break;
                case "Back": return editMenu();
                case "Exit": return exit();
                default: return editRole(answerSelectRoles)

            }
        })
        .catch(err => { if (err) throw err });
}

function editRole(role) {
    inquirer
        .prompt({
            name: "editRole",
            type: "list",
            message: `\nRole: ${role.name}\nSalary: ${role.salary}\nDepartment: ${role.department_name}`,
            choices: addMenu(["Change Name", "Change Salary", "Change Department", "Delete Role"]),
            default: 3
        })
        .then(({ editRole }) => {
            switch (editRole) {
                case "Change Name": return editRoleName(role);
                case "Change Salary": return editRoleSalary(role);
                case "Change Department": return editRoleDepartment(role);
                case "Delete Role": return deleteRole(role);
                case "Main Menu": homeMenu(); break;
                case "Back": return selectRoles();
                case "Exit": return exit();
                default: return selectRoles();
            }
        })
        .catch(err => { if (err) throw err });
}

function deleteRole(role) {
    inquirer
        .prompt({
            name: "roleDeleteConfirm",
            type: "confirm",
            message: `Are you sure you want to delete role ${role.name}?`
        })
        .then(({ roleDeleteConfirm }) => {
            if (!roleDeleteConfirm) {
                return editRole(role);
            } else {
                return inquirer
                    .prompt({
                        name: "moveOrKeep",
                        type: "list",
                        message: "What would you like to do with the employees that have this role?",
                        choices: addMenu(["Move to new role", "Remove All"]),
                        default: 3
                    })
            }
        })
        .then(({ moveOrKeep }) => {
            switch (moveOrKeep) {
                case "Exit": return exit();
                case "Main Menu": homeMenu(); break;
                case "Back": return editRole(role);
                case "Remove All": return deleteRoleDeleteAll(role);
                case "Move to new role": return deleteRoleMoveAll(role);
            }
        })
        .catch(err => { if (err) return err });
}

function deleteRoleMoveAll(role) {
    let choices = [];
    connection.getAll("role")
        .then(rows => {
            choices = rows.filter(obj => obj.id !== role.id);
            choices = choices.map(obj => {
                return {
                    name: obj.name,
                    value: obj
                }
            });
            return inquirer
                .prompt({
                    name: "receivingRole",
                    type: "list",
                    message: "Select new role for employees...",
                    choices: addMenu(choices),
                    default: 3
                });
        })
        .then(({ receivingRole }) => connection.updateMore("employee", "role_id", receivingRole.id, role.id))
        .then(() => console.log("Successfully moved employees to role."))
        .then(() => connection.deleteFromWhere("role", "id", role.id))
        .then(() => {
            console.log("Successfully removed role.");
            return editMenu();
        })
        .catch(err => { if (err) throw err });
}

function deleteRoleDeleteAll(role) {
    connection.deleteFromWhere("employee", "role_id", role.id)
        .then(() => console.log("Successfully removed employees."))
        .then(() => connection.deleteFromWhere("role", "id", role.id))
        .then(() => console.log("Successfully deleted role."))
        .then(() => editMenu())
        .catch(err => { if (err) throw err });
}

function editRoleName(role) {
    let updatedRole = role;
    connection.getCol("name", "role")
        .then(nameList => nameList.map(item => item.name))
        .then(roleValidateList => {
            return inquirer.prompt({
                name: "newRoleName",
                type: "input",
                message: "Enter new role name",
                validate: (answer) => {
                    if (answer === "") return "Input cannot be empty.";
                    if (roleValidateList.includes(answer) && (answer !== role.name)) return "Role name already exists. Choose a different name.";
                    return true;
                }
            });
        })
        .then(({ newRoleName }) => {
            updatedRole.name = newRoleName;
            return connection.update("role", "name", newRoleName, updatedRole.id);
        })
        .then(() => {
            console.log("Succcessfully updated role name.");
            return editRole(updatedRole);
        })
        .catch(err => { if (err) throw err });
}

function editRoleSalary(role) {
    let updatedRole = role;
    inquirer
        .prompt({
            name: "roleSalary",
            type: "input",
            message: "Enter new salary for role",
            validate: (answer) => {
                if (answer === "") return "Input cannot be empty.";
                if (!answer.match(/^[0-9]*$/gm)) return "Enter numbers only.";
                return true;
            }
        })
        .then(({ roleSalary }) => {
            updatedRole.salary = roleSalary;
            return connection.update("role", "salary", roleSalary, role.id);
        })
        .then(() => {
            console.log("Successfully updated role salary.");
            return editRole(updatedRole);
        })
        .catch(err => { if (err) throw err });
}

function editRoleDepartment(role) {
    let updatedRole = role;
    let choices = [];
    connection.getAll("department")
        .then(depts => {
            choices = depts.map(dept => {
                return {
                    name: dept.name,
                    value: dept
                }
            });
            return;
        })
        .then(() => {
            return inquirer
                .prompt({
                    name: "newDept",
                    type: "list",
                    message: "Select new department for role.",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ newDept }) => {
            switch (newDept) {
                case "Main Menu": homeMenu(); break;
                case "Back": return editRole(role);
                case "Exit": return exit();
                default:
                    updatedRole.department_id = newDept.id;
                    updatedRole.department_name = newDept.name;
                    connection.update("role", "department_id", newDept.id, updatedRole.id)
                        .then(() => {
                            console.log("Successfully updated department for role.");
                            return editRole(updatedRole);
                        });
            }
        })
        .catch(err => { if (err) throw err });
}

function selectEmployees() {
    let choices = [];
    connection.getEmployeeExtra()
        .then(employees => {
            choices = employees.map(emp => {
                return {
                    name: `${emp.first_name} ${emp.last_name}`,
                    value: emp
                }
            });
            return inquirer
                .prompt({
                    name: "selectedEmployee",
                    type: "list",
                    message: "Select employee...",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ selectedEmployee }) => {
            switch (selectedEmployee) {
                case "Main Menu": homeMenu(); break;
                case "Back": return editMenu();
                case "Exit": return exit();
                default: return editEmployee(selectedEmployee);
            }
        })
        .catch(err => { if (err) throw err });
}

function editEmployee(emp) {
    inquirer
        .prompt({
            name: "editEmployee",
            type: "list",
            message: `\nName: ${emp.first_name} ${emp.last_name}\nRole: ${emp.role_name}\nDepartment: ${emp.department_name}`,
            choices: addMenu(["Change First Name", "Change Last Name", "Change Role", "Change Manager", "Delete Employee"]),
            default: 3
        })
        .then(({ editEmployee }) => {
            switch (editEmployee) {
                case "Change First Name": return editEmployeeFirstName(emp);
                case "Change Last Name": return editEmployeeLastName(emp);
                case "Change Role": return editEmployeeRole(emp);
                case "Change Manager": return editEmployeeManager(emp);
                case "Delete Employee": return deleteEmployee(emp);
                case "Main Menu": homeMenu(); break;
                case "Back": return selectEmployees();
                case "Exit": return exit();
                default: return selectEmployees();
            }
        })
        .catch(err => { if (err) throw err });
}

function deleteEmployee(emp) {
    let isManager;
    let managerIds = [];
    let choices = [];
    connection.getAll("employee")
        .then(rows => {
            choices = rows.filter(obj => obj.id !== emp.id);
            managerIds = choices.map(obj => obj.manager_id);
            isManager = managerIds.includes(emp.id);
            choices = choices.map(obj => {
                return {
                    name: `${obj.first_name} ${obj.last_name}`,
                    value: obj
                };
            });
            return inquirer
                .prompt([
                    {
                        name: "confirmDelete",
                        type: "confirm",
                        message: `Are you sure you want to delete ${emp.first_name} ${emp.last_name}?`
                    },
                    {
                        name: "deleteMethod",
                        type: "list",
                        message: "What would you like to do with this manager's employees?",
                        choices: addMenu([
                            { name: "Leave employees without a manager", value: "clearManager" },
                            "Move to new manager",
                            "Remove All Employees"
                        ]),
                        default: 3,
                        when: ({ confirmDelete }) => confirmDelete && isManager
                    }
                ]);
        })
        .then(({ confirmDelete, deleteMethod }) => {
            if (!confirmDelete) {
                return editEmployee(emp);
            } else if (!isManager) {
                connection.deleteFromWhere("employee", "id", emp.id)
                    .then(() => selectEmployees());
            }
            else switch (deleteMethod) {
                case "Main Menu": return homeMenu();
                case "Back": return editEmployee(emp);
                case "Exit": return exit();
                case "clearManager": return deleteEmployeeClearManager(emp);
                case "Move to new manager": return deleteEmployeeMoveAll(emp);
                case "Remove All Employees": return deleteEmployeeDeleteAll(emp);
            }
        })
        .catch(err => { if (err) throw err });
}

function deleteEmployeeClearManager(emp) {
    connection.updateMore("employee", "manager_id", 0, emp.id)
        .then(() => console.log("Successfully updated employee's managers."))
        .then(() => connection.deleteFromWhere("employee", "id", emp.id))
        .then(() => console.log("Successfully deleted employee."))
        .then(() => selectEmployees())
        .catch(err => { if (err) throw err });
}

function deleteEmployeeMoveAll(emp) {
    let recMan;
    let choices = [];
    connection.getAll("employee")
        .then((rows => {
            choices = rows.filter(row => row.id !== emp.id);
            choices = choicesMapEmployee(choices);
            return inquirer
                .prompt({
                    name: "receivingManager",
                    type: "list",
                    message: "Select a new manager for employees...",
                    choices: addMenu(choices),
                    default: 3
                })
        }))
        .then(({ receivingManager }) => {
            switch (receivingManager) {
                case "Main Menu": homeMenu(); break;
                case "Back": return editEmployee(emp);
                case "Exit": return exit();
                default:
                    recMan = receivingManager;
                    return connection.updateMore("employee", "manager_id", receivingManager.id, emp.id)
            }

        })
        .then(() => {
            if (recMan.manager_id === emp.id) return connection.update("employee", "manager_id", 0, recMan.id);
            else return;
        })
        .then(() => console.log("Successfully moved employees to new manager"))
        .then(() => connection.deleteFromWhere("employee", "id", emp.id))
        .then(() => console.log("Successfully deleted manager."))
        .then(() => selectEmployees())
        .catch(err => { if (err) throw err });
}

function deleteEmployeeDeleteAll(emp) {
    connection.deleteFromWhere("employee", "manager_id", emp.id)
        .then(() => connection.deleteFromWhere("employee", "id", emp.id))
        .then(() => console.log("Successfully deleted employee and employees with this manager."))
        .then(() => selectEmployees())
        .catch(err => { if (err) throw err });
}

function editEmployeeFirstName(emp) {
    updatedEmployee = emp;
    inquirer
        .prompt({
            name: "empFirstName",
            type: "input",
            message: "Enter employee FIRST name...",
            validate: answer => {
                if (answer === "") return "Input cannot be empty.";
                if (!answer.match(/^[A-Z]+$/i)) return "Enter alphabet characters only.";
                return true;
            }
        })
        .then(({ empFirstName }) => {
            updatedEmployee.first_name = empFirstName;
            return connection.update("employee", "first_name", empFirstName, emp.id);
        })
        .then(() => {
            console.log("Successfully changed employee first name.");
            return editEmployee(updatedEmployee);
        })
}

function editEmployeeLastName(emp) {
    updatedEmployee = emp;
    inquirer
        .prompt({
            name: "empLastName",
            type: "input",
            message: "Enter employee LAST name...",
            validate: answer => {
                if (answer === "") return "Input cannot be empty.";
                if (!answer.match(/^[A-Z]+$/i)) return "Enter alphabet characters only.";
                return true;
            }
        })
        .then(({ empLastName }) => {
            updatedEmployee.last_name = empLastName;
            return connection.update("employee", "last_name", empLastName, emp.id);
        })
        .then(() => {
            console.log("Successfully changed employee last name.");
            return editEmployee(updatedEmployee);
        })
}

function editEmployeeRole(emp) {
    updatedEmployee = emp;
    choices = [];
    connection.getRoleExtra()
        .then(roles => {
            choices = roles.map(role => {
                return {
                    name: role.name,
                    value: role
                }
            });
            return inquirer
                .prompt({
                    name: "selectedRole",
                    type: "list",
                    choices: addMenu(choices),
                    default: 3
                });
        })
        .then(({ selectedRole }) => {
            switch (selectedRole) {
                case "Main Menu": homeMenu(); break;
                case "Back": return editEmployee(updatedEmployee);
                case "Exit": return exit();
                default:
                    updatedEmployee.role_id = selectedRole.id;
                    updatedEmployee.role_name = selectedRole.name;
                    updatedEmployee.department_name = selectedRole.department_name;
                    updatedEmployee.department_id = selectedRole.department_id;
                    connection.update("employee", "role_id", selectedRole.id, emp.id)
                        .then(() => {
                            console.log("Successfully changed employee role.");
                            return editEmployee(updatedEmployee);
                        });
            }
        })
        .catch(err => { if (err) throw err });
}


function editEmployeeManager(emp) {
    updatedEmployee = emp;
    choices = [];
    connection.getAll("employee")
        .then(emps => {
            choices = emps.filter(obj => obj.id !== emp.id);
            choices = choices.map(obj => {
                return {
                    name: `${obj.first_name} ${obj.last_name}`,
                    value: obj
                }
            });
            return inquirer
                .prompt({
                    name: "selectedManager",
                    type: "list",
                    choices: addMenu(choices),
                    default: 3
                })
        })
        .then(({ selectedManager }) => {
            switch (selectedManager) {
                case "Exit": return exit();
                case "Main Menu": homeMenu(); break;
                case "Back": return editEmployee(updatedEmployee)
                default:
                    updatedEmployee.manager_id = selectedManager.id;
                    updatedEmployee.manager = `${selectedManager.first_name} ${selectedManager.last_name}`;
                    return connection.update("employee", "manager_id", selectedManager.id, updatedEmployee.id)
                        .then(() => {
                            console.log("Successfully changed employee manager.");
                            return editEmployee(updatedEmployee);
                        });
            }
        })
        .catch(err => { if (err) throw err });
}

function exit() {
    console.log("Thank you for using eManager. Bye!");
    connection.close();
}

function addMenu(array) {
    let menu = array;
    menu.unshift(new inquirer.Separator());
    menu.unshift("Back");
    menu.unshift("Main Menu");
    menu.unshift("Exit");
    return menu;
}

function choicesMap(choices) {
    return choices.map(obj => {
        return {
            name: obj.name,
            value: obj
        };
    });
}

function choicesMapEmployee(choices) {
    return choices.map(obj => {
        return {
            name: `${obj.first_name} ${obj.last_name}`,
            value: obj
        };
    });
}
