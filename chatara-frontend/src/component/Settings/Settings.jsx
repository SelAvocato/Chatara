import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import style from './Settings.module.css'
import ProfilePictureForm from '../ProfilePictureForm/ProfilePictureForm'
import ProfilePicture from '../ProfilePicture/ProfilePicture'

export default function Settings() {
    const { user, setUser } = useAuth()
    const api = useApi()
    const { settingsStyle, headerStyle, pfpContainerStyle, usernameContainerStyle, passwordContainerStyle } = style

    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isChangingUsername, setIsChangingUsername] = useState(false)
    const [isChangingPfp, setIsChangingPfp] = useState(false)
    const [oldPassValue, setOldPassValue] = useState('')
    const [newPassValue, setNewPassValue] = useState('')
    const [newUsername, setNewUsername] = useState(user?.username)

    async function handleUsernameChange(e) {
        e.preventDefault()
        const trimmedUsername = newUsername.trim()
        if (user?.username === trimmedUsername || trimmedUsername === '') return
        try {
            const data = await api.put(`/users/username`, { newUsername })
            if (data.errorMessage) {
                console.error(data.errorMessage)
                return
            }
            setUser(prev => ({ ...prev, username: trimmedUsername }))
            setIsChangingUsername(false)
        } catch (e) {
            console.error(e)
        }
    }

    async function handlePassChange(e) {
        e.preventDefault()
        if (newPassValue.trim() === '' || oldPassValue.trim() === '') return
        try {
            const data = await api.put(`/users/password`, { oldPassword: oldPassValue, newPassword: newPassValue })
            if (!data.message) return
            console.log(data.message)
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <div className={settingsStyle}>
            <div className={headerStyle}>
                <div className={pfpContainerStyle}>
                    <ProfilePicture size={150} src={user?.pfp_url} />
                    {isChangingPfp
                        ? <ProfilePictureForm setIsChangingPfp={setIsChangingPfp} />
                        : <button onClick={() => setIsChangingPfp(true)}>Edit</button>
                    }
                </div>
                <div className={usernameContainerStyle}>
                    {isChangingUsername
                        ? <form onSubmit={handleUsernameChange}>
                            <input type="text" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
                            <input type="submit" />
                        </form>
                        : <>
                            <p>{user?.username}</p>
                            <button onClick={() => setIsChangingUsername(true)}>Edit</button>
                        </>
                    }

                </div>
            </div>
            <div className={passwordContainerStyle} >
                {isChangingPassword ?
                    <div>
                        <form onSubmit={handlePassChange}>
                            <div>
                                <label htmlFor="oldPassInput">Old password:</label>
                                <input id='oldPassInput' type="password" onChange={(e) => setOldPassValue(e.target.value)} value={oldPassValue} required autoComplete='off' />
                            </div>
                            <div>
                                <label htmlFor="newPassInput">New password:</label>
                                <input id='newPassInput' type="password" onChange={(e) => setNewPassValue(e.target.value)} value={newPassValue} required autoComplete='off' />
                            </div>
                            <input type="submit" value={'Confirm'} />
                            <input type='button' value={'Cancel'} onClick={() => {
                                setIsChangingPassword(false)
                                setNewPassValue('')
                                setOldPassValue('')
                            }} />
                        </form>
                    </div>
                    : <button onClick={() => setIsChangingPassword(true)}>Change Password</button>
                }
            </div>
        </div>
    )
}