import { use } from "react";
import ChatroomContext from "../context/ChatroomContext";

export function useChatroom() {
    const chatroom = use(ChatroomContext)
    if (!chatroom) throw new Error('Error: useChatroom must be used inside ChatroomProvider')
    return chatroom
}