const jwt = require('jsonwebtoken')

function authenticate(req, res, next) {
    const reqAccessToken = req.headers.authorization
    if (!reqAccessToken || !reqAccessToken.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing access token' })
    const accessToken = reqAccessToken.split(' ')[1]

    try {
        const payload = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
        req.id = payload.sub
        next()
    } catch (e) {
        console.error(e)
        return res.status(401).json({ message: 'Invalid access token' })
    }
}

function authenticateWs(socket) {
    try {
        const payload = jwt.verify(socket.accessToken, process.env.ACCESS_TOKEN_SECRET)
        socket.id = payload.sub
    } catch (e) {
        console.error(e)
        socket.send(JSON.stringify({ type: 'expiredAccessToken' }))
        return
    }
}

module.exports = { authenticate, authenticateWs }