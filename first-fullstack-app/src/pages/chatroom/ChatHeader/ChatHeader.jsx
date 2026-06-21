import { useAuth } from '../../../hooks/useAuth'
import style from './ChatHeader.module.css'
import pfpImage from '/icons/pfp.svg'
import phoneIcon from '/icons/phone-icon.svg'
import cameraIcon from '/icons/camera-icon.svg'
import infoIcon from '/icons/info-icon.svg'

export default function ChatHeader() {
    const { user } = useAuth()
    const { chatHeaderStyle, chatHeaderProfileStyle, chatHeaderActionStyle } = style

    return (
        <div className={chatHeaderStyle}>
            <div className={chatHeaderProfileStyle}>
                <img src={pfpImage} alt="Profile Image" />
                <p>{user.username}</p>
            </div>
            <div className={chatHeaderActionStyle}>
                <img src={phoneIcon} alt="" />
                <img src={cameraIcon} alt="" />
                <img src={infoIcon} alt="" />
            </div>
        </div>
    )
}