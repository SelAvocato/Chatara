import { useState, useEffect, useRef } from "react"
import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import ChatParent from "./ChatParent/ChatParent"
import style from "./Chatroom.module.css"
import addCircle from '/icons/add_circle.svg'
import pfp from '/icons/pfp.svg'
import CreateChatroom from "./CreateChatroom/CreateChatroom"

export default function Chatroom() {
    const ws = useRef(null)
    const [currentChatroomId, setCurrentChatroomId] = useState(null)
    const [userTyping, setUserTyping] = useState(null)
    const [message, setMessage] = useState('')
    const [startChat, setStartChat] = useState('')
    const [chatrooms, setChatrooms] = useState([])
    const [chatMessages, setChatMessages] = useState([])
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [hasOpenChat, setHasOpenChat] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const { user } = useAuth()
    const { main, chatroomsStyle, chatroomsListStyle, imgContainerStyle, chatroomsHeaderStyle, chatroomNameStyle, chatroomLatestMessageStyle, chatRoomStyle } = style

    useEffect(() => {
        async function getChatrooms() {
            try {
                const res = await apiClient.get(`/chatrooms/${user?.id}`)
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
            try {
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
            catch (e) {
                console.log(e.message)
            }
        }

        ws.current.onerror = () => {
            console.log('Something went wrong')
        }

        ws.current.onclose = () => {
            console.log('Goodbye')
        }

        return () => ws.current.close()

    }, [])

    async function onOpenChat(chatroomId) {
        setHasOpenChat(true)
        setCurrentChatroomId(chatroomId)
        try {
            const res = await apiClient.get(`/messages/${chatroomId}`)
            ws.current.send(JSON.stringify({
                type: "join",
                chatroomId: chatroomId,
                userId: user.id
            }))
            console.log('sent join ws')
            if (res.status === 'empty') {
                setChatMessages([])
                return setStartChat(res.message)
            }
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
                    <div className={imgContainerStyle}>
                        <img onClick={() => setIsCreatingChatroom(true)} src={addCircle} alt="Add Circle" />
                    </div>
                </div>
                <div className={chatroomsListStyle}>
                    {
                        chatrooms && chatrooms.length > 0
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
                        ? < CreateChatroom setIsCreatingChatroom={setIsCreatingChatroom} />
                        : null
                }
            </div>
            {
                hasOpenChat
                    ?
                    <ChatParent chatMessages={chatMessages} isTyping={isTyping} startChat={startChat} currentChatroomId={currentChatroomId} userTyping={userTyping} />
                    : null
            }
        </div >
    )
}