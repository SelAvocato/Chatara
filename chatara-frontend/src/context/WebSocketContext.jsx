import { useRef, useEffect, createContext, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useApi } from "../hooks/useApi";
import { useChatroom } from "../hooks/useChatroom";
import { useCallback } from "react";
import { useMemo } from "react";
import { useHandleTokenExpiration } from "../hooks/useHandleTokenExpiration";

const WebSocketContext = createContext(null)
const WebsocketActionsContext = createContext(null)

export function WebSocketProvider({ children }) {
    const wsRef = useRef(null)
    const lastMessageRef = useRef(null)
    const [isTyping, setIsTyping] = useState(false)
    const [latestMessageWs, setLatestMessageWs] = useState(null)
    const [isReconnecting, setIsReconnecting] = useState(false)
    const [userTyping, setUserTyping] = useState(null)
    const [currentChatroomId, setCurrentChatroomId] = useState(JSON.parse(localStorage.getItem('recentChatroomId')) || null)
    const [startChat, setStartChat] = useState('')
    const [chatMessages, setChatMessages] = useState([])
    const { user, accessToken, setUser, setAccessToken } = useAuth()
    const { savedChatroomId, getChatroomInfo } = useChatroom()
    const api = useApi()
    const handleTokenExpiration = useHandleTokenExpiration()

    const baseUrl = import.meta.env.VITE_API_BASE_URL

    useEffect(() => {
        if (!accessToken) return
        wsRef.current = new WebSocket(`ws://localhost:3000?token=${accessToken}`)

        wsRef.current.onopen = () => {
            console.log('connected')
        }

        wsRef.current.onmessage = async (event) => {
            try {
                const parsed = JSON.parse(event.data)
                console.log('parsed data: ', parsed)

                switch (parsed.type) {
                    case 'chat':
                        setChatMessages(prev => [...prev, parsed])
                        setLatestMessageWs(parsed)
                        lastMessageRef.current = parsed
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
                    case 'notification':
                        setLatestMessageWs(parsed)
                        break
                    case 'editMessage':
                        setChatMessages(prev => prev.map(msg =>
                            msg.message_id === parsed.message_id
                                ? { ...msg, message_text: parsed.message_text, is_edited: 1 }
                                : msg
                        ))
                        if (parsed.message_id === lastMessageRef.current?.message_id) {
                            setLatestMessageWs(parsed)
                        }
                        break
                    case 'deleteMessage':
                        setChatMessages(prev => prev.map(msg =>
                            msg.message_id === parsed.message_id
                                ? { ...msg, message_text: parsed.message_text, is_deleted: 1 }
                                : msg
                        ))
                        if (parsed.message_id === lastMessageRef.current?.message_id) {
                            setLatestMessageWs(parsed)
                        }
                        break
                    case 'expiredAccessToken':
                        // wsRef.current.send({ type: 'reconnect' })
                        if (isReconnecting) return
                        try {
                            setIsReconnecting(true)
                            console.log('Expired access token. Reconnecting...')
                            const res = await fetch(`${baseUrl}/auth/refresh`, {
                                method: 'POST',
                                credentials: 'include'
                            })
                            if (res.status === 401) {
                                handleTokenExpiration()
                                return
                            }
                            const data = await res.json()
                            if (!res.ok) return console.log(data.message)
                            setUser(data.user)
                            setAccessToken(data.accessToken)
                        } catch (e) {
                            console.log(e)
                        } finally {
                            setIsReconnecting(false)
                        }
                        break
                    default:
                        break
                }
            }
            catch (e) {
                console.log('this is the message', e.message)
            }
        }

        wsRef.current.onerror = () => {
            console.log('Something went wrong')
        }

        wsRef.current.onclose = () => {
            console.log('Goodbye')
        }

        return () => wsRef.current.close()
    }, [accessToken, handleTokenExpiration, isReconnecting, setUser, setAccessToken, baseUrl])

    const openChat = useCallback(async (chatroomId) => {
        localStorage.setItem('recentChatroomId', chatroomId)
        setCurrentChatroomId(chatroomId)
        getChatroomInfo(chatroomId)
        try {
            const data = await api.get(`/messages/${chatroomId}`)
            wsRef.current?.send(JSON.stringify({
                type: "join",
                chatroomId: chatroomId,
                userId: user.id
            }))
            if (data.status === 'empty') {
                setChatMessages([])
                setStartChat(data.message)
                return
            }
            setChatMessages(data.row.toReversed())
            lastMessageRef.current = data?.row?.at(-1)
        } catch (e) {
            console.log(e)
            setStartChat('Something went wrong')
        }
    }, [api, getChatroomInfo, user.id])

    const editMessage = useCallback((updatedMessage) => {
        try {
            wsRef.current?.send(JSON.stringify({ ...updatedMessage, type: 'editMessage' }))
        } catch (e) {
            console.log(e)
        }
    }, [])

    const deleteMessage = useCallback((unsentMessage) => {
        try {
            wsRef.current?.send(JSON.stringify(unsentMessage))
        } catch (e) {
            console.log(e)
        }
    }, [])

    useEffect(() => {
        async function refresh() {
            if (!savedChatroomId) return
            await openChat(savedChatroomId)
        }
        refresh()
    }, [savedChatroomId, openChat])

    const contextValue = useMemo(() => ({
        wsRef, openChat, currentChatroomId, startChat, chatMessages, latestMessageWs, isTyping, userTyping,
        editMessage, deleteMessage
    }), [openChat, currentChatroomId, startChat, chatMessages, latestMessageWs, isTyping, userTyping,
        editMessage, deleteMessage
    ])

    const chatBubbleContextValue = useMemo(() => ({
        editMessage, deleteMessage
    }), [editMessage, deleteMessage])

    return (
        <WebSocketContext value={contextValue} >
            <WebsocketActionsContext value={chatBubbleContextValue}>
                {children}
            </WebsocketActionsContext>
        </WebSocketContext>
    )
}

export { WebSocketContext, WebsocketActionsContext }