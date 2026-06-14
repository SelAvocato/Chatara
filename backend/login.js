const express = require('express')
const router = express.Router()
const pool = require('./db')
const userTbl = 'user_tbl'

router.post('/', async (req, res) => {
    const { username, password } = req.body
    const loginInfo = {
        username: username,
        password: password
    }
    if (!loginInfo || !loginInfo?.username || !loginInfo?.password) return res.status(400).json({ message: "Invalid username or password" })
    try {
        const query = `SELECT * FROM ${userTbl} WHERE username = ? LIMIT 1 `
        const [row] = await pool.execute(query, [loginInfo.username])
        const user = row[0]

        if (!user || loginInfo.password !== user.hashed_password) return res.status(400).json({ message: "Invalid username or password" })

        return res.status(200).json({ user: user, status: 'ok' })
    } catch (e) {
        return res.status(500).json({ message: e.message })
    }
})

module.exports = router