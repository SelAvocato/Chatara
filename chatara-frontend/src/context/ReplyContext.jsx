import { useState, useEffect, createContext, useMemo, useCallback } from "react";
import { useChatroom } from "../hooks/useChatroom";
import { useWebsocket } from "../hooks/useWebsocket";

const ReplyContext = createContext(null)

export function ReplyProvider({ children }) {
    const { chatroom } = useChatroom()
    const { repliedMessages } = useWebsocket()
    const [isReplying, setIsReplying] = useState(false)
    const [replyingMessageInfo, setReplyingMessageInfo] = useState(null)


    useEffect(() => {
        return () => {
            setIsReplying(false)
            setReplyingMessageInfo(null)
        }
    }, [chatroom])

    const getRepliedMessageInfo = useCallback((messageId) => {
        const repliedMessage = repliedMessages.filter(messageInfo => messageInfo.message_id === messageId)
        return repliedMessage[0]
    }, [repliedMessages])

    const values = useMemo(() => ({
        isReplying, setIsReplying, replyingMessageInfo, setReplyingMessageInfo, getRepliedMessageInfo
    }), [isReplying, setIsReplying, replyingMessageInfo, setReplyingMessageInfo, getRepliedMessageInfo])
    return <ReplyContext value={values}>
        {children}
    </ReplyContext>
}

export default ReplyContext