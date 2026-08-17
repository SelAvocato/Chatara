const express = require('express')
const router = express.Router()
const pool = require('../db.js')
const websocketService = require('../services/websocket.js')
const { authenticate } = require('../middleware/authenticate.js')
const { catchRouterError } = require('../utils/handleError.js')

module.exports = function (wss) {
    router.get('/:id', authenticate, async (req, res) => {
        const id = req.params.id
        if (!id) return res.status(400).json({ message: 'Missing message id' })

        try {
            const findMemberQuery = 'SELECT username FROM user_tbl WHERE id = ?'
            const [members] = await pool.execute(findMemberQuery, [req.id])
            if (members.length === 0) return res.status(404).json({ message: 'User not found' })

            const getMessageQuery = 'SELECT m.message_text, u.username FROM message_tbl m INNER JOIN user_tbl u ON m.sender_id = u.id WHERE m.id = ?'
            const [messages] = await pool.execute(getMessageQuery, [id])
            if (messages.length === 0) return res.status(404).json({ message: 'Message not found' })
            res.status(200).json({ chatMessage: messages[0] })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.get('/chatroom/:chatroomId', authenticate, async (req, res) => {
        const chatroomId = req.params.chatroomId
        if (!chatroomId) return res.status(400).json({ message: 'Missing chatroom Id' })
        try {
            const findMember = 'SELECT u.id FROM user_tbl u INNER JOIN participant_tbl p ON u.id = p.user_id WHERE u.id = ? AND p.chatroom_id = ?'
            const [users] = await pool.execute(findMember, [req.id, chatroomId])
            if (users.length === 0) return res.status(403).json({ status: 'forbidden', message: 'You are not a member of this chatroom' })
            const query = `SELECT m.id AS message_id, m.chatroom_id, m.sender_id, m.message_text, m.sent_at, m.is_edited, m.is_deleted, 
            m.replied_message_id, m.message_status, u.id AS user_id, u.username AS sender_name, u.pfp_url, rm.message_text AS replied_message_text, 
            ru.username AS replied_sender_name FROM message_tbl m INNER JOIN user_tbl u ON m.sender_id = u.id LEFT JOIN message_tbl rm 
            ON m.replied_message_id = rm.id LEFT JOIN user_tbl ru ON rm.sender_id = ru.id WHERE m.chatroom_id = ? ORDER BY m.id DESC LIMIT 15`
            const [rows] = await pool.execute(query, [chatroomId])
            if (rows.length === 0) return res.json({ status: 'empty', message: "Start chatting" })

            res.json({ rows, status: 'ok' })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.get('/received/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        if (!chatroomId) return res.status(400).json({ message: 'Missing chatroom Id' })

        const userId = req.id
        const query = `SELECT m.message_text, m.id AS message_id, m.chatroom_id, u.username AS sender_name FROM message_tbl m INNER JOIN participant_tbl p 
        ON m.chatroom_id = p.chatroom_id INNER JOIN user_tbl u ON u.id = m.sender_id WHERE m.sender_id != ? AND p.user_id = ? AND m.chatroom_id = ? AND (m.message_status = 'sent' 
        OR m.message_status = 'delivered') `
        try {
            const [messages] = await pool.execute(query, [userId, userId, chatroomId])
            if (messages.length === 0) return res.status(200).json({ messages: [] })
            res.status(200).json({ messages })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.get('/extra/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        const { message_id } = req.query
        if (!chatroomId || !message_id) return res.status(400).json({ message: 'Missing chatroom or message Id' })

        const query = `SELECT m.id AS message_id, m.chatroom_id, m.sender_id, m.message_text, m.sent_at, m.is_edited, m.is_deleted, 
            m.replied_message_id, m.message_status, u.id AS user_id, u.username AS sender_name, u.pfp_url, rm.message_text AS replied_message_text, 
            ru.username AS replied_sender_name FROM message_tbl m INNER JOIN user_tbl u ON m.sender_id = u.id LEFT JOIN message_tbl rm 
            ON m.replied_message_id = rm.id LEFT JOIN user_tbl ru ON rm.sender_id = ru.id WHERE m.chatroom_id = ? AND m.id < ? ORDER BY message_id DESC LIMIT 15`
        try {
            const [messages] = await pool.execute(query, [chatroomId, message_id])
            res.status(200).json({ messages })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.get('/latest/:id', authenticate, async (req, res) => {
        const id = req.params.id
        if (!id) return res.status(400).json({ message: 'Error: Id must be provided' })

        try {
            const query = `SELECT m.message_text, u.username AS sender_name FROM message_tbl m INNER JOIN user_tbl u ON m.sender_id = u.id WHERE m.chatroom_id = ? ORDER BY m.id DESC LIMIT 1`
            const [rows] = await pool.execute(query, [id])
            const row = rows[0]
            res.status(200).json({ status: 'ok', data: row })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.post('/send', authenticate, async (req, res) => {
        const { chatroomId, messageText, repliedMessageId, repliedMessageText, repliedSenderName } = req.body
        const senderId = req.id
        if (!chatroomId || !senderId || !messageText || messageText.trim() === '') return res.status(400).json({ message: "Message must not be empty" })

        try {
            const findMemberQuery = `SELECT u.username, u.pfp_url FROM participant_tbl p INNER JOIN user_tbl u ON u.id = p.user_id WHERE p.user_id = ? AND p.chatroom_id = ? LIMIT 1`
            const [memberRows] = await pool.execute(findMemberQuery, [senderId, chatroomId])
            if (memberRows.length === 0) return res.status(403).json({ message: 'You are not a participant of this chatroom' })
            const { username, pfp_url } = memberRows[0]

            const insertQuery = `INSERT INTO message_tbl(chatroom_id, sender_id, message_text, replied_message_id, message_status) value (?, ?, ?, ?, 'sent')`
            const values = [chatroomId, senderId, messageText, repliedMessageId || null]
            const [result] = await pool.execute(insertQuery, values)

            const payload = {
                type: "chat",
                chatroom_id: chatroomId,
                sender_id: senderId,
                sender_name: username,
                message_text: messageText,
                message_id: result.insertId,
                replied_message_id: repliedMessageId || null,
                replied_message_text: repliedMessageText || null,
                replied_sender_name: repliedSenderName || null,
                message_status: 'sent',
                sent_at: new Date(),
                pfp_url
            }
            websocketService.broadcastPayload(wss, payload, chatroomId)

            res.json({ message: "Message successfully sent", status: "ok" })
        } catch (e) {
            catchRouterError(e, res)
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
            catchRouterError(e, res)
        }
    })

    router.put('/seen/:id', authenticate, async (req, res) => {
        const chatroomId = req.params.id
        const { message_id } = req.query

        if (!chatroomId || !message_id) return res.status(400).json({ message: 'Missing chatroom or message Id' })
        const query = `UPDATE message_tbl SET message_status = 'seen' WHERE chatroom_id = ? AND id = ? AND (message_status = 'delivered' OR message_status = 'sent')`
        try {
            await pool.execute(query, [chatroomId, message_id])
            res.status(200).json({ status: 'ok' })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.put('/edit', authenticate, async (req, res) => {
        const { message_id, message_text } = req.body

        const selectQuery = `SELECT sender_id FROM message_tbl WHERE id = ?`
        try {
            const [rows] = await pool.execute(selectQuery, [message_id])
            if (rows.length === 0) return res.status(404).json({ message: 'Message not found' })
            if (rows[0].sender_id !== req.id) return res.status(403).json({ message: `You can't edit this message` })

            const query = `UPDATE message_tbl SET message_text = ?, is_edited = 1 WHERE id = ?`
            await pool.execute(query, [message_text, message_id])
            res.status(200).json({ message: 'Updated successfully' })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    router.delete('/delete/:id', authenticate, async (req, res) => {
        const messageId = req.params.id
        if (!messageId) return res.status(400).json({ message: 'Missing message id' })

        const selectQuery = `SELECT sender_id FROM message_tbl WHERE id = ?`
        try {
            const [rows] = await pool.execute(selectQuery, [messageId])
            if (rows.length === 0) return res.status(404).json({ message: 'Message not found' })
            if (rows[0].sender_id !== req.id) return res.status(403).json({ message: `You can't delete this message` })

            const query = `UPDATE message_tbl SET is_deleted = 1, message_text = 'Message deleted' WHERE id = ?`
            const [result] = await pool.execute(query, [messageId])

            if (result.affectedRows === 0) return res.status(404).json({ message: 'Message not found' })

            res.status(200).json({ message: 'Message has been successfully deleted' })
        } catch (e) {
            catchRouterError(e, res)
        }
    })

    return router
}