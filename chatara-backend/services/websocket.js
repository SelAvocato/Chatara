const { WebSocket } = require('ws')
const { authenticateWs } = require('../middleware/authenticate')

websocketService = {
    connectSocket: (wss, socket) => {
        socket.on('message', (data) => {
            try {
                authenticateWs(socket)
                const parsed = JSON.parse(data.toString())
                const { username, pfp_url } = parsed

                function broadcastTypingIndicator(payload) {
                    for (const client of wss.clients) {
                        if (client.currentRoom === socket.currentRoom && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(payload))
                        }
                    }
                }

                function broadcastMessageStatus() {
                    for (const client of wss.clients) {
                        if (client.currentRoom === parsed.chatroom_id && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(parsed))
                        }
                    }
                }

                function broadcastChatroomInfo() {
                    for (const client of wss.clients) {
                        if (client.chatrooms.has(parsed.id) && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(parsed))
                        }
                    }
                }

                function broadcastMessageActions() {
                    for (const client of wss.clients) {
                        if (client.currentRoom === socket.currentRoom && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(parsed))
                        }
                    }
                }

                switch (parsed.type) {
                    case 'join':
                        socket.currentRoom = parsed.chatroomId
                        socket.id = parsed.userId
                        break
                    case 'typing':
                        broadcastTypingIndicator({
                            type: 'typing',
                            username,
                            pfp_url
                        })
                        break
                    case 'stoppedTyping':
                        broadcastTypingIndicator({
                            type: 'stoppedTyping',
                            username: parsed.username
                        })
                        break
                    case 'editMessage':
                        broadcastMessageActions()
                        break
                    case 'deleteMessage':
                        broadcastMessageActions()
                        break
                    case 'delivered':
                        broadcastMessageStatus()
                        break
                    case 'seen':
                        broadcastMessageStatus()
                        break
                    case 'createChatroom':
                        for (const client of wss.clients) {
                            if (client.readyState === WebSocket.OPEN && (parsed.username.includes(client.username) || socket.id === client.id)) {
                                client.chatrooms.add(parsed.id)
                                client.send(JSON.stringify(parsed))
                            }
                        }
                        break
                    case 'changeChatroomImage':
                        broadcastChatroomInfo()
                        break
                    case 'renameChatroom':
                        broadcastChatroomInfo()
                        break
                    default:
                        break
                }
            } catch (e) {
                return socket.send(JSON.stringify({ type: 'error', message: 'Error: invalid format' }))
            }
        })

        socket.on('close', () => {
            console.log('user disconnected')
        })

        socket.on('error', (e) => {
            console.log('Error for user Id ', socket?.id, ' : ', e)
        })
    },

    broadcastPayload: (wss, payload, chatroomId) => {
        for (const client of wss.clients) {
            if (client.currentRoom === chatroomId && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(payload))
                continue
            }

            if (client.readyState === WebSocket.OPEN && client.chatrooms.has(chatroomId)) {
                const { type, ...payloadWithoutType } = payload
                const newPayload = { ...payloadWithoutType, type: 'notification' }
                client.send(JSON.stringify(newPayload))
                continue
            }
        }
    }

}

module.exports = websocketService