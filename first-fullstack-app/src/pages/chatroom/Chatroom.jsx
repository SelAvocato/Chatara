import { useState, useEffect, useRef } from "react"
import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import ChatMessageActions from './ChatMessageActions/ChatMessageActions'
import style from "./Chatroom.module.css"
import addCircle from '/icons/add_circle.svg'
import pfp from '/icons/pfp.svg'

export default function Chatroom() {
    const lastMessageRef = useRef(null)
    const ws = useRef(null)
    const userRef = useRef(null)
    const [message, setMessage] = useState('')
    const [startChat, setStartChat] = useState('')
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [chatrooms, setChatrooms] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [currentChatroomId, setCurrentChatroomId] = useState(null)
    const [hasOpenChat, setHasOpenChat] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [userTyping, setUserTyping] = useState(null)
    const { user } = useAuth()
    const { main, chatroomsStyle, chatroomsListStyle, chatroomsHeaderStyle, chatroomNameStyle, chatroomLatestMessageStyle, formContainer, closeBtnStyle, chatRoomStyle, chatMessagesStyle, chat, chatBubble, sent, received, chatParent } = style

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
            console.log('parsed data: ', parsed)

            switch (parsed.type) {
                case 'chat':
                    setChatMessages(prev => [...prev, parsed])
                    console.log('parsed chats', parsed)
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

    useEffect(() => {
        console.log(chatMessages)
    }, [chatMessages])

    function focusEndChat() {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        focusEndChat()
    }, [chatMessages, isTyping])


    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const entries = Object.fromEntries(formData.entries())
        const data = {
            chatroomName: entries.chatroomName,
            username: entries.username,
            userId: user.id
        }

        try {
            const res = await apiClient.post('/chatrooms/create', data)
            if (res.status !== 'ok') return setErrorMessage(res.message)
            setIsCreatingChatroom(false)
        } catch (e) {
            console.error(e)
            return setErrorMessage('Something went wrong')
        }

    }
    async function onOpenChat(chatroomId) {
        console.log('function run')
        setHasOpenChat(true)
        setCurrentChatroomId(chatroomId)
        try {
            console.log('function run')
            const res = await apiClient.get(`/messages/${chatroomId}`)
            ws.current.send(JSON.stringify({
                type: "join",
                chatroomId: chatroomId,
                userId: user.id
            }))
            console.log('sent join ws')
            if (res.status !== 'ok') return setStartChat(res.message)
            return setChatMessages(res.row)
        } catch (e) {
            console.error(e)
            setStartChat('Something went wrong')
        }
    }

    return (
        <div className={main}>
            <div className={chatroomsStyle}>
                <div className={chatroomsHeaderStyle}>
                    <h2>Chatrooms</h2>
                    <img onClick={() => setIsCreatingChatroom(true)} src={addCircle} alt="Add Circle" />
                </div>
                <div className={chatroomsListStyle}>
                    {
                        chatrooms
                            ? chatrooms.map((chatroom) =>
                                <div className={chatRoomStyle} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
                                    <img src={pfp} alt="Profile picture" />
                                    <div>
                                        <p className={chatroomNameStyle}>{chatroom.name}</p>
                                        <p className={chatroomLatestMessageStyle}>latest message</p>
                                    </div>
                                </div>
                            )
                            : message
                    }
                </div>

                {
                    isCreatingChatroom
                        ? <div className={formContainer}>
                            <button className={closeBtnStyle} onClick={() => setIsCreatingChatroom(false)}>x</button>
                            <form onSubmit={handleSubmit}>
                                <input name='chatroomName' type="text" placeholder='Chatroom Name' />
                                <input name='username' type="text" placeholder='Participant Name' />
                                <input type="submit" />
                                {
                                    errorMessage
                                        ? errorMessage
                                        : null
                                }
                            </form>
                        </div>
                        : null
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