import { useEffect, useRef, useState } from 'react'
import TypingIndicator from '../TypingIndicator/TypingIndicator'
import ChatMessageActions from '../ChatMessageActions/ChatMessageActions'
import { useWebsocket } from '../../../hooks/useWebsocket'
import style from './ChatBody.module.css'
import ChatBubble from '../ChatBubble/ChatBubble.jsx'

export default function ChatBody() {
    const lastMessageRef = useRef(null)
    const [currentDate, setCurrentDate] = useState(() => Date.now());
    const { startChat, chatMessages, isTyping, userTyping } = useWebsocket()
    const { startChatStyle, chatBodyStyle, chatMessagesStyle, chat } = style

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