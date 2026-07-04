import { useState, createContext } from "react";
import { useApi } from "../hooks/useApi";

const ChatroomContext = createContext(null)

export function ChatroomProvider({ children }) {
    const api = useApi()

    //inside chatroom should have its id, name and theme and I can return it as just chatroom instead of returning chatroom id, name and theme
    const [chatroom, setChatroom] = useState(null)
    const [members, setMembers] = useState(null)

    async function getChatroomInfo(chatroomId) {
        try {
            console.log('chatroom id', chatroomId)
            const data = await api.get(`/chatroom/${chatroomId}`)
            if (!data.chatroom || !data.members) {
                console.log(data.message)
                return
            }
            console.log(data)
            setChatroom(data.chatroom)
            setMembers(data.members)
        } catch (e) {
            console.error(e)
        }
    }

    return <ChatroomContext value={{ getChatroomInfo, chatroom, members }}>
        {children}
    </ChatroomContext>
}

export default ChatroomContext