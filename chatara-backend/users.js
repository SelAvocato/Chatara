const express = require('express')
const { authenticate } = require('./middleware/authenticate')
const pool = require('./db')
const router = express.Router()
const bcrypt = require('bcrypt')
const { catchRouterError } = require('./utils/handleError')

router.get('/filter', authenticate, async (req, res) => {
    const { username } = req.query
    if (!username || (username).trim() === '') return res.status(400).json({ message: 'Missing username' })

    const query = `SELECT username, id FROM user_tbl WHERE username LIKE ? LIMIT 20`
    try {
        const [users] = await pool.execute(query, [`%${username}%`])
        if (users.length === 0) return res.status(200).json({ users, message: 'No users found' })
        res.status(200).json({ users })
    } catch (e) {
        catchRouterError(e, res)
    }
})

router.put('/username', authenticate, async (req, res) => {
    const userId = req.id
    if (!userId) return res.status(401).json({ errorMessage: 'Unauthorize' })
    const { newUsername } = req.body
    if (!newUsername || typeof (newUsername) !== 'string' || newUsername.trim() === '') return res.status(400).json({ errorMessage: 'Username must not be empty' })
    const trimmedUsername = newUsername.trim()
    try {
        const findUserQuery = `SELECT username FROM user_tbl WHERE id = ?`
        const [rows] = await pool.execute(findUserQuery, [userId])
        if (rows.length === 0) return res.status(404).json({ errorMessage: 'User not found' })
        if (rows[0].username === trimmedUsername) return res.status(400).json({ errorMessage: 'New username cannot be the same as old username' })
        const updateUsernameQuery = 'UPDATE user_tbl SET username = ? where id = ?'
        await pool.execute(updateUsernameQuery, [trimmedUsername, userId])
        res.status(200).json({ message: 'Username successfully changed' })
    } catch (e) {
        console.error(e)
        if (e.code === 'ER_DUP_ENTRY') {
            res.status(400).json({ errorMessage: 'Username already taken' })
            return
        }
        res.status(500).json({ errorMessage: 'Something went wrong' })
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
        res.status(200).json({ message: 'Updated password successfully' })
    } catch (e) {
        catchRouterError(e, res)
    }
})

module.exports = router