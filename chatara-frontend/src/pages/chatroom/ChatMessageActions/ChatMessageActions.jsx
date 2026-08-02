import { useEffect, useRef, useState } from 'react'
import style from './ChatMessageActions.module.css'
import { useAuth } from '../../../hooks/useAuth'
import { useApi } from '../../../hooks/useApi'
import submitIcon from './submit-icon.svg'
import { useWebsocket } from '../../../hooks/useWebsocket'

export default function ChatMessageActions() {
    const timeoutIdRef = useRef(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [isDebounced, setIsDebounced] = useState(false)
    const [messageInput, setMessageInput] = useState('')

    const { user } = useAuth()
    const api = useApi()
    const { wsRef, currentChatroomId } = useWebsocket()
    const { actionStyle, messageAndSubmitStyle, submitStyle, textAreaContainerStyle, textareaStyle } = style
    const username = user.username

    function handleMessageChange(e) {
        setMessageInput(e.target.value)

        if (e.target.value && !isDebounced) {
            setIsDebounced(true)
            wsRef.current?.send(JSON.stringify({ type: 'typing', username: username }))
        }

        clearTimeout(timeoutIdRef.current)

        timeoutIdRef.current = setTimeout(() => {
            wsRef.current?.send(JSON.stringify({ type: 'stoppedTyping', username: username }))
            setIsDebounced(false)
        }, 1000)
    }

    useEffect(() => {
        const currentWS = wsRef.current
        return () => {
            if (currentWS && currentWS.readyState === WebSocket.OPEN) {
                currentWS?.send(JSON.stringify({ type: 'stoppedTyping', username: username }))
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
        if (messageInput.trim() === '') return
        const chatInfo = {
            type: 'chat',
            chatroomId: currentChatroomId,
            messageText: messageInput
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
            setMessageInput('')
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <form className={actionStyle} onSubmit={handleMessageSubmit}>
            <div className={messageAndSubmitStyle}>
                <div className={textAreaContainerStyle}>
                    <textarea className={textareaStyle}
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
        </form>
    )
}