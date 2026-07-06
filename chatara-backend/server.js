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
const originUrl = process.env.ORIGIN_URL

app.use(cookieParser())
app.use(cors({
    origin: originUrl,
    credentials: true
}));
app.use(express.json())
app.use((req, res, next) => {
    console.log(`Time Stamp: ${new Date()}\nURL: ${req.url}`)
    next()
})

const httpServer = new http.createServer(app)
const wss = new WebSocketServer({ server: httpServer })

const authRouter = require('./services/auth.js')
const chatroomsRouter = require('./chatrooms.js')
const chatroomRouter = require('./chatroom.js')
const {authenticate} = require('./middleware/authenticate.js')
const messagesRouter = require('./messages.js')(wss)

app.use('/auth', authRouter)
app.use('/chatrooms', chatroomsRouter)
app.use('/chatroom', chatroomRouter)
app.use('/messages', messagesRouter)

wss.on('connection', (socket, req) => {
    const { query } = parse(req.url, true)
    const token = query.token
    if (!token) return socket.close()
    socket.accessToken = token
    socket.currentRoom = null
    websocketService.connectSocket(wss, socket)
    console.log('user connected')
})

httpServer.listen(port, (req, res) => {
    console.log('listening to port', port)
})
