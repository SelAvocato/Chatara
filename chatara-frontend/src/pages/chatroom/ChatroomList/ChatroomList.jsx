import { useState, useEffect } from 'react'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useApi } from '../../../hooks/useApi'
import pfp from '/icons/pfp.svg'
import style from './ChatroomList.module.css'

export default function ChatroomList({ chatroom, hasOpenChat, setHasOpenChat }) {
    const [latestMessage, setLatestMessage] = useState(null)
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(null)

    const { chatRoomStyle, chatroomImageContainerStyle, chatroomNameStyle, chatroomLatestMessageStyle } = style
    const { wsRef, latestMessageWs, openChat, currentChatroomId } = useWebsocket()
    const api = useApi()

    useEffect(() => {
        async function fetchLatestMessage() {
            try {
                console.log('trying data below')
                let data = await api.get(`/messages/received/${chatroom.id}`)
                console.log('ran messages', data.messages)
                if (data?.messages?.length === 0) {
                    data = await api.get(`/messages/latest/${chatroom.id}`)
                    setLatestMessage(data?.data || null)
                    return
                }
                console.log('first message', data.messages[0])
                for (let x = 0; x < data.messages.length; x++) {
                    const currentMessage = data.messages[x]
                    const { message_id, chatroom_id } = currentMessage
                    console.log('going to deliver below')
                    wsRef?.current?.send(JSON.stringify({ message_id, chatroom_id, message_status: 'delivered', type: 'delivered' }))
                    console.log({ message_id, chatroom_id, type: 'delivered' })
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
