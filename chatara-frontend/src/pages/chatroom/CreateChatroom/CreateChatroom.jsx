import { useState } from "react"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import style from "./CreateChatroom.module.css"

export default function CreateChatroom({ setIsCreatingChatroom }) {
    const { user } = useAuth()
    const api = useApi()
    const [errorMessage, setErrorMessage] = useState(null)
    const { formContainer, closeBtnStyle } = style

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const entries = Object.fromEntries(formData.entries())
        const chatroomInfo = {
            chatroomName: entries.chatroomName,
            username: entries.username,
            userId: user.id
        }

        try {
            const data = await api.post('/chatrooms/create', chatroomInfo)
            if (data.status !== 'ok') return setErrorMessage(data.message)
            setIsCreatingChatroom(false)
        } catch (e) {
            console.error(e)
            return setErrorMessage(`Error: ${e || 'Something went wrong'}`)
        }

    }
    return (
        <div className={formContainer}>
            <button className={closeBtnStyle} onClick={() => setIsCreatingChatroom(false)}>x</button>
            <form onSubmit={handleSubmit}>
                <input name='chatroomName' type="text" placeholder='Chatroom Name' />
                <input name='username' type="text" placeholder='Participant Name' />
                <input type="submit" />
                {
                    errorMessage
                        ? errorMessage
                        : null
                }
            </form>
        </div>
    )
}