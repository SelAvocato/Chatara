import { useAuth } from '../../../hooks/useAuth'
import { useApi } from '../../../hooks/useApi'
import style from './ChatBubble.module.css'
import pfpImage from '/icons/pfp.svg'
import confirmImage from './img/confirm.svg'
import cancelImage from './img/cancel.svg'
import ChatBubbleActions from '../ChatBubbleActionsStyle/ChatBubbleActions'
import { useEffect, useRef, useState, memo } from 'react'
import { useWebsocketActions } from '../../../hooks/useWebsocketActions'
import { getTimeStamp } from '../../../../utils/dateFormatter'
import { checkIfFirstMessageGroup, checkIfTimestampable, checkIfPartOfRecentMessageGroup, checkIfLastOfMessageGroup, checkIfSingleMessage } from './ChatBubbleHelpers'
import MessageStatus from '../MessageStatus/MessageStatus'

const ChatBubble = memo(function ChatBubble({ chatMessage, prevChatMessage, nextChatMessage, currentDate }) {
    const { user } = useAuth()
    const api = useApi()
    const { wsRef, editMessage, deleteMessage } = useWebsocketActions()
    const { chatStyle, timestampStyle, chatBubble, chatInfo, imageContainerStyle, usernameStyle, sent, received, firstRecentChat, recentlyReceived,
        partOfRecentMessageGroupStyle, lastRecentChatStyle, chatBubbleContainerStyle, messageBubbleActionsStyle, cancelImageContainerStyle,
        confirmImageContainerStyle, deletedMessageBubbleStyle, showActions } = style

    const chatBubbleRef = useRef(null)
    const inputRef = useRef(null)
    const [isShowingOptions, setIsShowingOptions] = useState(false)
    const [isEditingMessage, setIsEditingMessage] = useState(false)
    const [isSeen, setIsSeen] = useState(false)
    const [newMessage, setNewMessage] = useState(chatMessage.message_text)

    const isSender = chatMessage.sender_id === user?.id
    const isEdited = chatMessage.is_edited === 1
    const isDeleted = chatMessage.is_deleted === 1

    const currentChatMessageSentAtMs = new Date(chatMessage.sent_at)
    const currentChatMessageSenderId = chatMessage?.sender_id
    const currentChatroomId = chatMessage?.chatroom_id
    const currentMessageId = chatMessage?.message_id
    const prevChatMessageSentAtMs = new Date(prevChatMessage?.sent_at)
    const prevChatMessageSenderId = prevChatMessage?.sender_id
    const nextChatMessageSentAtMs = new Date(nextChatMessage?.sent_at)
    const nextChatMessageSenderId = nextChatMessage?.sender_id

    const isFirst = checkIfFirstMessageGroup(nextChatMessage, prevChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs, nextChatMessageSentAtMs)
    const isReceivedRecent = checkIfPartOfRecentMessageGroup(prevChatMessage, nextChatMessage, prevChatMessageSenderId, currentChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs, nextChatMessageSentAtMs)
    const isLast = checkIfLastOfMessageGroup(prevChatMessage, prevChatMessageSenderId, currentChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    const isSingleMessage = checkIfSingleMessage(prevChatMessageSenderId, currentChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSentAtMs, nextChatMessageSentAtMs, prevChatMessageSentAtMs)

    const hasTimestamp = checkIfTimestampable(prevChatMessage, currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    const showUsername = !isSender && (isFirst || isSingleMessage)
    const isLastMessage = nextChatMessage === undefined
    const showMessageStatus = isSender && (chatMessage.message_status === 'sending...' || isLastMessage)
    const hasSeenMessage = chatMessage.message_status === 'seen' || currentChatMessageSenderId === user.id

    useEffect(() => {
        if (hasSeenMessage) return
        const observer = new IntersectionObserver(([entry]) => {
            setIsSeen(entry?.isIntersecting)
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.5
        })

        const notSeenMessage = chatBubbleRef.current
        if (notSeenMessage) {
            observer.observe(notSeenMessage)
        }

        return () => {
            if (notSeenMessage) {
                observer.unobserve(notSeenMessage)
            }
        }
    }, [hasSeenMessage, chatMessage])

    useEffect(() => {
        if (!isSeen) return
        const controller = new AbortController()
        async function seenMessage() {
            try {
                await api.put(`/messages/seen/${currentChatroomId}?message_id=${currentMessageId}`, { signal: controller.signal })
                wsRef?.current?.send(JSON.stringify({ type: 'seen', message_id: currentMessageId, chatroom_id: currentChatroomId, message_status: 'seen' }))
            } catch (e) {
                if (e.name === 'AbortError') return
                console.error(e)
            }
        }

        seenMessage()
        return () => controller.abort()
    }, [isSeen, currentChatroomId, currentMessageId, api, wsRef])

    async function confirmEdit(e) {
        e.preventDefault()
        const editedMessageInfo = { message_id: chatMessage?.message_id, message_text: newMessage, sender_id: currentChatMessageSenderId, chatroom_id: currentChatroomId }

        try {
            await api.put('/messages/edit', editedMessageInfo)
            setIsEditingMessage(false)
            editMessage(editedMessageInfo)
        } catch (e) {
            console.error(e)
        }
    }

    async function deleteForEveryone() {
        try {
            await api.delete(`/messages/delete/${currentMessageId}`)
            deleteMessage({ message_id: currentMessageId, sender_id: currentChatMessageSenderId, chatroom_id: currentChatroomId, message_text: 'Message deleted', is_deleted: 1, type: 'deleteMessage' })
        } catch (e) {
            console.error(e)
        }
    }

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
                    <p>{getTimeStamp(hasTimestamp, currentChatMessageSentAtMs, currentDate)}</p>
                </div>}
            <div className={`${chatStyle} ${isSender ? sent : received} ${isReceivedRecent && recentlyReceived || isFirst && recentlyReceived}`} onMouseLeave={() => setIsShowingOptions(false)} ref={chatMessage.ref !== undefined ? chatMessage.ref : null}>
                <div className={imageContainerStyle} hidden={isSender || isReceivedRecent || isFirst}>
                    <img src={pfpImage} alt="Profile picture" />
                </div>
                <div className={`${chatInfo}`}>
                    {showUsername && <p className={usernameStyle} >{chatMessage.sender_name}</p>}
                    {isEdited && <p>Edited</p>}
                    <div className={chatBubbleContainerStyle}>
                        <div className={`${chatBubble} ${isFirst && firstRecentChat} ${isReceivedRecent && partOfRecentMessageGroupStyle} ${isLast && lastRecentChatStyle} ${isDeleted && deletedMessageBubbleStyle}`} ref={chatBubbleRef}>
                            {isEditingMessage
                                ? <form onSubmit={(e) => confirmEdit(e)} onKeyDown={handleKeyDown}>
                                    <input type="text" onChange={(e) => setNewMessage(e.target.value)} ref={inputRef} value={newMessage} />
                                </form>
                                : <p>{chatMessage.message_text}</p>
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
                {showMessageStatus && <MessageStatus messageStatus={chatMessage?.message_status} />}
            </div>
        </>
    )
})

export default ChatBubble