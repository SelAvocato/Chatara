import { useAuth } from '../../../hooks/useAuth'
import style from './ChatBubble.module.css'
import pfpImage from '/icons/pfp.svg'

export default function ChatBubble({ chatMessage, prevChatMessage, nextChatMessage }) {
    const { user } = useAuth()
    const { chatStyle, chatBubble, chatInfo, imageContainerStyle, usernameStyle, sent, received, firstRecentChat, recentlyReceived } = style
    const isSender = chatMessage.sender_id === user?.id ? true : false
    const fiveMins = 300000

    const fromSameSender = () => {
        if (nextChatMessage && nextChatMessage.sender_id !== user.id && nextChatMessage.sender_id === chatMessage.sender_id) {
            return checkIfRecent(true)
        }
        return false
    }

    const checkIfRecent = (bool) => {
        if (!bool) return false

        const lapsedTimeInMs = new Date(nextChatMessage.sent_at) - new Date(chatMessage.sent_at)
        if (lapsedTimeInMs < fiveMins) return true
        return false
    }

    const checkIfFirst = () => {
        if (!prevChatMessage && chatMessage.sender_id !== user.id || prevChatMessage && prevChatMessage.sender_id !== chatMessage.sender_id && prevChatMessage.sender_id === user.id) return true
        if (nextChatMessage && nextChatMessage.sender_id !== user.id && nextChatMessage.sender_id === chatMessage.sender_id) {
            const firstLapsedTimeInMs = new Date(nextChatMessage.sent_at) - new Date(chatMessage.sent_at)
            const lastLapsedTimeInMs = new Date(chatMessage.sent_at) - new Date(prevChatMessage.sent_at)
            if (firstLapsedTimeInMs < fiveMins && lastLapsedTimeInMs > fiveMins) return true
            return false
        }
        return false
    }

    const isReceivedRecent = fromSameSender()
    const isFirst = checkIfFirst()

    return (
        <div className={`${chatStyle} ${isSender ? sent : received} ${isReceivedRecent && recentlyReceived}`}>
            <div className={imageContainerStyle} hidden={isSender || isReceivedRecent}>
                <img src={pfpImage} alt="Profile picture" />
            </div>
            <div className={`${chatInfo}`}>
                <p className={usernameStyle} hidden={isSender || !isFirst} >{chatMessage.sender_name}</p>
                <div className={`${chatBubble} ${isFirst && firstRecentChat}`} >
                    <p>{chatMessage.message_text}</p>
                </div>
            </div>
        </div>
    )
}