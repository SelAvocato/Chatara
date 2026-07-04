import { useState, useEffect } from "react"
import { useApi } from "../../hooks/useApi"
import ChatParent from "./ChatParent/ChatParent"
import style from "./Chatroom.module.css"
import addCircle from '/icons/add_circle.svg'
import CreateChatroom from "./CreateChatroom/CreateChatroom"
import ChatroomList from "./ChatroomList/ChatroomList"

export default function Chatroom() {
    const api = useApi()

    const [message, setMessage] = useState('')
    const [chatrooms, setChatrooms] = useState(null)
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [hasOpenChat, setHasOpenChat] = useState(false)

    const { main, chatroomsStyle, chatroomsListStyle, imgContainerStyle, chatroomsHeaderStyle } = style

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