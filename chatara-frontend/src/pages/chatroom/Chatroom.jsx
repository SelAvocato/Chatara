import { useState, useEffect } from "react"
import { useApi } from "../../hooks/useApi"
import ChatParent from "./ChatParent/ChatParent"
import style from "./Chatroom.module.css"
import addCircle from '/icons/add_circle.svg'
import CreateChatroom from "./CreateChatroom/CreateChatroom"
import SearchChatroom from "./SearchChatroom/SearchChatroom"
import ChatroomList from "./ChatroomList/ChatroomList"
import ChatroomInfo from "./ChatroomInfo/ChatroomInfo"
import { useChatroom } from "../../hooks/useChatroom"
import { useWebsocket } from "../../hooks/useWebsocket"
import { useRef } from "react"

export default function Chatroom() {
    const { main, chatroomsStyle, chatroomsListStyle, imgContainerStyle, chatroomsHeaderStyle } = style
    const api = useApi()
    const { chatroom, setChatroom, isChatroomInfoOpened } = useChatroom()
    const { newChatroom, latestMessageWs, editedChatroomImage, newChatroomName } = useWebsocket()
    const [message, setMessage] = useState('')
    const [chatrooms, setChatrooms] = useState(null)
    const [searchedChatroom, setSearchedChatroom] = useState('')
    const [filteredChatrooms, setFilteredChatrooms] = useState(null)
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [hasOpenChat, setHasOpenChat] = useState(localStorage.getItem('recentChatroomId') !== null && localStorage.getItem('recentChatroomId') !== undefined)
    const [eldestChatroomTimeStamp, setEldestChatroomTimestamp] = useState(null)
    const [isRequestingChatrooms, setIsRequestingChatrooms] = useState(false)
    const chatroomListBottomRef = useRef(null)
    const isFetchingChatrooms = useRef(false)
    const chatroomsListRef = useRef(null)

    useEffect(() => {
        return () => {
            setFilteredChatrooms(null)
            setHasOpenChat(false)
            setIsCreatingChatroom(false)
            setMessage('')
            setSearchedChatroom('')
            localStorage.setItem('recentChatroomId', null)
        }
    }, [])

    useEffect(() => {
        async function getChatrooms() {
            try {
                const data = await api.get(`/chatrooms?timestamp=`)
                if (data.status !== 'ok') {
                    setMessage(data?.message)
                    return
                }
                setChatrooms(data?.chatrooms)

                const eldestChatroom = data.chatrooms.at(-1)
                const createdAtToDate = new Date(eldestChatroom?.created_at)
                const sentAtToDate = new Date(eldestChatroom?.sent_at)
                setEldestChatroomTimestamp(createdAtToDate > sentAtToDate ? eldestChatroom?.created_at : eldestChatroom?.sent_at)
            } catch (e) {
                console.error(e)
                setMessage(e)
            }
        }

        getChatrooms()
    }, [api])

    useEffect(() => {
        const chatroomListBottom = chatroomListBottomRef.current
        const observer = new IntersectionObserver(([entry]) => {
            setIsRequestingChatrooms(entry.isIntersecting)
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 1
        })

        if (chatroomListBottom) {
            observer.observe(chatroomListBottom)
        }

        return () => observer.unobserve(chatroomListBottom)
    }, [chatroomListBottomRef])

    useEffect(() => {
        if (!isRequestingChatrooms || isFetchingChatrooms.current || !eldestChatroomTimeStamp) return
        const controller = new AbortController()

        async function getMoreChatrooms() {
            isFetchingChatrooms.current = true
            try {
                const data = await api.get(`/chatrooms?timestamp=${eldestChatroomTimeStamp}`, {
                    signal: controller.signal
                })
                const oldChatrooms = data.chatrooms
                if (oldChatrooms.length === 0) return
                const eldestChatroom = oldChatrooms.at(-1)
                const createdAtToDate = new Date(eldestChatroom?.created_at)
                const sentAtToDate = new Date(eldestChatroom?.sent_at)
                setEldestChatroomTimestamp(createdAtToDate > sentAtToDate ? eldestChatroom?.created_at : eldestChatroom?.sent_at)
                setChatrooms(prev => [...prev, ...oldChatrooms])
            } catch (e) {
                if (e.name === 'AbortError') return
                console.error(e)
            } finally {
                isFetchingChatrooms.current = false
            }
        }
        getMoreChatrooms()

        return () => controller.abort()
    }, [isRequestingChatrooms, api, eldestChatroomTimeStamp])

    useEffect(() => {
        if (!newChatroom) return
        function prependNewChatroom() {
            setChatrooms(prev => [newChatroom, ...prev])
        }
        prependNewChatroom()
    }, [newChatroom])

    useEffect(() => {
        if (!chatrooms || chatrooms.length === 0 || searchedChatroom.trim() === '') return

        function filterChatroom() {
            const validChatrooms = chatrooms.filter(chatroom => chatroom.name.includes(searchedChatroom))
            setFilteredChatrooms(validChatrooms)
        }
        filterChatroom()
    }, [searchedChatroom, chatrooms])

    useEffect(() => {
        if (!latestMessageWs) return
        const updateChatrooms = () => setChatrooms(prev => [...prev.filter(chatroom => chatroom.id === latestMessageWs.chatroom_id), ...prev.filter(chatroom => chatroom.id !== latestMessageWs.chatroom_id)])
        updateChatrooms()
    }, [latestMessageWs])

    useEffect(() => {
        if (!editedChatroomImage) return
        function modifyUpdatedChatroom() {
            setChatrooms(prev => prev.map(chatroom =>
                chatroom.id === editedChatroomImage.id
                    ? { ...chatroom, chatroom_img_url: editedChatroomImage.chatroom_img_url }
                    : chatroom
            ))
            if (chatroom?.id === editedChatroomImage?.id) {
                setChatroom(prev => ({ ...prev, chatroom_img_url: editedChatroomImage.chatroom_img_url }))
            }
        }
        modifyUpdatedChatroom()
    }, [editedChatroomImage, chatroom?.id, setChatroom])

    useEffect(() => {
        if (!newChatroomName) return
        function displayRenamedChatroom() {
            setChatrooms(prev => prev.map(chatroom =>
                chatroom.id === newChatroomName.id
                    ? { ...chatroom, name: newChatroomName?.name }
                    : chatroom
            ))
            if (chatroom?.id === newChatroomName?.id) {
                setChatroom(prev => ({ ...prev, name: newChatroomName?.name }))
            }
        }
        displayRenamedChatroom()
    }, [newChatroomName, chatroom?.id, setChatroom])

    return (
        <div className={main}>
            <div className={chatroomsStyle}>
                <div className={chatroomsHeaderStyle}>
                    <h2>Chatrooms</h2>
                    <div className={imgContainerStyle}>
                        <img onClick={() => setIsCreatingChatroom(true)} src={addCircle} alt="Add Circle" />
                    </div>
                </div>
                <div className={chatroomsListStyle} ref={chatroomsListRef}>
                    <SearchChatroom searchedChatroom={searchedChatroom} setSearchedChatroom={setSearchedChatroom} />
                    <div style={{ marginTop: '3rem', width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {
                            searchedChatroom !== '' && filteredChatrooms
                                ? filteredChatrooms.length === 0
                                    ? <p>No chatrooms found</p>
                                    : filteredChatrooms.map(filteredChatroom =>
                                        <ChatroomList key={filteredChatroom.id} chatroom={filteredChatroom} hasOpenChat={hasOpenChat} setHasOpenChat={setHasOpenChat} />
                                    )

                                : chatrooms && chatrooms.length > 0
                                    ? chatrooms.map(chatroom =>
                                        <ChatroomList key={chatroom?.id} chatroom={chatroom} hasOpenChat={hasOpenChat} setHasOpenChat={setHasOpenChat} />
                                    )
                                    : message
                        }
                    </div>
                    <div style={{ height: '1px' }} ref={chatroomListBottomRef}></div>
                </div>

                {isCreatingChatroom && < CreateChatroom setIsCreatingChatroom={setIsCreatingChatroom} />}
            </div>
            {hasOpenChat && < ChatParent />}
            {isChatroomInfoOpened && <ChatroomInfo />}
        </div >
    )
}