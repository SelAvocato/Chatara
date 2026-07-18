const pool = require('./db')
const express = require('express')
const { authenticate } = require('./middleware/authenticate')
const router = express.Router()

router.get('/', authenticate, async (req, res) => {
    const id = req.id
    if (!id) return res.status(400).json({ message: "Error: Missing Id" })
    const query = `SELECT c.id, c.name FROM chatroom_tbl c INNER JOIN participant_tbl p ON c.id = p.chatroom_id LEFT JOIN message_tbl m ON m.chatroom_id = c.id WHERE p.user_id = ? GROUP BY c.id, c.name ORDER BY COALESCE(MAX(m.sent_at), c.created_at) DESC`;
    try {
        const [chatrooms] = await pool.execute(query, [id])
        if (chatrooms.length === 0) return res.json({ message: "You have no chatrooms" })
        res.json({ chatrooms, status: 'ok' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/create', authenticate, async (req, res) => {
    const { chatroomName, username } = req.body
    if (!chatroomName || !username || username.length === 0) return res.status(400).json({ message: "Chatroom and Participant name must not be empty" })
    const userId = req.id
    if (!userId) return res.status(400).json({ message: 'Missing user Id' })
    try {
        let membersId = []
        for (let x = 0; x < username.length; x++) {
            const findUserQuery = `SELECT id FROM user_tbl WHERE username=? LIMIT 1`
            const [user] = await pool.execute(findUserQuery, [username[x]])
            if (user.length === 0) return res.status(400).json({ message: `User named '${username[x]}' doesn't exist` })
            const memberId = user[0].id
            if (memberId === req.id) return res.status(400).json({ message: `You don't need to include your name` })
            membersId.push(memberId)
        }

        const chatroomQuery = `INSERT INTO chatroom_tbl(name) value (?)`
        const [newChatroom] = await pool.execute(chatroomQuery, [chatroomName])
        const chatroomId = newChatroom.insertId

        const participantQuery = `INSERT INTO participant_tbl(chatroom_id, user_id) value (?, ?)`
        await pool.execute(participantQuery, [chatroomId, userId])

        membersId.forEach(async (memberId) => {
            await pool.execute(participantQuery, [chatroomId, memberId])
        })

        res.status(200).json({ message: "Chatroom successfully created", status: 'ok' })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: "Something went wrong" })
    }
})

module.exports = router