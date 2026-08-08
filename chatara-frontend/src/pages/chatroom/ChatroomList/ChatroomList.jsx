import { useState, useEffect } from 'react'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useApi } from '../../../hooks/useApi'
import Avatar from '../../../component/Avatar/Avatar'
import style from './ChatroomList.module.css'
import { memo } from 'react'

const ChatroomList = memo(function ChatroomList({ chatroom, hasOpenChat, setHasOpenChat }) {
    const [latestMessage, setLatestMessage] = useState(null)
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(null)

    const { chatRoomStyle, chatroomImageContainerStyle, chatroomNameStyle, chatroomLatestMessageStyle } = style
    const { wsRef, latestMessageWs, openChat, currentChatroomId } = useWebsocket()
    const api = useApi()

    useEffect(() => {
        async function fetchLatestMessage() {
            try {
                let data = await api.get(`/messages/received/${chatroom.id}`)
                if (data?.messages?.length === 0) {
                    data = await api.get(`/messages/latest/${chatroom.id}`)
                    setLatestMessage(data?.data || null)
                    return
                }
                for (let x = 0; x < data.messages.length; x++) {
                    if (data.messages[x].message_status !== 'sent') continue
                    const currentMessage = data.messages[x]
                    const { message_id, chatroom_id } = currentMessage
                    wsRef?.current?.send(JSON.stringify({ message_id, chatroom_id, message_status: 'delivered', type: 'delivered' }))
                }
                setLatestMessage(data?.messages?.at(-1))
                setUnreadMessagesCount(data?.messages?.length)
                await api.put(`/messages/delivered/${chatroom.id}`)
            } catch (e) {
                console.error(e)
            }
        }
        fetchLatestMessage()
    }, [chatroom.id, api, wsRef])

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
    }

    return (
        <div className={chatRoomStyle} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
            <div className={chatroomImageContainerStyle}>
                <Avatar src={chatroom.chatroom_img_url || 'https://www.svgrepo.com/show/458220/group.svg'} />
            </div>
            <div>
                <p className={chatroomNameStyle}>{chatroom.name}</p>
                <p className={chatroomLatestMessageStyle}>{latestMessage && latestMessage.message_text}</p>
                <p>{unreadMessagesCount}</p>
            </div>
        </div>
    )
})
export default ChatroomList