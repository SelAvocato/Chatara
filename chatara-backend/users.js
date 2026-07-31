const express = require('express')
const { authenticate } = require('./middleware/authenticate')
const pool = require('./db')
const router = express.Router()
const bcrypt = require('bcrypt')

router.get('/filter', authenticate, async (req, res) => {
    const { username } = req.query
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

router.put('/password', authenticate, async (req, res) => {
    const userId = req.id
    if (!userId) return res.status(401).json({ message: 'Unauthorize' })
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword || oldPassword.trim() === '' || newPassword.trim() === '') return res.status(400).json({ message: 'Old password and new password must not be empty' })

    try {
        const confirmOldPassQuery = 'SELECT hashed_password FROM user_tbl WHERE id = ?'
        const [rows] = await pool.execute(confirmOldPassQuery, [userId])
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' })
        const hashedOldPass = rows[0].hashed_password
        const isValid = await bcrypt.compare(oldPassword, hashedOldPass)
        if (!isValid) return res.status(400).json({ message: 'Invalid old password' })
        if (oldPassword === newPassword) return res.status(400).json({ message: 'New password cannot be the same as old password' })
        const newHashedPassword = await bcrypt.hash(newPassword, 12)
        const updatePasswordQuery = 'UPDATE user_tbl SET hashed_password = ? WHERE id = ?'
        await pool.execute(updatePasswordQuery, [newHashedPassword, userId])
        return res.status(200).json({ message: 'Updated password successfully' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router