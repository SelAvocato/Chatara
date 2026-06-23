import { useRef, useEffect, createContext, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { apiClient } from "../services/api";

const WebSocketContext = createContext(null)

export function WebSocketProvider({ children }) {
    const wsRef = useRef(null)
    const [isTyping, setIsTyping] = useState(false)
    const [latestMessageWs, setLatestMessageWs] = useState(null)
    const [userTyping, setUserTyping] = useState(null)
    const [currentChatroomId, setCurrentChatroomId] = useState(null)
    const [startChat, setStartChat] = useState('')
    const [chatMessages, setChatMessages] = useState([])

    const { user } = useAuth()

    useEffect(() => {
        wsRef.current = new WebSocket('ws://localhost:3000')

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

    }, [])

    async function openChat(chatroomId) {
        setCurrentChatroomId(chatroomId)
        try {
            const res = await apiClient.get(`/messages/${chatroomId}`)
            wsRef.current.send(JSON.stringify({
                type: "join",
                chatroomId: chatroomId,
                userId: user.id
            }))
            console.log('sent join ws')
            if (res.status === 'empty') {
                setChatMessages([])
                return setStartChat(res.message)
            }
            console.log(res.row)
            return setChatMessages(res.row)
        } catch (e) {
            console.error(e)
            setStartChat('Something went wrong')
        }
    }

    return <WebSocketContext value={{ wsRef, openChat, currentChatroomId, startChat, chatMessages, latestMessageWs, isTyping, userTyping }} >
        {children}
    </WebSocketContext>
}

export default WebSocketContext