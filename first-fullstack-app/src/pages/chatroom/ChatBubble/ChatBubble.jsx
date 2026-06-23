import { useAuth } from '../../../hooks/useAuth'
import style from './ChatBubble.module.css'
import pfpImage from '/icons/pfp.svg'

export default function ChatBubble({ chatMessage }) {
    const { user } = useAuth()
    const { chatStyle, chatBubble, chatInfo, imageContainerStyle, usernameStyle, sent, received } = style
    const isSender = chatMessage.sender_id === user?.id ? true : false
    console.log(chatMessage.sent_at)

    return (
        <div className={`${chatStyle} ${isSender ? sent : received}`}>
            <div className={imageContainerStyle} hidden={isSender}>
                <img src={pfpImage} alt="Profile picture" />
            </div>
            <div className={chatInfo}>
                <p className={usernameStyle} hidden={isSender} >{chatMessage.sender_name}</p>
                <div className={chatBubble} >
                    <p>{chatMessage.message_text}</p>
                </div>
            </div>
        </div>
    )
}