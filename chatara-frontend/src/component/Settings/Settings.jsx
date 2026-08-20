import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useApi } from '../../hooks/useApi'
import style from './Settings.module.css'
import ProfilePictureForm from '../ProfilePictureForm/ProfilePictureForm'
import Avatar from '../Avatar/Avatar'
import PasswordInput from '../PasswordInput/PasswordInput'

export default function Settings({ setHasOpenedSettings }) {
    const { user, setUser } = useAuth()
    const api = useApi()
    const { settingsStyle, closeButtonContainerStyle, headerStyle, pfpContainerStyle, profilePictureFormStyle, usernameContainerStyle,
        usernameInputStyle, changeUsernameActionsStyle, editBtnStyle, passwordContainerStyle, changePassFormContainerStyle,
        changePasswordActionsStyle, passwordErrorMessageStyle, changePasswordBtnStyle } = style

    const usernameInputRef = useRef(null)
    const [isChangingPassword, setIsChangingPassword] = useState(false)
    const [isChangingUsername, setIsChangingUsername] = useState(false)
    const [oldPassValue, setOldPassValue] = useState('')
    const [newPassValue, setNewPassValue] = useState('')
    const [newUsername, setNewUsername] = useState(user?.username)
    const [isValid, setIsValid] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)

    async function handleUsernameChange(e) {
        e.preventDefault()
        const trimmedUsername = newUsername.trim()
        if (user?.username === trimmedUsername || trimmedUsername === '') return
        try {
            await api.put(`/users/username`, { newUsername })
            setUser(prev => ({ ...prev, username: trimmedUsername }))
            setIsChangingUsername(false)
        } catch (e) {
            setErrorMessage(e.message)
        }
    }

    async function handlePassChange(e) {
        e.preventDefault()
        if (newPassValue.trim() === '' || oldPassValue.trim() === '') return
        try {
            await api.put(`/users/password`, { oldPassword: oldPassValue, newPassword: newPassValue })
            setIsChangingPassword(false)
            setOldPassValue('')
            setNewPassValue('')
            alert('Password successfully changed')
        } catch (e) {
            setErrorMessage(e.message)
        }
    }

    useEffect(() => {
        usernameInputRef?.current?.focus()
    }, [isChangingUsername])

    return (
        <div className={settingsStyle}>
            <div className={closeButtonContainerStyle}
                onClick={() => setHasOpenedSettings(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24" fill="none">
                    <path d="M20.7457 3.32851C20.3552 2.93798 19.722 2.93798 19.3315 3.32851L12.0371 10.6229L4.74275 3.32851C4.35223 2.93798 3.71906 2.93798 3.32854 3.32851C2.93801 3.71903 2.93801 4.3522 3.32854 4.74272L10.6229 12.0371L3.32856 19.3314C2.93803 19.722 2.93803 20.3551 3.32856 20.7457C3.71908 21.1362 4.35225 21.1362 4.74277 20.7457L12.0371 13.4513L19.3315 20.7457C19.722 21.1362 20.3552 21.1362 20.7457 20.7457C21.1362 20.3551 21.1362 19.722 20.7457 19.3315L13.4513 12.0371L20.7457 4.74272C21.1362 4.3522 21.1362 3.71903 20.7457 3.32851Z" fill="#0F0F0F" />
                </svg>
            </div>
            <div className={headerStyle}>
                <div className={pfpContainerStyle}>
                    <Avatar src={user?.pfp_url} />
                    <div className={profilePictureFormStyle}>
                        <ProfilePictureForm />
                    </div>
                </div>
                <div className={usernameContainerStyle}>
                    {isChangingUsername
                        ? <form onSubmit={handleUsernameChange}>
                            <input className={usernameInputStyle} type="text"
                                value={newUsername} onChange={(e) => setNewUsername(e.target.value)} ref={usernameInputRef} />
                            <div className={changeUsernameActionsStyle}>
                                <input type="submit" value={'Confirm'} />
                                <input type="reset" value={'Cancel'}
                                    onClick={() => {
                                        setNewUsername(user?.username)
                                        setIsChangingUsername(false)
                                    }} />
                            </div>
                            <p>{errorMessage && errorMessage}</p>
                        </form>
                        : <>
                            <p>{user?.username}</p>
                            <div className={editBtnStyle}
                                onClick={() => {
                                    setIsChangingUsername(true)
                                    setIsChangingPassword(false)
                                    setErrorMessage('')
                                    setNewPassValue('')
                                    setOldPassValue('')
                                }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="800px" height="800px" viewBox="0 0 24 24">
                                    <title />
                                    <g id="Complete">
                                        <g id="edit">
                                            <g>
                                                <path d="M20,16v4a2,2,0,0,1-2,2H4a2,2,0,0,1-2-2V6A2,2,0,0,1,4,4H8" fill="none" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                                <polygon fill="none" points="12.5 15.8 22 6.2 17.8 2 8.3 11.5 8 16 12.5 15.8" stroke="#000000" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                                            </g>
                                        </g>
                                    </g>
                                </svg>
                            </div>
                        </>
                    }

                </div>
            </div>
            <div className={passwordContainerStyle} >
                {isChangingPassword ?
                    <div className={changePassFormContainerStyle}>
                        <form onSubmit={handlePassChange}>
                            <div>
                                <label htmlFor="oldPassInput">Old password:</label>
                                <input id='oldPassInput' type="password" onChange={(e) => setOldPassValue(e.target.value)} value={oldPassValue} required autoComplete='off' />
                            </div>
                            <div>
                                <label htmlFor="newPassInput">New password:</label>
                                <PasswordInput passwordText={newPassValue} setPasswordText={setNewPassValue}
                                    setErrorMessage={setErrorMessage} setIsValid={setIsValid}
                                />
                            </div>
                            <div className={changePasswordActionsStyle}>
                                <input type="submit"
                                    style={!isValid ? { backgroundColor: '#45457ba1', cursor: 'not-allowed' } : { cursor: 'pointer' }}
                                    value={'Confirm'}
                                />
                                <input type='button' value={'Cancel'} onClick={() => {
                                    setIsChangingPassword(false)
                                    setNewPassValue('')
                                    setOldPassValue('')
                                }} />
                            </div>
                            <p className={passwordErrorMessageStyle}>{errorMessage && errorMessage}</p>
                        </form>
                    </div>
                    : <p className={changePasswordBtnStyle}
                        onClick={() => {
                            setIsChangingPassword(true)
                            setIsChangingUsername(false)
                            setNewUsername(user?.username)
                            setErrorMessage('')
                        }}>Change Password</p>
                }
            </div>
        </div>
    )
}