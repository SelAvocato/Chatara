import { useState, useEffect } from 'react'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useApi } from '../../../hooks/useApi'
import Avatar from '../../../component/Avatar/Avatar'
import style from './ChatroomList.module.css'
import { memo } from 'react'
import { useAuth } from '../../../hooks/useAuth'

const ChatroomList = memo(function ChatroomList({ chatroom, hasOpenChat, setHasOpenChat }) {
    const { chatRoomStyle, currentlyOpen, chatroomImageContainerStyle, latestMessageContainerStyle, chatroomNameStyle, chatroomLatestMessageStyle,
        latestMessageInfoStyle, unreadMessageStyle } = style
    const { wsRef, latestMessageWs, openChat, currentChatroomId } = useWebsocket()
    const api = useApi()
    const { user } = useAuth()

    const [latestMessage, setLatestMessage] = useState(null)
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(null)

    useEffect(() => {
        async function fetchLatestMessage() {
            try {
                let data = await api.get(`/messages/received/${chatroom.id}`)
                if (data?.messages?.length === 0) {
                    data = await api.get(`/messages/latest/${chatroom.id}`)
                    setLatestMessage(data?.data || null)
                    return
                }

                const recentMessage = data?.messages?.at(-1)
                const { message_id, chatroom_id } = recentMessage
                wsRef?.current?.send(JSON.stringify({ message_id, chatroom_id, message_status: 'delivered', type: 'delivered' }))

                setLatestMessage(recentMessage)
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
        async function changeLatestMessage() {
            setLatestMessage(latestMessageWs)
            if (latestMessageWs?.sender_id !== user.id && latestMessageWs.type === 'notification') {
                setUnreadMessagesCount(prev => prev + 1)
            }
            const { message_id, chatroom_id } = latestMessageWs
            await api.put(`/messages/delivered/${chatroom_id}`)
            wsRef?.current?.send(JSON.stringify({ message_id, chatroom_id, message_status: 'delivered', type: 'delivered' }))
        }
        changeLatestMessage()
    }, [latestMessageWs, chatroom.id, user, wsRef, api])

    async function onOpenChat(chatroomId) {
        if (chatroomId === currentChatroomId) return
        if (hasOpenChat === false) {
            setHasOpenChat(true)
        }
        setUnreadMessagesCount(null)
        try {
            await openChat(chatroomId)
        } catch {
            console.log('ran')
            setHasOpenChat(false)
        }
    }

    return (
        <div className={`${chatRoomStyle} ${currentChatroomId === chatroom.id && currentlyOpen}`} key={chatroom.id} onClick={() => onOpenChat(chatroom.id)}>
            <div className={chatroomImageContainerStyle}>
                <Avatar src={chatroom.chatroom_img_url || 'https://www.svgrepo.com/show/458220/group.svg'} />
            </div>
            <div className={latestMessageContainerStyle}>
                <p className={chatroomNameStyle}>{chatroom.name}</p>
                {latestMessage &&
                    <div className={`${chatroomLatestMessageStyle} ${unreadMessagesCount > 0 && unreadMessageStyle}`}>
                        <div className={latestMessageInfoStyle}>
                            <p>{latestMessage.sender_name}:</p>
                            <p>{latestMessage.message_text}</p>
                        </div>
                        <p>{unreadMessagesCount}</p>
                    </div>
                }
            </div>
        </div>
    )
})
export default ChatroomList