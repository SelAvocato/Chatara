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

export default function Chatroom() {
    const { main, chatroomsStyle, chatroomsListStyle, imgContainerStyle, chatroomsHeaderStyle } = style
    const api = useApi()
    const { isChatroomInfoOpened } = useChatroom()

    const [message, setMessage] = useState('')
    const [chatrooms, setChatrooms] = useState(null)
    const [searchedChatroom, setSearchedChatroom] = useState('')
    const [filteredChatrooms, setFilteredChatrooms] = useState(null)
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [hasOpenChat, setHasOpenChat] = useState(localStorage.getItem('recentChatroomId') !== null)

    useEffect(() => {
        async function getChatrooms() {
            try {
                const data = await api.get(`/chatrooms`)
                if (data.status !== 'ok') {
                    setMessage(data.message)
                    return
                }
                setChatrooms(data.chatrooms)
            } catch (e) {
                console.error(e)
                setMessage(e)
            }
        }

        getChatrooms()
    }, [api])

    useEffect(() => {
        if (!chatrooms || chatrooms.length === 0 || searchedChatroom.trim() === '') return

        function filterChatroom() {
            const validChatrooms = chatrooms.filter(chatroom => chatroom.name.includes(searchedChatroom))
            setFilteredChatrooms(validChatrooms)
        }
        filterChatroom()
    }, [searchedChatroom, chatrooms])

    return (
        <div className={main}>
            <div className={chatroomsStyle}>
                <div className={chatroomsHeaderStyle}>
                    <h2>Chatrooms</h2>
                    <div className={imgContainerStyle}>
                        <img onClick={() => setIsCreatingChatroom(true)} src={addCircle} alt="Add Circle" />
                    </div>
                </div>
                <div className={chatroomsListStyle}>
                    <SearchChatroom searchedChatroom={searchedChatroom} setSearchedChatroom={setSearchedChatroom} />
                    {
                        searchedChatroom !== '' && filteredChatrooms
                            ? filteredChatrooms.length === 0
                                ? <p>No chatrooms found</p>
                                : filteredChatrooms.map(filteredChatroom =>
                                    <ChatroomList key={filteredChatroom.id} chatroom={filteredChatroom} hasOpenChat={hasOpenChat} setHasOpenChat={setHasOpenChat} />
                                )

                            : chatrooms && chatrooms.length > 0
                                ? chatrooms.map(chatroom =>
                                    <ChatroomList key={chatroom.id} chatroom={chatroom} hasOpenChat={hasOpenChat} setHasOpenChat={setHasOpenChat} />
                                )
                                : message
                    }
                </div>

                {isCreatingChatroom && < CreateChatroom setIsCreatingChatroom={setIsCreatingChatroom} />}
            </div>
            {hasOpenChat && < ChatParent />}
            {isChatroomInfoOpened && <ChatroomInfo />}
        </div >
    )
}