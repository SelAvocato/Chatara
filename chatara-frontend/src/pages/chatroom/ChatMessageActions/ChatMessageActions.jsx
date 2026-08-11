import { useEffect, useRef, useState } from 'react'
import style from './ChatMessageActions.module.css'
import { useAuth } from '../../../hooks/useAuth'
import { useApi } from '../../../hooks/useApi'
import submitIcon from './submit-icon.svg'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useReply } from '../../../hooks/useReply'

export default function ChatMessageActions() {
    const { actionStyle, replyingMessageContainerStyle, closeBtnContainerStyle, messageAndSubmitStyle, submitStyle, textAreaContainerStyle,
        textareaStyle } = style
    const { user } = useAuth()
    const api = useApi()
    const { wsRef, currentChatroomId } = useWebsocket()
    const { isReplying, setIsReplying, replyingMessageInfo, setReplyingMessageInfo } = useReply()
    const timeoutIdRef = useRef(null)
    const messageTextareaRef = useRef(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [isDebounced, setIsDebounced] = useState(false)
    const [messageInput, setMessageInput] = useState('')

    const username = user.username
    const pfpUrl = user.pfp_url

    function handleMessageChange(e) {
        setMessageInput(e.target.value)

        if (e.target.value && !isDebounced) {
            setIsDebounced(true)
            wsRef.current?.send(JSON.stringify({ type: 'typing', username, pfp_url: pfpUrl }))
        }

        clearTimeout(timeoutIdRef.current)

        timeoutIdRef.current = setTimeout(() => {
            wsRef.current?.send(JSON.stringify({ type: 'stoppedTyping', username }))
            setIsDebounced(false)
        }, 1000)
    }

    useEffect(() => {
        const currentWS = wsRef.current
        return () => {
            if (currentWS && currentWS.readyState === WebSocket.OPEN) {
                currentWS?.send(JSON.stringify({ type: 'stoppedTyping', username }))
            }

            setIsDebounced(false)
            setMessageInput('')

            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
            }
        }
    }, [currentChatroomId, wsRef, username])

    async function handleMessageSubmit(e) {
        e.preventDefault()
        messageTextareaRef.current.style.height = 'auto'
        if (messageInput.trim() === '') return
        const chatInfo = {
            type: 'chat',
            chatroomId: currentChatroomId,
            messageText: messageInput,
            repliedMessageId: replyingMessageInfo?.message_id
        }

        // setChatMessages(prev => [...prev, {
        //     chatroom_id: currentChatroomId,
        //     sender_id: user.id,
        //     senderName: username,
        //     message_text: messageInput,
        // }])

        try {
            const data = await api.post('/messages/send', (chatInfo))
            if (data.status !== 'ok') return setErrorMessage(data.message)
            wsRef.current.send(JSON.stringify({ type: 'stoppedTyping', username: username }))
            setErrorMessage(null)
            setIsReplying(false)
            setReplyingMessageInfo(null)
            setMessageInput('')
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <form className={actionStyle} onSubmit={handleMessageSubmit}>
            {isReplying && replyingMessageInfo &&
                < div className={replyingMessageContainerStyle}>
                    <div className={closeBtnContainerStyle} onClick={() => setIsReplying(false)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                            <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#0F0F0F" />
                        </svg>
                    </div>
                    <p>Replying to {replyingMessageInfo.sender_name}</p>
                    <p>{replyingMessageInfo.message_text}</p>
                </div>
            }
            <div className={messageAndSubmitStyle}>
                <div className={textAreaContainerStyle}>
                    <textarea className={textareaStyle} ref={messageTextareaRef}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault()
                                if (messageInput.trim() === '') return
                                e.target.form.requestSubmit()
                            }
                        }}
                        onChange={(e) => {
                            handleMessageChange(e)
                            e.target.style.height = 'auto'
                            e.target.style.height = `${e.target.scrollHeight}px`
                        }} value={messageInput} placeholder="Message" rows='1' />
                </div>
                <button onClick={handleMessageSubmit} className={submitStyle}>
                    <img src={submitIcon} alt="Submit Icon" />
                </button>
            </div>
            {
                errorMessage && errorMessage
            }
        </form >
    )
}