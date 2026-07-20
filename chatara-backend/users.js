const express = require('express')
const { authenticate } = require('./middleware/authenticate')
const pool = require('./db')
const router = express.Router()

router.get('/filter', authenticate, async (req, res) => {
    const { username } = req.query
    console.log('usernaaame', username)
    if (!username || (username).trim() === '') return res.status(400).json({ message: 'Missing username' })

    const query = `SELECT username, id FROM user_tbl WHERE username LIKE ? LIMIT 20`
    try {
        const [users] = await pool.execute(query, [`%${username}%`])
        if (users.length === 0) return res.status(200).json({ users, message: 'No users found' })
        res.status(200).json({ users })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router