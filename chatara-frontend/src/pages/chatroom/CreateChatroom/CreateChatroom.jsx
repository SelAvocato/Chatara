import { useState } from "react"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import style from "./CreateChatroom.module.css"

export default function CreateChatroom({ setIsCreatingChatroom }) {
    const api = useApi()
    const { user } = useAuth()
    const { formContainer, closeBtnStyle } = style
    const [errorMessage, setErrorMessage] = useState(null)
    const [memberCount, setMemberCount] = useState(1)

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const usernames = formData.getAll('username')
        if (usernames.includes(user.username)) {
            setErrorMessage(`You don't need to include your name`)
            return
        }
        const entries = Object.fromEntries(formData.entries())
        const chatroomInfo = {
            chatroomName: entries.chatroomName,
            username: usernames
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
                <div>
                    {
                        Array.from({ length: memberCount }).map((_member, i) =>
                            <div key={i}>
                                <input name='username' type="text" placeholder='Participant Name' />
                            </div>
                        )
                    }
                    <input type="button" onClick={() => setMemberCount(prev =>
                        memberCount === 1
                            ? prev
                            : prev - 1
                    )} value={'x'} />
                    <input type="button" onClick={() => setMemberCount(prev => prev + 1)} value={'+'} />
                </div>
                <input type="submit" />
                {errorMessage && errorMessage}
            </form>
        </div>
    )
}