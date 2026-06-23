import { useEffect, useRef } from 'react'
import TypingIndicator from '../TypingIndicator/TypingIndicator'
import ChatMessageActions from '../ChatMessageActions/ChatMessageActions'
import { useWebsocket } from '../../../hooks/useWebsocket'
import style from './ChatBody.module.css'
import ChatBubble from '../ChatBubble/ChatBubble'

export default function ChatBody() {
    const lastMessageRef = useRef(null)
    const { startChat, chatMessages, isTyping, userTyping } = useWebsocket()
    const { startChatStyle, chatBodyStyle, chatMessagesStyle, chat } = style
    console.log('start chat', startChat)
    function focusEndChat() {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        focusEndChat()
        console.log('new chat messages', chatMessages)
        console.log('new chatmessages id', chatMessages[0])
    }, [chatMessages, isTyping])

    return (
        <div className={chatBodyStyle}>
            <div className={chat}>
                <div className={chatMessagesStyle}>
                    {
                        chatMessages && chatMessages.length > 0
                            ? chatMessages.map(chatMessage =>
                                <ChatBubble key={chatMessage.message_id} chatMessage={chatMessage} />
                            )
                            : <p className={startChatStyle}>{startChat}</p>
                    }
                    {
                        isTyping && <TypingIndicator userTyping={userTyping} />
                    }
                </div>
                <div ref={lastMessageRef} />
            </div>
            <ChatMessageActions />
        </div>
    )
}