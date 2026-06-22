import { useEffect, useRef, useState } from 'react'
import style from './ChatMessageActions.module.css'
import { useAuth } from '../../../hooks/useAuth'
import { apiClient } from '../../../services/api'
import submitIcon from './submit-icon.svg'
import { useWebsocket } from '../../../hooks/useWebsocket'

export default function ChatMessageActions() {
    const timeoutIdRef = useRef(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [isDebounced, setIsDebounced] = useState(false)
    const [messageInput, setMessageInput] = useState('')

    const { user } = useAuth()
    const { wsRef, currentChatroomId } = useWebsocket()
    const { actionStyle, messageAndSubmitStyle, textInputStyle, submitStyle } = style
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
            currentWS?.send(JSON.stringify({ type: 'stoppedTyping', username: username }))
            setIsDebounced(false)
            setMessageInput('')

            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
            }
        }
    }, [currentChatroomId, wsRef, username])

    async function handleMessageSubmit(e) {
        e.preventDefault()
        const data = {
            type: 'chat',
            chatroomId: currentChatroomId,
            senderId: user.id,
            senderName: username,
            messageText: messageInput
        }

        try {
            const res = await apiClient.post('/messages/send', (data))
            console.log('response: ', res)
            if (res.status !== 'ok') return setErrorMessage(res.message)
            setErrorMessage(null)
            setMessageInput('')
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <form className={actionStyle} onSubmit={handleMessageSubmit}>
            <div className={messageAndSubmitStyle}>
                <input className={textInputStyle} onChange={handleMessageChange} value={messageInput} type="text" placeholder="Message" />
                <button onClick={handleMessageSubmit} className={submitStyle}>
                    <img src={submitIcon} alt="Submit Icon" />
                </button>
            </div>
            {
                errorMessage ? errorMessage : null
            }
        </form>
    )
}