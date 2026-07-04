import { useRef, useEffect, createContext, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { useChatroom } from "../hooks/useChatroom";
import { useCallback } from "react";

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
    const wsRef = useRef(null)
    const [isTyping, setIsTyping] = useState(false)
    const [latestMessageWs, setLatestMessageWs] = useState(null)
    const [userTyping, setUserTyping] = useState(null)
    const [currentChatroomId, setCurrentChatroomId] = useState(localStorage.getItem('recentChatroomId') || null)
    const [startChat, setStartChat] = useState('')
    const [chatMessages, setChatMessages] = useState([])

    const { user, accessToken } = useAuth()
    const { savedChatroomId, getChatroomInfo } = useChatroom()
    const api = useApi()

    useEffect(() => {
        wsRef.current = new WebSocket(`ws://localhost:3000?token=${accessToken}`)

        wsRef.current.onopen = () => {
            console.log('connected')
        }

        wsRef.current.onmessage = (event) => {
            try {
                const parsed = JSON.parse(event.data)
                console.log('parsed data: ', parsed)

                switch (parsed.type) {
                    case 'chat':
                        setChatMessages(prev => [...prev, parsed])
                        setLatestMessageWs(parsed.message_text)
                        console.log('parsed chats', parsed)
                        break
                    case 'typing':
                        setUserTyping(parsed.username)
                        setIsTyping(true)
                        console.log('is typing')
                        break
                    case 'stoppedTyping':
                        setUserTyping(null)
                        setIsTyping(false)
                        console.log('stopped typing')
                        break
                }
            }
            catch (e) {
                console.log(e.message)
            }
        }

        wsRef.current.onerror = () => {
            console.log('Something went wrong')
        }

        wsRef.current.onclose = () => {
            console.log('Goodbye')
        }

        return () => wsRef.current.close()
    }, [accessToken])

    const openChat = useCallback(async (chatroomId) => {
        localStorage.setItem('recentChatroomId', chatroomId)
        setCurrentChatroomId(chatroomId)
        getChatroomInfo(chatroomId)
        try {
            const data = await api.get(`/messages/${chatroomId}`)
            wsRef.current.send(JSON.stringify({
                type: "join",
                chatroomId: chatroomId,
                userId: user.id
            }))
            if (data.status === 'empty') {
                setChatMessages([])
                setStartChat(data.message)
                return
            }
            console.log(data.row)
            setChatMessages(data.row)
        } catch (e) {
            console.error(e)
            setStartChat('Something went wrong')
        }
    }, [api, getChatroomInfo, user.id])
    
    useEffect(() => {
        async function refresh() {
            if (!savedChatroomId) return
            await openChat(savedChatroomId)
        }
        refresh()
    }, [savedChatroomId, openChat])

    return <WebSocketContext value={{ wsRef, openChat, currentChatroomId, startChat, chatMessages, latestMessageWs, isTyping, userTyping }} >
        {children}
    </WebSocketContext>
}

export default WebSocketContext