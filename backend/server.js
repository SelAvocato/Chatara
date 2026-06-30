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

app.use(cookieParser())
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));
app.use(express.json())
app.use((req, res, next) => {
    console.log(`Time Stamp: ${new Date()}\nURL: ${req.url}`)
    next()
})

const httpServer = new http.createServer(app)
const wss = new WebSocketServer({ server: httpServer })

const usersRouter = require('./users')
const authRouter = require('./services/auth.js')
const chatroomsRouter = require('./chatrooms')
const messagesRouter = require('./messages')(wss)

app.use('/users', usersRouter)
app.use('/auth', authRouter)
app.use('/chatrooms', chatroomsRouter)
app.use('/messages', messagesRouter)

wss.on('connection', (socket, req) => {
    const { query } = parse(req.url, true)
    const token = query.token
    socket.accessToken = token
    socket.currentRoom = null
    websocketService.connectSocket(wss, socket)
    console.log('user connected', token)
})

httpServer.listen(port, (req, res) => {
    console.log('listening to port', port)
})
