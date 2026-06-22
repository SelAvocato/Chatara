import { useEffect, useRef } from 'react'
import TypingIndicator from '../TypingIndicator/TypingIndicator'
import ChatMessageActions from '../ChatMessageActions/ChatMessageActions'
import { useWebsocket } from '../../../hooks/useWebsocket'
import style from './ChatBody.module.css'
import ChatBubble from '../ChatBubble/ChatBubble'

export default function ChatBody() {
    const { startChat, chatMessages, isTyping, userTyping } = useWebsocket()
    const lastMessageRef = useRef(null)
    const { startChatStyle, chatBodyStyle, chatMessagesStyle, chat } = style


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
                        chatMessages && chatMessages.length > 0
                            ? chatMessages.map(chatMessage =>
                                <div key={chatMessage.message_id} >
                                    <ChatBubble chatMessage={chatMessage} />
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