import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import style from './Settings.module.css'
import pfp from '/icons/pfp.svg'

export default function Settings() {
    const { user } = useAuth()
    const api = useApi()
    const { settingsStyle, headerStyle, pfpContainerStyle, usernameContainerStyle, passwordContainerStyle } = style

    const [isEditing, setIsEditing] = useState(false)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isChangingUsername, setIsChangingUsername] = useState(false)
    const [isChangingPfp, setIsChangingPfp] = useState(false)
    const [oldPassValue, setOldPassValue] = useState('')
    const [newPassValue, setNewPassValue] = useState('')

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
                    <img src={pfp} alt="Profile Picture" />
                </div>
                <div className={usernameContainerStyle}>
                    <p>{user?.username}</p>
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