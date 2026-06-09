const mysql = require('mysql2/promise')
const express = require('express')
const router = express.Router()
const pool = require('./db')
const userTbl = 'user_tbl'

router.post('/', async (req, res) => {
    const { username, password } = req.body
    console.log(username, password)
    if (!username || !password) return res.status(400).json({ message: 'Username and Password must not be empty' })

    try {
        const sql = `INSERT INTO ${userTbl}(username, hashed_password) values (?, ?)`
        const values = [username, password]
        await pool.execute(sql, values)
        return res.status(201).json({ message: 'Account successfully created', status: 'ok' })
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Username already taken' })
        }
        
        console.error(e)
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router