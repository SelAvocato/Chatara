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
        console.log(e)
        return res.status(500).json({ message: 'Something went wrong' })
    }
})

module.exports = router