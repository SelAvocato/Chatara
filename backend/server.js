const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

const usersRouter = require('./users')
const loginRouter = require('./login')
const signupRouter = require('./signup')
const chatroomsRouter = require('./chatrooms')
const messagesRouter = require('./messages')

app.use(cors({
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true // Add this if you are using cookies/sessions
}));

app.use(express.json())

app.use((req, res, next) => {
    console.log(`Time Stamp: ${new Date()}\nURL: ${req.url}`)
    next()
})

app.use('/login', loginRouter)
app.use('/users', usersRouter)
app.use('/signup', signupRouter)
app.use('/chatrooms', chatroomsRouter)
app.use('/messages', messagesRouter)

app.listen(port, (req, res) => {
    console.log('listening to port', port)
})
