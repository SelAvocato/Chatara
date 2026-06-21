import { useEffect, useRef } from "react"
import ChatHeader from "../ChatHeader/ChatHeader"
import ChatMessageActions from "../ChatMessageActions/ChatMessageActions"
import TypingIndicator from "../TypingIndicator/TypingIndicator"
import style from './ChatParent.module.css'
import { useAuth } from "../../../hooks/useAuth"

export default function ChatParent({ ws, chatMessages, isTyping, startChat, currentChatroomId, userTyping }) {
    const { user } = useAuth()
    const lastMessageRef = useRef(null)
    const { startChatStyle, chatBodyStyle, chatMessagesStyle, chat, chatBubble, sent, received, chatParent } = style

    function focusEndChat() {
        lastMessageRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        focusEndChat()
    }, [chatMessages, isTyping])

    return (
        <div className={chatParent}>
            <ChatHeader />
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
                <ChatMessageActions currentChatroomId={currentChatroomId} ws={ws} />
            </div>
        </div>
    )
}