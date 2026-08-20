import { useState, useEffect, createContext, useMemo, useCallback } from "react";
import { useApi } from "../hooks/useApi";

const ChatroomContext = createContext(null)

export function ChatroomProvider({ children }) {
    const api = useApi()

    //inside chatroom should have its id, image, name and theme and I can return it as just chatroom instead of returning chatroom id, name and theme
    const [chatroom, setChatroom] = useState(null)
    const [members, setMembers] = useState(null)
    const [isChatroomInfoOpened, setIsChatroomInfoOpened] = useState(false)
    const getChatroomId = localStorage.getItem('recentChatroomId')
    const savedChatroomId = getChatroomId === 'undefined' ? localStorage.setItem('recentChatroomId', JSON.parse(null)) : JSON.parse(getChatroomId)


    const getChatroomInfo = useCallback(async (chatroomId) => {
        try {
            const data = await api.get(`/chatroom/${chatroomId}`)
            if (!data.chatroom || !data.members) {
                return
            }
            setChatroom(data.chatroom)
            setMembers(data.members)
        } catch (e) {
            console.error(e)
        }
    }, [api])

    useEffect(() => {
        async function refresh() {
            if (!savedChatroomId) return
            await getChatroomInfo(savedChatroomId)
        }
        refresh()
    }, [getChatroomInfo, savedChatroomId])

    const leaveChatroom = useCallback(async (setErrorMessage) => {
        if (!chatroom) return
        try {
            await api.post(`/chatroom/leave/${chatroom?.id}`)
        } catch (e) {
            setErrorMessage(e.message)
        }
    }, [chatroom, api])

    const renameChatroom = useCallback(async (newChatroomName, setErrorMessage) => {
        if (!chatroom) return
        try {
            await api.put(`/chatroom/rename/${chatroom?.id}`, { newChatroomName })
        } catch (e) {
            setErrorMessage(e.message)
            return 'error'
        }
    }, [chatroom, api])

    const contextValue = useMemo(() => ({
        savedChatroomId, getChatroomInfo, leaveChatroom, renameChatroom, chatroom, setChatroom, members, isChatroomInfoOpened, setIsChatroomInfoOpened
    }), [savedChatroomId, getChatroomInfo, leaveChatroom, renameChatroom, chatroom, setChatroom, members, isChatroomInfoOpened, setIsChatroomInfoOpened])

    return <ChatroomContext value={contextValue}>
        {children}
    </ChatroomContext>
}

export default ChatroomContext