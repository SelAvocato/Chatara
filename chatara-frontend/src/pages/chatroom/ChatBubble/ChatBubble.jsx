import { useAuth } from '../../../hooks/useAuth'
import style from './ChatBubble.module.css'
import pfpImage from '/icons/pfp.svg'

export default function ChatBubble({ chatMessage, prevChatMessage, nextChatMessage }) {
    const { user } = useAuth()
    const { chatStyle, chatBubble, chatInfo, imageContainerStyle, usernameStyle, sent, received, firstRecentChat, recentlyReceived, partOfRecentMessageGroupStyle, lastRecentChatStyle } = style

    const isSender = chatMessage.sender_id === user?.id
    const fiveMins = 300000
    const currentChatMessageSentAtMs = new Date(chatMessage.sent_at)
    const currentChatMessageSenderId = chatMessage.sender_id
    const prevChatMessageSentAtMs = new Date(prevChatMessage?.sent_at)
    const prevChatMessageSenderId = prevChatMessage?.sender_id
    const nextChatMessageSentAtMs = new Date(nextChatMessage?.sent_at)
    const nextChatMessageSenderId = nextChatMessage?.sender_id

    function isRecent(recent, old) {
        const lapsedTimeMs = recent - old
        if (lapsedTimeMs > fiveMins) return false
        return true
    }

    function checkIfFirstMessageGroup() {
        if (!nextChatMessage || nextChatMessageSenderId !== currentChatMessageSenderId) return false

        const isPrevInGroup = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
        if (isPrevInGroup) return false

        const isNextInGroup = isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
        if (!isNextInGroup) return false

        return true
    }

    function checkIfPartOfRecentMessageGroup() {
        if (!prevChatMessage || !nextChatMessage || prevChatMessageSenderId !== currentChatMessageSenderId || nextChatMessageSenderId !== currentChatMessageSenderId) return false
        const isPrevRecent = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
        if (!isPrevRecent) return false
        return isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
    }

    function checkIfLastOfMessageGroup() {
        if (!prevChatMessage || prevChatMessageSenderId !== currentChatMessageSenderId) return false
        return isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    }

    const isFirst = checkIfFirstMessageGroup()
    const isReceivedRecent = checkIfPartOfRecentMessageGroup()
    const isLast = checkIfLastOfMessageGroup()

    return (
        <div className={`${chatStyle} ${isSender ? sent : received} ${isReceivedRecent && recentlyReceived || isFirst && recentlyReceived}`}>
            <div className={imageContainerStyle} hidden={isSender || isReceivedRecent || isFirst}>
                <img src={pfpImage} alt="Profile picture" />
            </div>
            <div className={`${chatInfo}`}>
                <p className={usernameStyle} hidden={isSender || !isFirst} >{chatMessage.sender_name}</p>
                <div className={`${chatBubble} ${isFirst && firstRecentChat} ${isReceivedRecent && partOfRecentMessageGroupStyle} ${isLast && lastRecentChatStyle} `} >
                    <p>{chatMessage.message_text}</p>
                </div>
            </div>
        </div>
    )
}