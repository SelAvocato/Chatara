const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
    const reqAccessToken = req.headers.authorization
    if (!reqAccessToken || !reqAccessToken.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing refresh token' })
    const refreshToken = reqAccessToken.split(' ')[1]

    try {
        const payload = jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET)
        req.id = payload.sub
        console.log('successfully saved req.id')
        next()
    } catch (e) {
        console.log(e)
        return res.status(401).json({ message: 'Invalid session, please re-login' })
    }
}

module.exports = authenticate