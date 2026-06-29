const mysql = require('mysql2/promise')
const express = require('express')
const pool = require('../db')
const router = express.Router()
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/generateTokens.js')
const bcrypt = require('bcrypt')
const refreshTokenOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
}

router.post('/login', async (req, res) => {
    const { username, password } = req.body
    if (!username || !password) return res.status(400).json({ message: "Invalid username or password" })
    try {
        const query = `SELECT * FROM user_tbl WHERE username = ? LIMIT 1 `
        const [rows] = await pool.execute(query, [username])
        const user = rows[0]
        if (!user) return res.status(401).json({ message: "User no longer exist" })
        console.log('user', user)

        const isValid = await bcrypt.compare(password, user.hashed_password)
        if (!isValid) return res.status(401).json({ message: 'Invalid username or password' })

        const { hashed_password, ...userWithoutPass } = user
        console.log('new user', userWithoutPass)

        const accessToken = generateAccessToken(userWithoutPass)
        const refreshToken = generateRefreshToken(userWithoutPass)

        res.cookie('refreshToken', refreshToken, refreshTokenOptions)

        const hashRefreshToken = hashToken(refreshToken)

        const updateQuery = `UPDATE user_tbl SET hashed_refresh_token = ? WHERE id = ?`
        await pool.execute(updateQuery, [hashRefreshToken, user.id])

        return res.status(200).json({ accessToken, user: userWithoutPass, status: 'ok' })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: e.message })
    }
})

router.post('/signup', async (req, res) => {
    const { username, password } = req.body
    console.log(username, password)
    if (!username || !password) return res.status(400).json({ message: 'Invalid username or password' })

    try {
        const hashedPassword = await bcrypt.hash(password, 12)
        const sql = `INSERT INTO user_tbl(username, hashed_password) values (?, ?)`
        const values = [username, hashedPassword]
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