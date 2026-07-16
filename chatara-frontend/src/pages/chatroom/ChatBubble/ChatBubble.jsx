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
import { getTimeStamp } from '../../../../utils/dateFormatter'
import { checkIfFirstMessageGroup, checkIfTimestampable, checkIfPartOfRecentMessageGroup, checkIfLastOfMessageGroup, checkIfSingleMessage } from './ChatBubbleHelpers'

const ChatBubble = memo(function ChatBubble({ chatMessage, prevChatMessage, nextChatMessage, currentDate }) {
    const { user } = useAuth()
    const api = useApi()
    const { editMessage, deleteMessage } = useWebsocketActions()
    const { chatStyle, timestampStyle, chatBubble, chatInfo, imageContainerStyle, usernameStyle, sent, received, firstRecentChat, recentlyReceived,
        partOfRecentMessageGroupStyle, lastRecentChatStyle, chatBubbleContainerStyle, messageBubbleActionsStyle, cancelImageContainerStyle,
        confirmImageContainerStyle, deletedMessageBubbleStyle, showActions } = style

    const inputRef = useRef(null)
    const [isShowingOptions, setIsShowingOptions] = useState(false)
    const [isEditingMessage, setIsEditingMessage] = useState(false)
    const [newMessage, setNewMessage] = useState(chatMessage.message_text)

    const isSender = chatMessage.sender_id === user?.id
    const currentChatMessageSentAtMs = new Date(chatMessage.sent_at)
    const currentChatMessageSenderId = chatMessage.sender_id
    const prevChatMessageSentAtMs = new Date(prevChatMessage?.sent_at)
    const prevChatMessageSenderId = prevChatMessage?.sender_id
    const nextChatMessageSentAtMs = new Date(nextChatMessage?.sent_at)
    const nextChatMessageSenderId = nextChatMessage?.sender_id

    const isEdited = chatMessage.is_edited === 1
    const isDeleted = chatMessage.is_deleted === 1

    const isFirst = checkIfFirstMessageGroup(nextChatMessage, prevChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs, nextChatMessageSentAtMs)
    const isReceivedRecent = checkIfPartOfRecentMessageGroup(prevChatMessage, nextChatMessage, prevChatMessageSenderId, currentChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs, nextChatMessageSentAtMs)
    const isLast = checkIfLastOfMessageGroup(prevChatMessage, prevChatMessageSenderId, currentChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    const isSingleMessage = checkIfSingleMessage(prevChatMessageSenderId, currentChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSentAtMs, nextChatMessageSentAtMs, prevChatMessageSentAtMs)


    const hasTimestamp = checkIfTimestampable(prevChatMessage, currentChatMessageSentAtMs, prevChatMessageSentAtMs)
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
                        <div className={`${chatBubble} ${isFirst && firstRecentChat} ${isReceivedRecent && partOfRecentMessageGroupStyle} ${isLast && lastRecentChatStyle} ${isDeleted && deletedMessageBubbleStyle}`} >
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
            </div>
        </>
    )
})

export default ChatBubble