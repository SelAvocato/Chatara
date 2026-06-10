import { useState, useEffect } from "react"
import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import style from "./Chatroom.module.css"

export default function Chatroom() {
    const [message, setMessage] = useState('')
    const [startChat, setStartChat] = useState('')
    const [chatrooms, setChatrooms] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [currentChatroomId, setCurrentChatroomId] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [hasOpenChat, setHasOpenChat] = useState(false)
    const { user } = useAuth()
    const { main, chatroomsList, chatRoomStyle, chatMessagesStyle, chat, chatBubble, sent, received, actionStyle } = style
    useEffect(() => {
        async function getChatrooms() {
            try {
                const res = await apiClient.get(`/chatrooms/${user.id}`)
                if (res.status !== 'ok') {
                    setMessage(res.message)
                }
                setChatrooms(res.chatrooms)

            } catch (e) {
                console.error(e)
                setMessage(e)
            }
        }

        getChatrooms()
    }, [user.id])


    async function onOpenChat(chatroomId) {
        setHasOpenChat(true)
        setCurrentChatroomId(chatroomId)
        try {
            const res = await apiClient.get(`/messages/${chatroomId}`)
            if (res.status !== 'ok') return setStartChat(res.message)
            return setChatMessages(res.row)
        } catch (e) {
            console.error(e)
            setStartChat('Something went wrong')
        }
    }

    async function handleMessageSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const entries = Object.fromEntries(formData.entries())
        const data = {
            chatroomId: currentChatroomId,
            senderId: user.id,
            messageText: entries.message
        }

        try {
            const res = await apiClient.post('/messages/send', (data))
            if (res.status !== 'ok') return setErrorMessage(res.message)
            setErrorMessage(null)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className={main}>
            <div className={chatroomsList}>
                {
                    chatrooms
                        ? chatrooms.map((chatroom) =>
                            <div className={chatRoomStyle} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
                                <p>{chatroom.name}</p>
                            </div>
                        )
                        : message
                }
            </div>
            <div className={chat}>
                <div className={chatMessagesStyle}>
                    {
                        chatMessages.length > 0
                            ? chatMessages.map(chatMessage =>
                                <div className={`${chatBubble} ${chatMessage.sender_id === user.id ? sent : received}`} key={chatMessage.id} >
                                    <p>{chatMessage.message_text}</p>
                                </div>
                            )
                            : <p style={{ fontSize: "50px", textAlign: "center" }}>{startChat}</p>
                    }
                </div>
                {
                    hasOpenChat ?
                        <form className={actionStyle} onSubmit={handleMessageSubmit}>
                            <div>
                                <input name="message" type="text" placeholder="Message" />
                                <input type="submit" value={`Submit`} />
                            </div>
                        </form> :
                        null
                }
                {
                    errorMessage ? errorMessage : null
                }
            </div>
        </div >
    )
}