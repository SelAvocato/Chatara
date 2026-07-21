import { useEffect, useRef, useState } from "react"
import { useApi } from "../../../hooks/useApi"
import { useAuth } from "../../../hooks/useAuth"
import style from "./CreateChatroom.module.css"
import userProfile from '/icons/pfp.svg'

export default function CreateChatroom({ setIsCreatingChatroom }) {
    const api = useApi()
    const { user } = useAuth()
    const { formContainer, closeBtnStyle, formStyle, chatroomNameStyle, memberContainerStyle, userProfileContainerStyle, userRowStyle,
        buttonsContainerStyle, usernameContainerStyle, usernameStyle, filteredUsersContainerStyle, filteredUserContainerStyle,
        filteredUserImageContainer, filteredUsername, noUsersFoundStyle, errorMessageStyle, footerContainerStyle } = style
    const focusLastMember = useRef(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [memberCount, setMemberCount] = useState(1)
    const [memberUsername, setMemberUsername] = useState('')
    const [focusedUser, setFocusedUser] = useState(null)
    const [filteredUsers, setFilteredUsers] = useState(null)
    const [selectedMembers, setSelectedMembers] = useState([])
    const isInputEmpty = memberUsername === ''

    useEffect(() => {
        const lastMemberContainer = focusLastMember.current
        if (!lastMemberContainer) return
        lastMemberContainer.scrollIntoView({ behavior: 'smooth' })
    }, [memberCount])

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const usernames = formData.getAll('username')
        if (usernames.length > 1 && usernames.includes('')) {
            setErrorMessage(`Please remove empty input fields`)
            return
        }
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

    useEffect(() => {
        const controller = new AbortController()

        async function getFilteredUsers() {
            if (!memberUsername) {
                setFilteredUsers([])
                return
            }

            try {
                setIsLoading(true)
                const data = await api.get(`/users/filter?username=${memberUsername}`, {
                    signal: controller.signal
                })
                if (data.users.length === 0) {
                    setFilteredUsers([])
                    return
                }
                setFilteredUsers(data.users)
            } catch (e) {
                if (e.name === 'AbortError') return
                console.error(e)
            } finally {
                setIsLoading(false)
            }
        }
        getFilteredUsers()

        return () => controller.abort()

    }, [memberUsername, api])
    console.log('length of things', selectedMembers.length + 1 - filteredUsers?.length)
    console.log('selected Members', selectedMembers)
    return (
        <div className={formContainer}>
            <div className={formStyle}>
                <button className={closeBtnStyle} onClick={() => setIsCreatingChatroom(false)}>x</button>
                <form onSubmit={handleSubmit}>
                    <input className={chatroomNameStyle} name='chatroomName' type="text" placeholder='Chatroom Name' autoComplete='off' />
                    <div className={memberContainerStyle}>
                        {
                            Array.from({ length: memberCount }).map((_member, i) => {
                                const isRowSelected = selectedMembers.some(member => member.i === i)

                                return (
                                    <div className={userRowStyle} key={i} ref={focusLastMember}>
                                        <div className={userProfileContainerStyle}>
                                            <img src={userProfile} alt="User Profile" />
                                        </div>
                                        <div className={usernameContainerStyle}>
                                            {
                                                focusedUser === i
                                                    ? <>
                                                        <input className={usernameStyle} name='username' type="text" placeholder='Participant Name' autoComplete='off' value={memberUsername} onChange={(e) => {
                                                            setSelectedMembers(prev => prev.filter(member => member.i !== i))
                                                            setMemberUsername(e.target.value)
                                                        }} />
                                                        {
                                                            !isInputEmpty && !isRowSelected
                                                                ? <div className={filteredUsersContainerStyle}>
                                                                    {
                                                                        isLoading
                                                                            ? <p>Loading...</p>
                                                                            : (() => {
                                                                                const validUsers = filteredUsers ? filteredUsers.filter(filteredUser => {
                                                                                    const isCurrentUser = filteredUser.username === user.username;
                                                                                    const isAlreadySelected = selectedMembers.some(member => member.id === filteredUser.id);
                                                                                    return !isCurrentUser && !isAlreadySelected;
                                                                                }) : [];

                                                                                if (validUsers.length > 0) {
                                                                                    return validUsers.map(filteredUser => (
                                                                                        <div className={filteredUserContainerStyle} key={filteredUser.id}
                                                                                            onClick={() => {
                                                                                                setSelectedMembers(prev => [...prev, { i, id: filteredUser.id }]);
                                                                                                setMemberUsername(filteredUser.username);
                                                                                            }}>
                                                                                            <div className={filteredUserImageContainer}>
                                                                                                <img src={userProfile} alt={`${filteredUser.username}'s profile picture`} />
                                                                                            </div>
                                                                                            <p className={filteredUsername}>{filteredUser.username}</p>
                                                                                        </div>
                                                                                    ));
                                                                                }

                                                                                return <p className={noUsersFoundStyle}>No users found</p>;
                                                                            })()
                                                                    }
                                                                </div>
                                                                : null
                                                        }

                                                    </>
                                                    : <input className={usernameStyle} name='username' type="text" placeholder='Participant Name' autoComplete='off'
                                                        onFocus={(e) => {
                                                            setMemberUsername(e.target.value)
                                                            setFocusedUser(i)
                                                        }} />
                                            }
                                        </div>
                                        {
                                            i === memberCount - 1
                                            && <div className={buttonsContainerStyle}>
                                                <input type="button" onClick={() => {
                                                    setMemberCount(prev =>
                                                        memberCount === 1
                                                            ? prev
                                                            : prev - 1
                                                    )
                                                    setSelectedMembers(prev => prev.filter(selectedMember => selectedMember.i !== i))

                                                }} value={'x'} hidden={memberCount === 1} />
                                                <input type="button" onClick={() => setMemberCount(prev => prev + 1)} value={'+'} hidden={!isRowSelected} />
                                            </div>
                                        }
                                    </div>)
                            })
                        }
                    </div>
                    <div className={footerContainerStyle}>
                        {errorMessage && <p className={errorMessageStyle}>{errorMessage}</p>}
                        <input type="submit" value={'Create'} />
                    </div>
                </form>
            </div>
        </div>
    )
}