const jwt = require('jsonwebtoken')


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

module.exports = generateAccessToken, generateAccessToken