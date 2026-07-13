import { useState, createContext } from "react";
import { useApi } from "../hooks/useApi";
import { useEffect } from "react";
import { useCallback } from "react";
import { useAuth } from "../hooks/useAuth";

const ChatroomContext = createContext(null)

export function ChatroomProvider({ children }) {
    const api = useApi()
    const { setUser, setAccessToken } = useAuth()

    //inside chatroom should have its id, name and theme and I can return it as just chatroom instead of returning chatroom id, name and theme
    const [chatroom, setChatroom] = useState(null)
    const [members, setMembers] = useState(null)
    const savedChatroomId = JSON.parse(localStorage.getItem('recentChatroomId')) || null

    const getChatroomInfo = useCallback(async (chatroomId) => {
        try {
            const data = await api.get(`/chatroom/${chatroomId}`)
            if (!data.chatroom || !data.members) {
                console.log(data.message)
                return
            }
            setChatroom(data.chatroom)
            setMembers(data.members)
        } catch (e) {
            console.error(e)
            setUser(null)
            setAccessToken(null)
        }
    }, [api, setUser, setAccessToken])

    useEffect(() => {
        async function refresh() {
            if (!savedChatroomId) return
            await getChatroomInfo(savedChatroomId)
        }
        refresh()
    }, [getChatroomInfo, savedChatroomId])

    return <ChatroomContext value={{ savedChatroomId, getChatroomInfo, chatroom, members }}>
        {children}
    </ChatroomContext>
}

export default ChatroomContext