import { useState, useEffect } from "react"
import { useAuth } from "../../hooks/useAuth"
import { useApi } from "../../hooks/useApi"
import ChatParent from "./ChatParent/ChatParent"
import style from "./Chatroom.module.css"
import addCircle from '/icons/add_circle.svg'
import CreateChatroom from "./CreateChatroom/CreateChatroom"
import ChatroomList from "./ChatroomList/ChatroomList"

export default function Chatroom() {
    const [message, setMessage] = useState('')
    const [chatrooms, setChatrooms] = useState([])
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [hasOpenChat, setHasOpenChat] = useState(false)

    const { user } = useAuth()
    const api = useApi()
    const { main, chatroomsStyle, chatroomsListStyle, imgContainerStyle, chatroomsHeaderStyle } = style

    useEffect(() => {
        async function getChatrooms() {
            try {
                const res = await api.get(`/chatrooms/${user?.id}`)
                if (res.status !== 'ok') {
                    setMessage(res.message)
                }
                setChatrooms(res.chatrooms)

            } catch (e) {
                console.error(e)
                setMessage(e)
            }
        }

        getChatrooms()
    }, [user, api])

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
                    {
                        chatrooms && chatrooms.length > 0
                            ? chatrooms.map((chatroom) =>
                                <ChatroomList key={chatroom.id} chatroom={chatroom} setHasOpenChat={setHasOpenChat} />
                            )
                            : message
                    }
                </div>

                {isCreatingChatroom && < CreateChatroom setIsCreatingChatroom={setIsCreatingChatroom} />}
            </div>
            {hasOpenChat && < ChatParent />}
        </div >
    )
}