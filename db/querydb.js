const mysql = require('mysql');
class Database {
    constructor(config) {
        this.connection = mysql.createConnection(config);
    }
    query(sql, args) {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err)
                    return reject(err);
                resolve(rows);
            });
        });
    }

    getAll(table, args) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM ${table};`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getCol(col, table, args) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${col} FROM ${table};`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getWhere(table, statement, args) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT * FROM ${table} WHERE ${statement};`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getRoleExtra(args) {
        return new Promise((resolve, reject) => {
            let sql =
                `SELECT role.id, role.name, role.salary, department.name AS "department_name", department.id AS "department_id"
                FROM role
                INNER JOIN department 
                ON role.department_id = department.id`
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getEmployeeExtra(args) {
        return new Promise((resolve, reject) => {
            let sql =
                `SELECT 
                employee.id, employee.first_name, employee.last_name, employee.role_id, employee.manager_id,
                role.name AS role_name,
                department.id AS department_id,
                department.name AS department_name,
                CONCAT(fresh.first_name, ' ', fresh.last_name) AS Manager
                FROM employee
                INNER JOIN role 
                ON employee.role_id = role.id
                INNER JOIN department 
                ON role.department_id = department.id
                LEFT OUTER JOIN employee fresh
                ON employee.manager_id = fresh.id
                ORDER BY employee.id ASC;`
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getEmployeeView() {
        return new Promise((resolve, reject) => {
            let sql =
                `SELECT 
                employee.id, CONCAT(employee.first_name,' ', employee.last_name) AS Name,
                role.name AS Role,
                department.name AS Department, role.salary AS Salary,
                CONCAT(fresh.first_name, ' ', fresh.last_name) AS Manager
                FROM employee
                INNER JOIN role 
                ON employee.role_id = role.id
                INNER JOIN department 
                ON role.department_id = department.id
                LEFT OUTER JOIN employee fresh
                ON employee.manager_id = fresh.id
                ORDER BY employee.id ASC;`
            this.connection.query(sql, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getEmployeeForManager(managerID) {
        return new Promise((resolve, reject) => {
            let sql =
                `SELECT 
                employee.id, CONCAT(employee.first_name,' ', employee.last_name) AS Name,
                role.name AS Role,
                department.name AS Department, role.salary AS Salary,
                CONCAT(fresh.first_name, ' ', fresh.last_name) AS Manager
                FROM employee
                INNER JOIN role 
                ON employee.role_id = role.id
                INNER JOIN department 
                ON role.department_id = department.id
                LEFT OUTER JOIN employee fresh
                ON employee.manager_id = fresh.id
                WHERE employee.manager_id = ${managerID}
                ORDER BY employee.id ASC;`
            this.connection.query(sql, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getEmployeeBudgetView() {
        return new Promise((resolve, reject) => {
            let sql =
                `SELECT 
                employee.id, department.name, role.department_id, role.salary
                FROM employee
                INNER JOIN role 
                ON employee.role_id = role.id
                INNER JOIN department 
                ON role.department_id = department.id
                ORDER BY department.id;`
            this.connection.query(sql, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    getColWhere(col, table, statement, args) {
        return new Promise((resolve, reject) => {
            let sql = `SELECT ${col} FROM ${table} WHERE ${statement};`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            })
        });
    }

    insertDepartment(department, args) {
        return new Promise((resolve, reject) => {
            let sql =
                `INSERT INTO department (name)
                VALUES ("${department}");`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    update(table, col, value, id, args) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE ${table} SET ${col} = "${value}" WHERE id = ${id}`
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            })
        });
    }

    updateMore(table, col, newID, oldID, args) {
        return new Promise((resolve, reject) => {
            let sql = `UPDATE ${table} SET ${col} = "${newID}" WHERE ${col} = ${oldID}`
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            })
        });
    }

    insertRole(role, args) {
        return new Promise((resolve, reject) => {
            let sql =
                `INSERT INTO role (name, salary, department_id)
                VALUES ("${role.name}", ${role.salary}, ${role.department_id});`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    insertEmployee(employee, args) {
        return new Promise((resolve, reject) => {
            let sql =
                `INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${employee.firstName}", "${employee.lastName}", ${employee.roleID}, ${employee.managerID});`;
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    tableHasData() {
        let departments = [];
        let roles = [];
        let employees = [];
        return new Promise((resolve, reject) => {
            this.getAll("department")
                .then(rows => { departments = rows })
                .then(() => this.getAll("role"))
                .then(rows => roles = rows)
                .then(() => this.getAll("employee"))
                .then(rows => employees = rows)
                .then(() => {
                    resolve({
                        departments: (departments.length !== 0),
                        roles: (roles.length !== 0),
                        employees: (employees.length !== 0)
                    })
                })
                .catch(err => { if (err) return reject(err) })
        })
    }

    getRolesByDept(deptID, args) {
        const sql = `SELECT * FROM role WHERE department_id = ${deptID}`;
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        })
    }

    deleteEmployeesByRole(roleID, args) {
        const sql = `DELETE FROM employee WHERE role_id = ${roleID}`;
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    deleteAllByDept(deptID) {
        let roleIds = [];
        let uniqueRoleIds = [];
        return new Promise((resolve, reject) => {
            this.getRolesByDept(deptID)
                .then(roles => {
                    roleIds = roles.map((role => role.id));
                    uniqueRoleIds = [...new Set(roleIds)];
                    uniqueRoleIds.forEach(roleID => {
                        this.deleteEmployeesByRole(roleID);
                    });
                    return;
                })
                .then(() => this.deleteFromWhere("role", "department_id", deptID))
                .then(() => this.deleteFromWhere("department", "id", deptID))
                .then(() => resolve())
                .catch(err => reject(err));
        })
    }

    deleteFromWhere(table, col, value) {
        const sql = `DELETE FROM ${table} WHERE ${col} = ${value}`;
        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    deleteDeptRemove(dept) {
        return new Promise((resolve, reject) => {

        })
    }

    empIsManager(emp) {
        let isManager = false;
        return new Promise((resolve, reject) => {
            this.getCol("manager_id", "employee")
                .then(rows => {
                    rows.forEach(row => {
                        if (row.manager_id === emp.id) isManager = true;
                    });
                })
                .then(() => resolve(isManager))
                .catch(err => reject(err));
        });

    }


    close() {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if (err)
                    return reject(err);
                resolve();
            });
        });
    }
}

module.exports = Database;