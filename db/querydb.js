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
            })
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