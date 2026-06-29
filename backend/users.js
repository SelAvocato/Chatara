const express = require('express')
const pool = require('./db')
const router = express.Router()
const userTbl = "user_tbl"

async function addUser(newUser) {
    try {
        const sql = `INSERT INTO ${userTbl} VALUE (?, ?)`
        const values = [newUser.username, newUser.password]
        await pool.execute(sql, values)
    } catch (e) {
        return e
    }
}

router.get('/', (req, res) => {
    res.json({ error: "You don't have permission" })
})

router.post('/new', async (req, res) => {
    const newUser = req.body
    if (newUser && newUser.username && newUser.password) {
        const user = await addUser(newUser)
        res.status(201).json({ message: "User successfully registered" })
    } else {
        return res.json({ error: "invalid credentials" })
    }
})

module.exports = router