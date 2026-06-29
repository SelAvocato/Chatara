const jwt = require('jsonwebtoken')
const crypto = require('crypto')

function generateAccessToken(user) {
    return jwt.sign(
        { sub: user.id, username: user.username },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' })
}

function generateRefreshToken(user) {
    return jwt.sign(
        { sub: user.id },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )
}

function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex')
}

module.exports = { generateAccessToken, generateRefreshToken, hashToken }