import { useAuth } from '../../../hooks/useAuth'
import { useApi } from '../../../hooks/useApi'
import style from './ChatBubble.module.css'
import pfpImage from '/icons/pfp.svg'
import confirmImage from './img/confirm.svg'
import cancelImage from './img/cancel.svg'
import ChatBubbleActions from '../ChatBubbleActionsStyle/ChatBubbleActions'
import { useEffect, useRef, useState } from 'react'
import { memo } from 'react'
import { useWebsocketActions } from '../../../hooks/useWebsocketActions'

const hourFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

const weekDayFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

const ChatBubble = memo(function ChatBubble({ chatMessage, prevChatMessage, nextChatMessage, currentDate }) {
    const { user } = useAuth()
    const api = useApi()
    const { editMessage, deleteMessage, deletedMessage } = useWebsocketActions()
    const { chatStyle, timestampStyle, chatBubble, chatInfo, imageContainerStyle, usernameStyle, sent, received, firstRecentChat, recentlyReceived,
        partOfRecentMessageGroupStyle, lastRecentChatStyle, chatBubbleContainerStyle, messageBubbleActionsStyle, cancelImageContainerStyle,
        confirmImageContainerStyle, deletedMessageBubbleStyle, showActions } = style

    const inputRef = useRef(null)
    const [isShowingOptions, setIsShowingOptions] = useState(false)
    const [isEditingMessage, setIsEditingMessage] = useState(false)
    const [newMessage, setNewMessage] = useState(chatMessage.message_text)

    const isSender = chatMessage.sender_id === user?.id
    const threeMins = 180000
    const currentChatMessageSentAtMs = new Date(chatMessage.sent_at)
    const currentChatMessageSenderId = chatMessage.sender_id
    const prevChatMessageSentAtMs = new Date(prevChatMessage?.sent_at)
    const prevChatMessageSenderId = prevChatMessage?.sender_id
    const nextChatMessageSentAtMs = new Date(nextChatMessage?.sent_at)
    const nextChatMessageSenderId = nextChatMessage?.sender_id

    const isEdited = chatMessage.is_edited === 1
    const isDeletedThroughDb = chatMessage.is_deleted === 1
    const isDeletedThroughWs = deletedMessage?.message_id === chatMessage.message_id
    const isDeleted = isDeletedThroughDb || isDeletedThroughWs

    function isRecent(recent, old) {
        const lapsedTimeMs = recent - old
        if (lapsedTimeMs > threeMins) return false
        return true
    }

    function checkIfFirstMessageGroup() {
        if (!nextChatMessage || nextChatMessageSenderId !== currentChatMessageSenderId) return false

        if (prevChatMessageSenderId === currentChatMessageSenderId) {
            const isPrevInGroup = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
            if (isPrevInGroup) return false
        }

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

    function checkIfSingleMessage() {
        if (prevChatMessageSenderId !== currentChatMessageSenderId) {
            if (nextChatMessageSenderId !== currentChatMessageSenderId) return true
            return !isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
        }

        const isPrevMessageRecent = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
        if (isPrevMessageRecent) return false

        if (nextChatMessageSenderId === currentChatMessageSenderId) {
            const isNextMessageRecent = isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
            if (isNextMessageRecent) return false
        }
        return true
    }

    const isSingleMessage = checkIfSingleMessage()

    function checkIfTimestampable() {
        if (!prevChatMessage) return true
        const isPrevRecent = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
        if (isPrevRecent) return false

        return true
    }

    function getTimeStamp() {
        if (!hasTimestamp) return

        const timePassed = currentDate - currentChatMessageSentAtMs.getTime()
        const dayMs = 1000 * 60 * 60 * 24
        const threeDays = dayMs * 3
        const twoDays = dayMs * 2

        if (timePassed > threeDays) {
            return dateFormatter.format(currentChatMessageSentAtMs)
        }
        if (timePassed > twoDays) {
            return weekDayFormatter.format(currentChatMessageSentAtMs)
        }
        if (timePassed > dayMs) {
            return `YESTERDAY AT ${hourFormatter.format(currentChatMessageSentAtMs)}`
        }
        return hourFormatter.format(currentChatMessageSentAtMs)
    }
    const hasTimestamp = checkIfTimestampable()
    const showUsername = !isSender && (isFirst || isSingleMessage)

    async function confirmEdit(e) {
        e.preventDefault()
        const editedMessageInfo = { message_id: chatMessage?.message_id, message_text: newMessage, sender_id: chatMessage?.sender_id, chatroom_id: chatMessage?.chatroom_id }

        try {
            const data = await api.put('/messages/edit', editedMessageInfo)
            console.log(data || 'Something went wrong')
            setIsEditingMessage(false)
            editMessage(editedMessageInfo)
        } catch (e) {
            console.log(e)
        }
    }

    async function deleteForEveryone() {
        try {
            const data = await api.delete(`/messages/delete/${chatMessage?.message_id}`)
            const { message_id, sender_id, chatroom_id } = chatMessage
            deleteMessage({ message_id, sender_id, chatroom_id, message_text: 'Message deleted', is_deleted: 1, type: 'deleteMessage' })
            console.log(data.message)
        } catch (e) {
            console.log(e)
        }
    }

    console.log(chatMessage.message_id, ' reran')

    useEffect(() => {
        if (isEditingMessage && inputRef.current) {
            inputRef.current.focus()
        }
    }, [isEditingMessage])

    function handleKeyDown(e) {
        if (e.key === 'Escape') {
            setIsEditingMessage(false)
        }
    }

    return (
        <>
            {hasTimestamp &&
                <div className={timestampStyle}>
                    <p>{getTimeStamp()}</p>
                </div>}
            <div className={`${chatStyle} ${isSender ? sent : received} ${isReceivedRecent && recentlyReceived || isFirst && recentlyReceived}`} onMouseLeave={() => setIsShowingOptions(false)}>
                <div className={imageContainerStyle} hidden={isSender || isReceivedRecent || isFirst}>
                    <img src={pfpImage} alt="Profile picture" />
                </div>
                <div className={`${chatInfo}`}>
                    {showUsername && <p className={usernameStyle} >{chatMessage.sender_name}</p>}
                    {isEdited && <p>Edited</p>}
                    <div className={chatBubbleContainerStyle}>
                        <div className={`${chatBubble} ${isFirst && firstRecentChat} ${isReceivedRecent && partOfRecentMessageGroupStyle} ${isLast && lastRecentChatStyle} ${isDeleted && deletedMessageBubbleStyle}`} >
                            {isEditingMessage
                                ? <form onSubmit={(e) => confirmEdit(e)} onKeyDown={handleKeyDown}>
                                    <input type="text" onChange={(e) => setNewMessage(e.target.value)} ref={inputRef} value={newMessage} />
                                </form>
                                : <p>{
                                    isDeletedThroughWs
                                        ? deletedMessage?.message_text
                                        : chatMessage.message_text
                                }</p>
                            }
                        </div>
                        <div className={`${messageBubbleActionsStyle} ${isEditingMessage && showActions}`}>
                            {isEditingMessage
                                ? <>
                                    <div className={cancelImageContainerStyle} onClick={() => setIsEditingMessage(false)}>
                                        <img src={cancelImage} alt="Cancel image" />
                                    </div>
                                    <div className={confirmImageContainerStyle} onClick={confirmEdit}>
                                        <img src={confirmImage} alt="Confirm Image" />
                                    </div>
                                </>
                                : <ChatBubbleActions chatMessage={chatMessage} onEdit={setIsEditingMessage} onDeleteForEveryone={deleteForEveryone} isSender={isSender} isShowingOptions={isShowingOptions} setIsShowingOptions={setIsShowingOptions} />
                            }
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
})

export default ChatBubble