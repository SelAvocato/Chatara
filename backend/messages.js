const express = require('express')
const router = express.Router()
const pool = require('./db')
const messageTbl = 'message_tbl'

router.get('/:id', async (req, res) => {
    const id = req.params.id

    try {
        const query = `SELECT * FROM ${messageTbl} WHERE chatroom_id = ?`
        const [row] = await pool.query(query, [id])
        if (row.length < 1) return res.json({ message: "Start chatting" })
        console.log(row)
        return res.json({ row: row, status: 'ok' })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Something went wrong" })
    }
})

router.post('/send', async (req, res) => {
    const { chatroomId, senderId, messageText } = req.body
    console.log(chatroomId, senderId, messageText)
    if (!chatroomId || !senderId || !messageText) return res.status(400).json({ message: "Message must not be empty" })

    try {
        const query = `INSERT INTO ${messageTbl}(chatroom_id, sender_id, message_text) value (?, ?, ?)`
        const values = [chatroomId, senderId, messageText]
        await pool.execute(query, values)
        return res.json({ message: "Message successfully sent", status: "ok" })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: "Something went wrong" })
    }
})


module.exports = router