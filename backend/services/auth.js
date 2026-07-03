const mysql = require('mysql2/promise')
const express = require('express')
const pool = require('../db')
const router = express.Router()
const jwt = require('jsonwebtoken')
const { generateAccessToken, generateRefreshToken, hashToken } = require('../utils/generateTokens.js')
const bcrypt = require('bcrypt')
const authenticate = require('../middleware/authenticate.js')
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
        if (!user) return res.status(401).json({ message: "Invalid username or password" })

        const isValid = await bcrypt.compare(password, user.hashed_password)
        if (!isValid) return res.status(401).json({ message: 'Invalid username or password' })

        const { hashed_password, ...userWithoutPass } = user

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

router.post('/user', async (req, res) => {
    const reqRefreshToken = req.cookies.refreshToken
    if (!reqRefreshToken) return res.status(401).json({ message: 'Missing refresh token' })
    try {
        const payload = jwt.verify(reqRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const selectQuery = `SELECT id, username, hashed_refresh_token FROM user_tbl where id = ?`
        const [rows] = await pool.execute(selectQuery, [payload.sub])
        const user = rows[0]
        const { hashed_refresh_token, ...userWithoutHashedRefreshToken } = user
        if (!user) return res.status(401).json({ message: 'User no longer exist' })

        const accessToken = generateAccessToken(userWithoutHashedRefreshToken)
        return res.status(200).json({ accessToken, user: userWithoutHashedRefreshToken, status: 'ok' })
    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: 'Invalid refresh token' })
    }
})

router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) return res.status(401).json({ message: 'Refresh token does not exist' })

    try {
        const payload = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)

        const selectQuery = `SELECT id, username, hashed_refresh_token from user_tbl where id = ?`
        const [rows] = await pool.execute(selectQuery, [payload.sub])
        const user = rows[0]
        const { hashed_refresh_token, ...userWithoutHashedRefreshToken } = user
        if (!user) return res.status(401).json({ message: 'User does not exist' })

        const hashedRefreshToken = hashToken(refreshToken)
        if (hashedRefreshToken !== user.hashed_refresh_token) {
            res.clearCookie('refreshToken')
            const nullUpdateQuery = `UPDATE user_tbl SET hashed_refresh_token = NULL WHERE id = ?`
            await pool.execute(nullUpdateQuery, [payload.sub])
            return res.status(401).json({ message: 'Session expired. Please re-login' })
        }

        const newAccessToken = generateAccessToken(userWithoutHashedRefreshToken)
        const newRefreshToken = generateRefreshToken(userWithoutHashedRefreshToken)
        const newHashedRefreshToken = hashToken(newRefreshToken)

        const updateQuery = `UPDATE user_tbl SET hashed_refresh_token = ? WHERE id = ?`
        await pool.execute(updateQuery, [newHashedRefreshToken, payload.sub])

        res.cookie('refreshToken', newRefreshToken, refreshTokenOptions)
        return res.status(200).json({ accessToken: newAccessToken, user: userWithoutHashedRefreshToken, status: 'ok' })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

router.post('/logout', authenticate, async (req, res) => {
    try {
        res.clearCookie('refreshToken')
        const updateQuery = `UPDATE user_tbl SET hashed_refresh_token = NULL where id = ?`
        await pool.execute(updateQuery, [req.id])
        console.log(`userID: ${req.id} has logged out`)
        return res.status(200).json({ message: 'Log out successfully' })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router