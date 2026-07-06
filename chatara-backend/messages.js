const express = require('express')
const router = express.Router()
const pool = require('./db.js')
const websocketService = require('./services/websocket.js')
const {authenticate} = require('./middleware/authenticate.js')

const messageTbl = 'message_tbl'
const userTbl = 'user_tbl'

module.exports = function (wss) {
    router.get('/:id', authenticate, async (req, res) => {
        const id = req.params.id

        try {
            const query = `SELECT m.id AS message_id, m.chatroom_id, m.sender_id, m.message_text, m.sent_at, u.id AS user_id, u.username AS sender_name FROM ${messageTbl} m INNER JOIN ${userTbl} u on m.sender_id = u.id WHERE chatroom_id = ? ORDER BY message_id ASC`
            const [row] = await pool.execute(query, [id])
            if (row.length === 0) return res.json({ status: 'empty', message: "Start chatting" })
            res.json({ row, status: 'ok' })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: "Something went wrong" })
        }
    })

    router.get('/latest/:id', authenticate, async (req, res) => {
        const id = req.params.id
        if (!id) return res.status(400).json({ message: 'Error: Id must be provided' })

        try {
            const query = `SELECT message_text from ${messageTbl} WHERE chatroom_id = ? ORDER BY id DESC LIMIT 1`
            const [rows] = await pool.execute(query, [id])
            const row = rows[0]
            return res.status(200).json({ status: 'ok', data: row })
        } catch (e) {
            res.json({ message: "Error: Something went wrong" })
            console.log(e)
        }
    })

    router.post('/send', authenticate, async (req, res) => {
        const { chatroomId, senderId, senderName, messageText } = req.body
        if (!chatroomId || !senderId || !senderName || !messageText) return res.status(400).json({ message: "Message must not be empty" })

        try {
            const query = `INSERT INTO ${messageTbl}(chatroom_id, sender_id, message_text) value (?, ?, ?)`
            const values = [chatroomId, senderId, messageText]
            const [row] = await pool.execute(query, values)

            const payload = {
                type: "chat",
                chatroom_id: chatroomId,
                sender_id: senderId,
                sender_name: senderName,
                message_text: messageText,
                message_id: row.insertId,
                sent_at: new Date()
            }
            websocketService.broadcastPayload(wss, payload, chatroomId)
            
            return res.json({ message: "Message successfully sent", status: "ok" })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: "Something went wrong" })
        }
    })
    return router
}