const express = require('express')
const router = express.Router()
const pool = require('./db')
const userTbl = 'user_tbl'

async function login(info) {
    const query = `SELECT * FROM ${userTbl} WHERE username = ? LIMIT 1 `
    const values = [info.username]
    const [row] = await pool.execute(query, values)
    const user = row[0]

    if (!user) throw new Error("Invalid username or password")

    if (info.password !== user.hashed_password) throw new Error("Invalid username or password")

    return user
}

router.post('/', async (req, res) => {
    const { username, password } = req.body
    const loginInfo = {
        username: username,
        password: password
    }
    if (!loginInfo || !loginInfo?.username || !loginInfo?.password) return res.status(400).json({ message: "Invalid username or password" })
    try {
        const row = await login(loginInfo)
        return res.status(200).json(row)
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

module.exports = router