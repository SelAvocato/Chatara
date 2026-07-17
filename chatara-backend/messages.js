const express = require('express')
const router = express.Router()
const pool = require('./db.js')
const websocketService = require('./services/websocket.js')
const { authenticate } = require('./middleware/authenticate.js')

module.exports = function (wss) {
    router.get('/:id', authenticate, async (req, res) => {
        const id = req.params.id
        if (!id) return res.status(400).json({ message: 'Missing chatroom Id' })
        try {
            const query = `SELECT m.id AS message_id, m.chatroom_id, m.sender_id, m.message_text, m.sent_at, m.is_edited, m.is_deleted, m.message_status, u.id AS user_id, u.username AS sender_name FROM message_tbl m INNER JOIN user_tbl u on m.sender_id = u.id WHERE m.chatroom_id = ? ORDER BY m.id DESC LIMIT 15`
            const [row] = await pool.execute(query, [id])
            if (row.length === 0) return res.json({ status: 'empty', message: "Start chatting" })
            res.json({ row, status: 'ok' })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: "Something went wrong" })
        }
    })

    router.get('/received/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        if (!chatroomId) return res.status(400).json({ message: 'Missing chatroom Id' })

        const userId = req.id
        const query = `SELECT m.message_text, m.chatroom_id FROM message_tbl m INNER JOIN participant_tbl p ON m.chatroom_id = p.chatroom_id WHERE m.sender_id != ? AND p.user_id = ? AND m.chatroom_id = ? AND (m.message_status = 'sent' OR m.message_status = 'delivered')`
        try {
            const [messages] = await pool.execute(query, [userId, userId, chatroomId])
            if (messages.length === 0) return res.status(200).json({ messages: [] })
            res.status(200).json({ messages })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: 'Something went wrong' })
        }
    })

    router.get('/extra/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        const { message_id } = req.query
        if (!chatroomId || !message_id) return res.status(400).json({ message: 'Missing chatroom or message Id' })

        const query = `SELECT m.id AS message_id, m.chatroom_id, m.sender_id, m.message_text, m.sent_at, m.is_edited, m.is_deleted, m.message_status, u.id AS user_id, u.username AS sender_name FROM message_tbl m INNER JOIN user_tbl u on m.sender_id = u.id WHERE chatroom_id = ? AND m.id < ? ORDER BY message_id DESC LIMIT 15`
        try {
            const [messages] = await pool.execute(query, [chatroomId, message_id])
            res.status(200).json({ messages })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: "Something went wrong" })
        }
    })

    router.get('/latest/:id', authenticate, async (req, res) => {
        const id = req.params.id
        if (!id) return res.status(400).json({ message: 'Error: Id must be provided' })

        try {
            const query = `SELECT message_text from message_tbl WHERE chatroom_id = ? ORDER BY id DESC LIMIT 1`
            const [rows] = await pool.execute(query, [id])
            const row = rows[0]
            res.status(200).json({ status: 'ok', data: row })
        } catch (e) {
            res.status(500).json({ message: "Error: Something went wrong" })
            console.error(e)
        }
    })

    router.post('/send', authenticate, async (req, res) => {
        const { chatroomId, senderId, senderName, messageText } = req.body
        if (!chatroomId || !senderId || !senderName || !messageText) return res.status(400).json({ message: "Message must not be empty" })

        try {
            const query = `INSERT INTO message_tbl(chatroom_id, sender_id, message_text, message_status) value (?, ?, ?, 'sent')`
            const values = [chatroomId, senderId, messageText]
            const [row] = await pool.execute(query, values)

            const payload = {
                type: "chat",
                chatroom_id: chatroomId,
                sender_id: senderId,
                sender_name: senderName,
                message_text: messageText,
                message_id: row.insertId,
                message_status: 'sent',
                sent_at: new Date()
            }
            websocketService.broadcastPayload(wss, payload, chatroomId)

            res.json({ message: "Message successfully sent", status: "ok" })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: "Something went wrong" })
        }
    })

    router.put('/delivered/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        if (!chatroomId) return res.status(400).json({ message: 'Missing chatroom Id' })

        const userId = req.id
        const query = `UPDATE message_tbl SET message_status = 'delivered' WHERE chatroom_id = ? AND sender_id != ? AND message_status = 'sent'`
        try {
            await pool.execute(query, [chatroomId, userId])
            res.status(200).json({ status: 'ok' })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: 'Something went wrong' })
        }
    })

    router.put('/seen/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        const { message_id } = req.query

        if (!chatroomId || !message_id) return res.status(400).json({ message: 'Missing chatroom or message Id' })
        const query = `UPDATE message_tbl SET message_status = 'seen' WHERE chatroom_id = ? AND id = ? AND message_status = 'delivered'`
        try {
            await pool.execute(query, [chatroomId, message_id])
        } catch (e) {
            console.error(e)
        }
    })

    router.put('/edit', authenticate, async (req, res) => {
        const { message_id, message_text } = req.body

        const selectQuery = `SELECT sender_id FROM message_tbl WHERE id = ?`
        try {
            const [rows] = await pool.execute(selectQuery, [message_id])
            if (rows.length === 0) return res.status(404).json({ message: 'Message not found' })
            if (rows[0].sender_id !== req.id) return res.status(401).json({ message: 'Unauthorize to edit the message' })

            const query = `UPDATE message_tbl SET message_text = ?, is_edited = 1 WHERE id = ?`
            await pool.execute(query, [message_text, message_id])
            res.status(200).json({ message: 'Updated successfully' })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: 'Something went wrong' })
        }
    })

    router.delete('/delete/:id', authenticate, async (req, res) => {
        const messageId = req.params.id
        if (!messageId) return res.status(400).json({ message: 'Missing message id' })

        const selectQuery = `SELECT sender_id FROM message_tbl WHERE id = ?`
        try {
            const [rows] = await pool.execute(selectQuery, [messageId])
            if (rows.length === 0) return res.status(404).json({ message: 'Message not found' })
            if (rows[0].sender_id !== req.id) return res.status(401).json({ message: 'Unauthorize to delete the message' })

            const query = `UPDATE message_tbl SET is_deleted = 1, message_text = 'Message deleted' WHERE id = ?`
            const [result] = await pool.execute(query, [messageId])

            if (result.affectedRows === 0) return res.status(404).json({ message: 'Message not found' })

            res.status(200).json({ message: 'Message has been successfully deleted' })
        } catch (e) {
            console.error(e)
            res.status(500).json({ message: 'Something went wrong' })
        }
    })

    return router
}