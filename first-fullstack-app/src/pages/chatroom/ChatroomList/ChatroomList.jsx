
import { useWebsocket } from '../../../hooks/useWebsocket'
import pfp from '/icons/pfp.svg'
import style from './ChatroomList.module.css'

export default function ChatroomList({ chatroom, setHasOpenChat }) {
    const { chatRoomStyle, chatroomNameStyle, chatroomLatestMessageStyle } = style

    const { openChat, currentChatroomId } = useWebsocket()

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
                <p className={chatroomLatestMessageStyle}>latest message</p>
            </div>
        </div>
    )
}