import { useState, useEffect } from 'react'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useApi } from '../../../hooks/useApi'
import pfp from '/icons/pfp.svg'
import style from './ChatroomList.module.css'

export default function ChatroomList({ chatroom, hasOpenChat, setHasOpenChat }) {
    const [latestMessage, setLatestMessage] = useState(null)
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(null)

    const { chatRoomStyle, chatroomImageContainerStyle, chatroomNameStyle, chatroomLatestMessageStyle } = style
    const { latestMessageWs, openChat, currentChatroomId } = useWebsocket()
    const api = useApi()

    useEffect(() => {
        async function fetchLatestMessage() {
            try {
                let data = await api.get(`/messages/received/${chatroom.id}`)
                if (data.messages.length === 0) {
                    data = await api.get(`/messages/latest/${chatroom.id}`)
                    setLatestMessage(data?.data || null)
                    return
                }
                setLatestMessage(data?.messages?.at(-1))
                setUnreadMessagesCount(data?.messages?.length)
                await api.put(`/messages/delivered/${chatroom.id}`)
            } catch (e) {
                console.error(e)
            }
        }
        fetchLatestMessage()
    }, [chatroom.id, api])

    useEffect(() => {
        if (latestMessageWs?.chatroom_id !== chatroom.id) return
        const changeLatestMessage = () => setLatestMessage(latestMessageWs)
        changeLatestMessage()
    }, [latestMessageWs, chatroom.id])

    async function onOpenChat(chatroomId) {
        if (chatroomId === currentChatroomId) return
        if (hasOpenChat === false) {
            setHasOpenChat(true)
        }
        await openChat(chatroomId)
        console.log('this is the chatroomId and this is the current chatroom id ', chatroomId, currentChatroomId, hasOpenChat)
    }

    return (
        <div className={chatRoomStyle} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
            <div className={chatroomImageContainerStyle}>
                <img src={pfp} alt="Profile picture" />
            </div>
            <div>
                <p className={chatroomNameStyle}>{chatroom.name}</p>
                <p className={chatroomLatestMessageStyle}>{latestMessage && latestMessage.message_text}</p>
                <p>{unreadMessagesCount}</p>
            </div>
        </div>
    )
}
