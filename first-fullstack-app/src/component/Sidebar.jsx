import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import { apiClient } from '../services/api'
import style from './Sidebar.module.css'

export default function Sidebar() {
    const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const { user, logout } = useAuth()
    const { formContainer } = style

    const navigate = useNavigate()

    function onLogout() {
        logout()
        navigate('/')
    }

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const entries = Object.fromEntries(formData.entries())
        const data = {
            chatroomName: entries.chatroomName,
            username: entries.username,
            userId: user.id
        }

        try {
            const res = await apiClient.post('/chatrooms/create', data)
            if (res.status !== 'ok') return setErrorMessage(res.message)
            setIsCreatingChatroom(false)
        } catch (e) {
            console.error(e)
            return setErrorMessage('Something went wrong')
        }

    }

    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
                <button onClick={() => setIsCreatingChatroom(true)}>Add Chatroom</button>
                {
                    isCreatingChatroom
                        ? <div className={formContainer}>
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
                        : null
                }
            </div>
            <div className="userStyle">
                {user.username}
            </div>
            <div onClick={onLogout}>
                <button>Logout</button>
            </div>
        </div>
    )
}