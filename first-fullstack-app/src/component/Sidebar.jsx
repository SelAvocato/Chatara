import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router'
import style from './Sidebar.module.css'
import messagesIcon from '/icons/messages-icon.svg'

export default function Sidebar() {
    const { user, logout } = useAuth()
    const { sidebarStyle, userStyle, messagesIconStyle, logoutStyle, nameAndLogoutStyle } = style

    const navigate = useNavigate()

    function onLogout() {
        logout()
        navigate('/')
    }

    return (
        <div className={sidebarStyle}>
            <div className={messagesIconStyle}>
                <img src={messagesIcon} alt="Messages Icon" />
            </div>

            <div className={nameAndLogoutStyle}>
                <div className={userStyle}>
                    {user && user.username}
                </div>
                <div onClick={onLogout} className={logoutStyle}>
                    <button>Logout</button>
                </div>
            </div>
        </div>
    )
}