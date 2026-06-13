import { useState, useEffect, useRef } from "react"
import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import style from "./Chatroom.module.css"

export default function Chatroom() {
    const lastMessageRef = useRef(null)
    const ws = useRef(null)
    const userRef = useRef(null)
    const [message, setMessage] = useState('')
    const [startChat, setStartChat] = useState('')
    const [messageInput, setMessageInput] = useState('')
    const [chatrooms, setChatrooms] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [currentChatroomId, setCurrentChatroomId] = useState(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [hasOpenChat, setHasOpenChat] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [userTyping, setUserTyping] = useState(null)
    const { user } = useAuth()
    const { main, chatroomsList, chatRoomStyle, chatMessagesStyle, chat, chatBubble, sent, received, actionStyle } = style

    useEffect(() => {
        userRef.current = user.username
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
    }, [user])


    useEffect(() => {
        ws.current = new WebSocket('ws://localhost:3000')

        ws.current.onopen = () => {
            console.log('connected')
        }

        ws.current.onmessage = (event) => {
            const parsed = JSON.parse(event.data)

            switch (parsed.type) {
                case 'chat':
                    setChatMessages(prev => [...prev, parsed])
                    console.log(parsed)
                    break
                case 'typing':
                    setUserTyping(parsed.username)
                    setIsTyping(true)
                    console.log('is typing')
                    break
                case 'stoppedTyping':
                    setUserTyping(null)
                    setIsTyping(false)
                    console.log('stopped typing')
                    break
            }

        }

        return () => ws.current.close()

    }, [])

    function focusEndChat() {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        focusEndChat()
    }, [chatMessages])

    useEffect(() => {
        if (!messageInput) return

        console.log(messageInput)
        ws.current?.send(JSON.stringify({ type: 'typing', username: userRef.current }))

        setTimeout(() => {
            ws.current?.send(JSON.stringify({ type: 'stoppedTyping', username: userRef.current }))
        }, 3000)

    }, [messageInput])

    async function onOpenChat(chatroomId) {
        setHasOpenChat(true)
        setCurrentChatroomId(chatroomId)
        try {
            const res = await apiClient.get(`/messages/${chatroomId}`)
            if (res.status !== 'ok') return setStartChat(res.message)
            ws.current.send(JSON.stringify({
                type: "join",
                chatroomId: chatroomId,
                userId: user.id
            }))
            return setChatMessages(res.row)
        } catch (e) {
            console.error(e)
            setStartChat('Something went wrong')
        }
    }

    async function handleMessageSubmit(e) {
        e.preventDefault()

        const data = {
            type: 'chat',
            chatroomId: currentChatroomId,
            senderId: user.id,
            messageText: messageInput
        }

        try {
            const res = await apiClient.post('/messages/send', (data))
            if (res.status !== 'ok') return setErrorMessage(res.message)
            setErrorMessage(null)
            setMessageInput('')
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
                    isTyping ? <p>{userTyping} is typing</p> : null
                }
                <div ref={lastMessageRef} />
                {
                    hasOpenChat ?
                        <form className={actionStyle} onSubmit={handleMessageSubmit}>
                            <div>
                                <input onChange={(e) => setMessageInput(e.target.value)} value={messageInput} type="text" placeholder="Message" />
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