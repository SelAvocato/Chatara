import { useEffect, useRef, useState } from "react"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import style from "./CreateChatroom.module.css"
import userProfile from '/icons/pfp.svg'

export default function CreateChatroom({ setIsCreatingChatroom }) {
    const api = useApi()
    const { user } = useAuth()
    const { formContainer, closeBtnStyle, formStyle, chatroomNameStyle, memberContainerStyle, userProfileContainerStyle, userRowStyle, buttonsContainerStyle,
        usernameStyle } = style
    const focusLastMember = useRef(null)
    const [errorMessage, setErrorMessage] = useState(null)
    const [memberCount, setMemberCount] = useState(1)

    useEffect(() => {
        const lastMemberContainer = focusLastMember.current
        if (!lastMemberContainer) return
        lastMemberContainer.scrollIntoView({ behavior: 'smooth' })
    }, [memberCount])

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
            <div className={formStyle}>
                <button className={closeBtnStyle} onClick={() => setIsCreatingChatroom(false)}>x</button>
                <form onSubmit={handleSubmit}>
                    <input className={chatroomNameStyle} name='chatroomName' type="text" placeholder='Chatroom Name' autoComplete='off' />
                    <div className={memberContainerStyle}>
                        {
                            Array.from({ length: memberCount }).map((_member, i) =>
                                <div className={userRowStyle} key={i} ref={focusLastMember}>
                                    <div className={userProfileContainerStyle}>
                                        <img src={userProfile} alt="User Profile" />
                                    </div>
                                    <input className={usernameStyle} name='username' type="text" placeholder='Participant Name' autoComplete='off' />
                                    {i === memberCount - 1 &&
                                        <div className={buttonsContainerStyle}>
                                            <input type="button" onClick={() => setMemberCount(prev =>
                                                memberCount === 1
                                                    ? prev
                                                    : prev - 1
                                            )} value={'x'} hidden={memberCount === 1} />
                                            <input type="button" onClick={() => setMemberCount(prev => prev + 1)} value={'+'} />
                                        </div>}
                                </div>
                            )
                        }
                    </div>
                    {errorMessage && <p>{errorMessage}</p>}
                    <input type="submit" value={'Create'} />
                </form>
            </div>
        </div>
    )
}