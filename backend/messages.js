const express = require('express')
const router = express.Router()
const pool = require('./db')
const { WebSocket } = require('ws')
const websocketService = require('./services/websocket.js')

const messageTbl = 'message_tbl'
const userTbl = 'user_tbl'

module.exports = function (wss) {
    router.get('/:id', async (req, res) => {
        const id = req.params.id

        try {
            const query = `SELECT m.id AS message_id, m.chatroom_id, m.sender_id, m.message_text, m.sent_at, u.id AS user_id, u.username AS sender_name FROM ${messageTbl} m INNER JOIN ${userTbl} u on m.sender_id = u.id WHERE chatroom_id = ?`
            const [row] = await pool.query(query, [id])
            if (row.length < 1) return res.json({ status: 'empty', message: "Start chatting" })
            return res.json({ row: row, status: 'ok' })
        } catch (e) {
            console.error(e)
            return res.status(500).json({ message: "Something went wrong" })
        }
    })

    router.post('/send', async (req, res) => {
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
                id: row.insertId,
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