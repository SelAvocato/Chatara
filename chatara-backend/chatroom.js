const pool = require('./db')
const express = require('express')
const router = express.Router()
const { authenticate } = require('./middleware/authenticate')

router.get('/:id', authenticate, async (req, res) => {
    const chatroomId = req.params.id
    if (!chatroomId) return res.status(401).json({ message: 'Missing chatroom Id' })
    try {
        const chatroomQuery = 'SELECT id, name, theme FROM chatroom_tbl WHERE id = ?'
        const [chatroomRow] = await pool.execute(chatroomQuery, [chatroomId])
        const chatroom = chatroomRow[0]
        const memberQuery = 'SELECT u.id, u.username FROM user_tbl u INNER JOIN participant_tbl p ON u.id = p.user_id WHERE p.chatroom_id = ?'
        const [membersRow] = await pool.execute(memberQuery, [chatroomId])
        return res.status(200).json({ chatroom, members: membersRow })
    } catch (e) {
        console.error(e)
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

router.post('/leave/:chatroomId', authenticate, async (req, res) => {
    const chatroomId = req.params.chatroomId
    if (!chatroomId || typeof (chatroomId) !== 'string' || chatroomId.trim() === '') return res.status(400).json({ message: 'Missing or invalid chatroom Id' })
    const userId = req.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    try {
        const selectQuery = `SELECT u.username FROM user_tbl u INNER JOIN participant_tbl p ON u.id = p.user_id WHERE u.id = ? AND p.chatroom_id = ?`
        const [rows] = await pool.execute(selectQuery, [userId, chatroomId])
        if (rows.length === 0) return res.status(400).json({ message: `User is not a member of the chatroom` })
        const deleteQuery = `DELETE FROM participant_tbl WHERE user_id = ? AND chatroom_id = ?`
        await pool.execute(deleteQuery, [userId, chatroomId])
        res.status(200).json({ message: 'Left chatroom' })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Something went wrong' })
    }
})

router.put('/rename/:chatroomId', authenticate, async (req, res) => {
    const chatroomId = req.params.chatroomId
    if (!chatroomId || typeof (chatroomId) !== 'string' || chatroomId.trim() === '') return res.status(400).json({ message: 'Missing or invalid chatroom Id' })
    const { newChatroomName } = req.body
    if (!newChatroomName || typeof (newChatroomName) !== 'string' || newChatroomName.trim() === '') return res.status(400).json({ message: 'New chatroom name must not be empty' })
    const userId = req.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })
    try {
        const selectQuery = `SELECT u.username FROM user_tbl u INNER JOIN participant_tbl p ON u.id = p.user_id WHERE u.id = ? AND p.chatroom_id = ?`
        const [rows] = await pool.execute(selectQuery, [userId, chatroomId])
        if (rows.length === 0) return res.status(400).json({ message: `User is not a member of the chatroom` })
        const updateQuery = `UPDATE chatroom_tbl SET name = ? WHERE id = ?`
        const [updateResult] = await pool.execute(updateQuery, [newChatroomName, chatroomId])
        if (updateResult.affectedRows === 0) return res.status(404).json({ message: 'Chatroom not found' })
        res.status(200).json({ message: 'Changed chatroom name successfully' })
    } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router