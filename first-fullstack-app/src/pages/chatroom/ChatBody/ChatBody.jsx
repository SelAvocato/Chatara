import { useEffect, useRef } from 'react'
import TypingIndicator from '../TypingIndicator/TypingIndicator'
import ChatMessageActions from '../ChatMessageActions/ChatMessageActions'
import { useWebsocket } from '../../../hooks/useWebsocket'
import { useAuth } from '../../../hooks/useAuth'
import style from './ChatBody.module.css'

export default function ChatBody() {
    const { startChat, chatMessages, isTyping, userTyping } = useWebsocket()
    const { user } = useAuth()
    const lastMessageRef = useRef(null)
    const { startChatStyle, chatBodyStyle, chatMessagesStyle, chat, chatBubble, sent, received } = style


    function focusEndChat() {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        focusEndChat()
    }, [chatMessages, isTyping])

    return (
        <div className={chatBodyStyle}>
            <div className={chat}>
                <div className={chatMessagesStyle}>
                    {
                        chatMessages.length > 0
                            ? chatMessages.map(chatMessage =>
                                <div className={`${chatBubble} ${chatMessage.sender_id === user?.id ? sent : received}`} key={chatMessage.id} >
                                    <p>{chatMessage.message_text}</p>
                                </div>
                            )
                            : <p className={startChatStyle}>{startChat}</p>
                    }
                    {
                        isTyping ? <TypingIndicator userTyping={userTyping} /> : null
                    }
                </div>
                <div ref={lastMessageRef} />
            </div>
            <ChatMessageActions />
        </div>
    )
}