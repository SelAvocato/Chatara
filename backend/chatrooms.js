const pool = require('./db')
const express = require('express')
const { authenticate } = require('./middleware/authenticate')
const router = express.Router()
const chatroomTbl = 'chatroom_tbl'
const participantTbl = 'participant_tbl'
const userTbl = 'user_tbl'

router.get('/', authenticate, async (req, res) => {
    const id = req.id
    if (!id) return res.status(400).json({ message: "Error: Missing Id" })
    try {
        const query = `SELECT c.id, c.name FROM ${chatroomTbl} c inner join ${participantTbl} p ON c.id = p.chatroom_id WHERE p.user_id = ? `
        const [chatrooms] = await pool.execute(query, [id])
        if (chatrooms.length === 0) return res.json({ message: "You have no chatrooms" })
        res.json({ chatrooms, status: 'ok' })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/create', authenticate, async (req, res) => {
    const { chatroomName, username, userId } = req.body
    if (!chatroomName || !username) return res.status(400).json({ message: "Chatroom and Participant name must not be empty" })
    try {
        const findUserQuery = `SELECT id FROM ${userTbl} WHERE username=? LIMIT 1`
        const [user] = await pool.execute(findUserQuery, [username])
        if (user.length === 0) return res.status(400).json({ message: "User doesn't exist" })
        const participantId = user[0].id
        if (participantId === userId) return res.status(400).json({ message: "You can't make a chatroom by yourself" })

        const chatroomQuery = `INSERT INTO ${chatroomTbl}(name) value (?)`
        const [newChatroom] = await pool.execute(chatroomQuery, [chatroomName])
        const chatroomId = newChatroom.insertId

        const participantQuery = `INSERT INTO ${participantTbl}(chatroom_id, user_id) values (?, ?),(?, ?)`
        await pool.execute(participantQuery, [chatroomId, participantId, chatroomId, userId])

        res.json({ message: "Chatroom successfully created", status: 'ok' })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ message: "Something went wrong" })
    }
})

module.exports = router