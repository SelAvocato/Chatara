const { WebSocket } = require('ws')
const { authenticateWs } = require('../middleware/authenticate')

websocketService = {
    connectSocket: (wss, socket) => {
        socket.on('message', (data) => {
            try {
                authenticateWs(socket)
                const parsed = JSON.parse(data.toString())

                function broadcast(payload) {
                    for (const client of wss.clients) {
                        if (client.currentRoom === socket.currentRoom && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                            client.send(JSON.stringify(payload))
                        }
                    }
                    console.log('payloooaddd', payload)
                }

                switch (parsed.type) {
                    case 'join':
                        socket.currentRoom = parsed.chatroomId
                        socket.id = parsed.userId
                        console.log(socket.id, ' joined ', socket.currentRoom)
                        break
                    case 'typing':
                        broadcast({
                            type: 'typing',
                            username: parsed.username
                        })
                        break
                    case 'stoppedTyping':
                        broadcast({
                            type: 'stoppedTyping',
                            username: parsed.username
                        })
                        break
                    case 'editMessage':
                        for (const client of wss.clients) {
                            if (client.currentRoom === socket.currentRoom && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(parsed))
                            }
                        }
                        break
                    case 'deleteMessage':
                        for (const client of wss.clients) {
                            if (client.currentRoom === socket.currentRoom && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(parsed))
                            }
                        }
                        break
                    case 'delivered':
                        for (const client of wss.clients) {
                            if (client.currentRoom === parsed.chatroom_id && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(parsed))
                            }
                        }
                    case 'seen':
                        for (const client of wss.clients) {
                            if (client.currentRoom === parsed.chatroom_id && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify(parsed))
                            }
                        }
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
            if (client.readyState === WebSocket.OPEN && client.currentRoom === chatroomId) {
                client.send(JSON.stringify(payload))
            }

            if (client.readyState === WebSocket.OPEN && client.chatrooms.includes(chatroomId)) {
                const { type, ...payloadWithoutType } = payload
                const newPayload = { ...payloadWithoutType, type: 'notification' }
                client.send(JSON.stringify(newPayload))
                continue
            }
        }
    }

}

module.exports = websocketService