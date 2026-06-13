const { WebSocket } = require('ws')

websocketService = {
    connectSocket: (wss, socket) => {
        socket.on('message', (data) => {
            try {
                const parsed = JSON.parse(data.toString())

                console.log(parsed)
                switch (parsed.type) {
                    case 'join':
                        socket.currentRoom = parsed.chatroomId
                        socket.id = parsed.userId
                        console.log(socket.id, ' joined ', socket.currentRoom)
                        break
                    case 'typing':
                        console.log(parsed.username, ' is typing')
                        for (const client of wss.clients) {
                            if (client.currentRoom === socket.currentRoom && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'typing', username: parsed.username }))
                            }
                        }
                        break;
                    case 'stoppedTyping':
                        for (const client of wss.clients) {
                            if (client.currentRoom === socket.currentRoom && client.id !== socket.id && client.readyState === WebSocket.OPEN) {
                                client.send(JSON.stringify({ type: 'stoppedTyping', username: parsed.username }))
                            }
                        }
                        break
                }
            } catch (e) {
                return socket.send(JSON.stringify({ type: 'error', message: 'Error: invalid format' }))
            }
        })

        socket.on('close', () => {
            console.log('user disconnected')
        })
    },

    broadcastPayload: (wss, payload, chatroomId) => {
        for (const client of wss.clients) {
            if (client.readyState === WebSocket.OPEN && client.currentRoom === chatroomId) {
                client.send(JSON.stringify(payload))
                continue
            }
        }
    }

}

module.exports = websocketService