require('dotenv/config')
const mysql = require('mysql2/promise')
const host = process.env.DB_HOST
const user = process.env.DB_USER
const password = process.env.DB_PASSWORD
const database = process.env.DB_NAME
const waitForConnections = process.env.DB_WAIT_FOR_CONNECTION
const connectionLimit = Number(process.env.DB_CONNECTION_LIMIT)

console.log('user', user)
console.log('db password', password, typeof (password))
const pool = mysql.createPool({
    host: host,
    user: user,
    password: password,
    database: database,
    waitForConnections: waitForConnections,
    connectionLimit: connectionLimit
})

module.exports = pool