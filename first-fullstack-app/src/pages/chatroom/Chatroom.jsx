import { useState, useEffect } from "react"
import { apiClient } from "../../services/api"
import { useAuth } from "../../hooks/useAuth"
import { useWebsocket } from "../../hooks/useWebsocket"
import ChatParent from "./ChatParent/ChatParent"
import style from "./Chatroom.module.css"
import addCircle from '/icons/add_circle.svg'
import pfp from '/icons/pfp.svg'
import CreateChatroom from "./CreateChatroom/CreateChatroom"

export default function Chatroom() {
    const [message, setMessage] = useState('')
    const [chatrooms, setChatrooms] = useState([])
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [hasOpenChat, setHasOpenChat] = useState(false)

    const { user } = useAuth()
    const { openChat, currentChatroomId } = useWebsocket()
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

    async function onOpenChat(chatroomId) {
        if (chatroomId === currentChatroomId) return
        setHasOpenChat(true)
        openChat(chatroomId)
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
                    <ChatParent />
                    : null
            }
        </div >
    )
}