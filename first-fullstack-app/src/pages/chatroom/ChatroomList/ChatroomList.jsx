import { useState, useEffect } from 'react'
import { useWebsocket } from '../../../hooks/useWebsocket'
import pfp from '/icons/pfp.svg'
import style from './ChatroomList.module.css'
import { apiClient } from '../../../services/api'

export default function ChatroomList({ chatroom, setHasOpenChat }) {
    const [latestMessage, setLatestMessage] = useState(null)

    const { chatRoomStyle, chatroomNameStyle, chatroomLatestMessageStyle } = style
    const { latestMessageWs, openChat, currentChatroomId } = useWebsocket()

    useEffect(() => {
        async function fetchLatestMessage() {
            const data = await apiClient.get(`/messages/latest/${chatroom.id}`)
            setLatestMessage(data.data.message_text)
            console.log('data', data)
            console.log('latest message', data.data.message_text || 'none')
        }
        fetchLatestMessage()
    }, [chatroom.id])

    useEffect(() => {
        function changeLatestMessage() {
            setLatestMessage(latestMessageWs)
        }
        changeLatestMessage()
    }, [latestMessageWs])

    async function onOpenChat(chatroomId) {
        if (chatroomId === currentChatroomId) return
        setHasOpenChat(true)
        openChat(chatroomId)
    }

    return (
        <div className={chatRoomStyle} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
            <img src={pfp} alt="Profile picture" />
            <div>
                <p className={chatroomNameStyle}>{chatroom.name}</p>
                <p className={chatroomLatestMessageStyle}>{latestMessage && latestMessage}</p>
            </div>
        </div>
    )
}
