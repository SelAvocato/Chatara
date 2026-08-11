import { useState, useEffect, createContext, useMemo } from "react";
import { useChatroom } from "../hooks/useChatroom";

const ReplyContext = createContext(null)

export function ReplyProvider({ children }) {
    const { chatroom } = useChatroom()
    const [isReplying, setIsReplying] = useState(false)
    const [replyingMessageInfo, setReplyingMessageInfo] = useState(null)

    useEffect(() => {
        return () => {
            setIsReplying(false)
            setReplyingMessageInfo(null)
        }
    }, [chatroom])

    const values = useMemo(() => ({
        isReplying, setIsReplying, replyingMessageInfo, setReplyingMessageInfo
    }), [isReplying, setIsReplying, replyingMessageInfo, setReplyingMessageInfo])
    return <ReplyContext value={values}>
        {children}
    </ReplyContext>
}

export default ReplyContext