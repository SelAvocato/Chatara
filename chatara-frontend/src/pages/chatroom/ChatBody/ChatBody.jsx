import { useEffect, useRef, useState } from 'react'
import TypingIndicator from '../TypingIndicator/TypingIndicator'
import ChatMessageActions from '../ChatMessageActions/ChatMessageActions'
import { useWebsocket } from '../../../hooks/useWebsocket'
import style from './ChatBody.module.css'
import ChatBubble from '../ChatBubble/ChatBubble.jsx'
import { useApi } from '../../../hooks/useApi.js'

export default function ChatBody() {
    const lastMessageRef = useRef(null)
    const [currentDate, setCurrentDate] = useState(() => Date.now());
    const [isRequestingMessages, setIsRequestingMessages] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const { startChat, chatMessages, isTyping, userTyping, firstMessage, firstMessageIndex, setFirstMessageIndex, setChatMessages } = useWebsocket()
    const api = useApi()
    const { startChatStyle, chatBodyStyle, chatMessagesStyle, chat } = style
    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            setIsRequestingMessages(entry.isIntersecting)
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 1
        })

        const currentTarget = firstMessage
        if (currentTarget) {
            observer.observe(currentTarget)
        }
        console.log('this is the current target', currentTarget)

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget)
            }
        }
    }, [firstMessage])

    useEffect(() => {
        if (!isRequestingMessages) return
        async function getMoreMessages() {
            setIsLoading(true)
            try {
                const data = await api.get(`/messages/extra/${firstMessageIndex.chatroom_id}?message_id=${firstMessageIndex.message_id}`)
                if (data.messages.length === 0) return
                const reversedData = data.messages.toReversed()
                console.log('this one should be the new first', reversedData[0])
                setFirstMessageIndex(reversedData[0])
                console.log('this is the new chat messages', [...reversedData, ...chatMessages])
                console.log('this is the new message id', firstMessageIndex)
                setChatMessages(prev => [...reversedData, ...prev])
            } catch (e) {
                console.log(e)
            } finally {
                setIsLoading(false)
                console.log('done')
            }
        }
        getMoreMessages()
    }, [isRequestingMessages, firstMessageIndex, api, setFirstMessageIndex, setChatMessages, chatMessages])

    function focusEndChat() {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        focusEndChat()
    }, [chatMessages, isTyping])

    useEffect(() => {
        const timer = () => setInterval(() => {
            setCurrentDate(Date.now())
        }, 60000)
        timer()

        return () => clearInterval(timer)
    }, [])



    return (
        <div className={chatBodyStyle}>
            <div className={chat}>
                <div className={chatMessagesStyle}>
                    {isLoading && <p>Loading...</p>}
                    {
                        chatMessages && chatMessages.length > 0
                            ? chatMessages.map((chatMessage, i) =>
                                <ChatBubble key={chatMessage?.message_id} chatMessage={chatMessage} prevChatMessage={chatMessages[i - 1]} nextChatMessage={chatMessages[i + 1]} currentDate={currentDate} />
                            )
                            : <p className={startChatStyle}>{startChat}</p>
                    }
                    {
                        isTyping && <TypingIndicator userTyping={userTyping} />
                    }
                    <div ref={lastMessageRef} />
                </div>
            </div>
            <ChatMessageActions />
        </div>
    )
}