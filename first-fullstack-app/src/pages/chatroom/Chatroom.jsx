import { useState, useEffect, useRef } from "react"
import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import ChatMessageActions from './ChatMessageActions/ChatMessageActions'
import style from "./Chatroom.module.css"

export default function Chatroom() {
    const lastMessageRef = useRef(null)
    const ws = useRef(null)
    const userRef = useRef(null)
    const [message, setMessage] = useState('')
    const [startChat, setStartChat] = useState('')
    const [chatrooms, setChatrooms] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [currentChatroomId, setCurrentChatroomId] = useState(null)
    const [hasOpenChat, setHasOpenChat] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [userTyping, setUserTyping] = useState(null)
    const { user } = useAuth()
    const { main, chatroomsList, chatRoomStyle, chatMessagesStyle, chat, chatBubble, sent, received, chatParent } = style

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
    }, [chatMessages, isTyping])


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
            <div className={chatParent}>
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
                </div>
                <div>
                    {
                        hasOpenChat ?
                            <ChatMessageActions currentChatroomId={currentChatroomId}
                                ws={ws}
                                userRef={userRef} /> :
                            null
                    }

                </div>

            </div>
        </div >
    )
}