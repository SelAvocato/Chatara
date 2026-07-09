import { useState, useEffect } from 'react'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useApi } from '../../../hooks/useApi'
import pfp from '/icons/pfp.svg'
import style from './ChatroomList.module.css'

export default function ChatroomList({ chatroom, setHasOpenChat }) {
    const [latestMessage, setLatestMessage] = useState(null)

    const { chatRoomStyle, chatroomImageContainerStyle, chatroomNameStyle, chatroomLatestMessageStyle } = style
    const { latestMessageWs, openChat, currentChatroomId, chatMessages } = useWebsocket()
    const api = useApi()

    useEffect(() => {
        async function fetchLatestMessage() {
            const data = await api.get(`/messages/latest/${chatroom.id}`)
            setLatestMessage(data.data || null)
        }
        fetchLatestMessage()
    }, [chatroom.id, api, chatMessages])

    useEffect(() => {
        if (latestMessageWs?.chatroom_id !== chatroom.id) return
        function changeLatestMessage() {
            setLatestMessage(latestMessageWs)
        }
        changeLatestMessage()
    }, [latestMessageWs, chatroom.id])

    async function onOpenChat(chatroomId) {
        if (chatroomId === currentChatroomId) return
        setHasOpenChat(true)
        openChat(chatroomId)
    }

    return (
        <div className={chatRoomStyle} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
            <div className={chatroomImageContainerStyle}>
                <img src={pfp} alt="Profile picture" />
            </div>
            <div>
                <p className={chatroomNameStyle}>{chatroom.name}</p>
                <p className={chatroomLatestMessageStyle}>{latestMessage && latestMessage.message_text}</p>
            </div>
        </div>
    )
}
