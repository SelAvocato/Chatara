import { useEffect, useRef, useState } from 'react'
import style from './ChatMessageActions.module.css'
import { useAuth } from '../../../hooks/useAuth'
import { apiClient } from '../../../services/api'

export default function ChatMessageActions({ currentChatroomId, ws, userRef }) {
    const [errorMessage, setErrorMessage] = useState(null)
    const [isDebounced, setIsDebounced] = useState(false)
    const [messageInput, setMessageInput] = useState('')
    const timeoutIdRef = useRef(null)
    const { user } = useAuth()
    const { actionStyle } = style

    function handleMessageChange(e) {
        setMessageInput(e.target.value)

        if (e.target.value && !isDebounced) {
            setIsDebounced(true)
            ws.current?.send(JSON.stringify({ type: 'typing', username: userRef.current }))
        }

        clearTimeout(timeoutIdRef.current)

        timeoutIdRef.current = setTimeout(() => {
            ws.current?.send(JSON.stringify({ type: 'stoppedTyping', username: userRef.current }))
            setIsDebounced(false)
        }, 1000)
    }

    useEffect(() => {
        const currentWS = ws.current
        const currentUserRef = userRef.current
        return () => {
            currentWS?.send(JSON.stringify({ type: 'stoppedTyping', username: currentUserRef }))
            setIsDebounced(false)
            setMessageInput('')

            if (timeoutIdRef.current) {
                clearTimeout(timeoutIdRef.current)
            }
        }
    }, [currentChatroomId, ws, userRef])

    async function handleMessageSubmit(e) {
        e.preventDefault()

        const data = {
            type: 'chat',
            chatroomId: currentChatroomId,
            senderId: user.id,
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
            <div>
                <input onChange={handleMessageChange} value={messageInput} type="text" placeholder="Message" />
                <input type="submit" value={`>`} />
            </div>
            {
                errorMessage ? errorMessage : null
            }
        </form>
    )
}