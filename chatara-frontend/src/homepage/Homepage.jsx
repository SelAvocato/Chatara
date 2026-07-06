import { useState, useEffect } from "react"

export default function Homepage() {
    const [chatrooms, setChatrooms] = useState([])
    useEffect(() => {
        async function fetchChatrooms() {
            const response = await fetch(`http://localhost:3000/messages`)
            const data = await response.json()
            setChatrooms(data)
        }
        fetchChatrooms()
    }, [])

    return (
        <div>
            <div>
                <p>Messages</p>
            </div>
            <div className="sidebar">
                {
                    chatrooms.map(chatroom =>
                        <div key={chatroom.id}>
                            <p>{chatroom.name}</p>
                        </div>
                    )
                }
            </div>
        </div>
    )
}