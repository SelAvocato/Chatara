require('dotenv/config')
const cookieParser = require('cookie-parser')
const { parse } = require('url')
const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000
const http = require('http')
const { WebSocketServer, WebSocket } = require('ws')
const websocketService = require('./services/websocket.js')
const pool = require('./db.js')
const originUrl = process.env.ORIGIN_URL

app.use(cookieParser())
app.use(cors({
    origin: originUrl,
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-uploadthing-package",
        "x-uploadthing-version",
        "x-chatroom-id",
        "traceparent",
        "b3",
        "x-b3-traceid",
        "x-b3-spanid"
    ]
}))
app.use(express.json())
app.use((req, res, next) => {
    console.log(`Time Stamp: ${new Date()}\nURL: ${req.url}`)
    next()
})
const { createRouteHandler } = require('uploadthing/express')
const { uploadRouter } = require('./api/fileRouter.js')
app.use(
    '/api/uploadthing',
    createRouteHandler({
        router: uploadRouter,
        config: {
            token: process.env.UPLOADTHING_TOKEN
        }
    })
)

const httpServer = new http.createServer(app)
const wss = new WebSocketServer({ server: httpServer })

const usersRouter = require('./api/users.js')
const authRouter = require('./services/auth.js')
const chatroomsRouter = require('./api/chatrooms.js')
const chatroomRouter = require('./api/chatroom.js')
const { authenticate } = require('./middleware/authenticate.js')
const messagesRouter = require('./api/messages.js')(wss)

app.use('/auth', authRouter)
app.use('/chatrooms', chatroomsRouter)
app.use('/chatroom', chatroomRouter)
app.use('/messages', messagesRouter)
app.use('/users', usersRouter)

wss.on('connection', async (socket, req) => {
    const parsedUrl = new URL(req.url, 'http://localhost')
    const token = parsedUrl.searchParams.get('token')
    if (!token) return socket.close()
    socket.accessToken = token
    socket.currentRoom = null
    socket.chatrooms = new Set()

    try {
        const { authenticateWs } = require('./middleware/authenticate.js')
        authenticateWs(socket)

        const query = `SELECT chatroom_id FROM participant_tbl WHERE user_id = ? `
        const [chatrooms] = await pool.execute(query, [socket.id])
        socket.chatrooms = new Set(chatrooms.map(chatroom => chatroom.chatroom_id))
    } catch (e) {
        console.error(e)
        return socket.send(JSON.stringify({ type: 'error', message: 'Something went wrong' }))
    }

    websocketService.connectSocket(wss, socket)
    console.log('user connected')
})

httpServer.listen(port, (req, res) => {
    console.log('listening to port', port)
})
