const pool = require('./db')
const express = require('express')
const { authenticate } = require('./middleware/authenticate')
const router = express.Router()
const { catchRouterError } = require('./utils/handleError')

router.get('/', authenticate, async (req, res) => {
    const id = req.id
    if (!id) return res.status(400).json({ message: "Error: Missing Id" })

    const { timestamp } = req.query

    const baseQuery = `
        SELECT c.id, c.name, c.chatroom_img_url, c.created_at, activity.last_activity as sent_at
        FROM chatroom_tbl c
        INNER JOIN participant_tbl p ON c.id = p.chatroom_id
        INNER JOIN (
            SELECT c2.id as chatroom_id, COALESCE(MAX(m.sent_at), c2.created_at) as last_activity
            FROM chatroom_tbl c2
            LEFT JOIN message_tbl m ON m.chatroom_id = c2.id
            GROUP BY c2.id
        ) activity ON activity.chatroom_id = c.id
        WHERE p.user_id = ?
        ${timestamp ? 'AND activity.last_activity < ?' : ''}
        ORDER BY activity.last_activity DESC
        LIMIT 8
    `;

    const params = timestamp ? [id, timestamp] : [id];

    try {
        const [chatrooms] = await pool.execute(baseQuery, params)
        if (chatrooms.length === 0) return res.status(200).json({ chatrooms: [], message: "You have no chatrooms" })
        res.status(200).json({ chatrooms, status: 'ok' })
    } catch (e) {
        catchRouterError(e, res)
    }
})

router.post('/create', authenticate, async (req, res) => {
    const { chatroomName, username, newChatroomImage } = req.body
    if (!chatroomName || !username || username.length === 0) return res.status(400).json({ message: "Chatroom and Participant names must not be empty" })
    const userId = req.id
    if (!userId) return res.status(400).json({ message: 'Missing user Id' })
    try {
        const usernamePlaceholder = username.map(() => '?').join(',')
        const findUsersQuery = `SELECT id, username FROM user_tbl WHERE username IN (${usernamePlaceholder})`
        const [users] = await pool.execute(findUsersQuery, username)
        if (users.length !== username.length) {
            const foundUsers = users.map(user => user.username)
            const missingUser = username.find(name => !foundUsers.includes(name))
            return res.status(400).json({ message: `User named '${missingUser}' doesn't exist` })
        }
        let membersId = []
        for (const user of users) {
            if (user.id === userId) {
                return res.status(400).json({ message: `You don't need to include your name` })
            }
            membersId.push(user.id)
        }
        membersId.push(userId)
        const chatroomQuery = `INSERT INTO chatroom_tbl(name, creator_id, chatroom_img_url) value (?, ?, ?)`
        const [newChatroom] = await pool.execute(chatroomQuery, [chatroomName, userId, newChatroomImage])
        const chatroomId = newChatroom.insertId

        const participantPlaceholder = membersId.map(() => '(?, ?)').join(',')
        const insertParticipantValues = []
        for (const memberId of membersId) {
            insertParticipantValues.push(chatroomId)
            insertParticipantValues.push(memberId)
        }
        const participantQuery = `INSERT INTO participant_tbl(chatroom_id, user_id) VALUES ${participantPlaceholder}`
        await pool.execute(participantQuery, insertParticipantValues)

        res.status(200).json({ chatroomId, message: "Chatroom successfully created", status: 'ok' })
    } catch (e) {
        catchRouterError(e, res)
    }
})

module.exports = router