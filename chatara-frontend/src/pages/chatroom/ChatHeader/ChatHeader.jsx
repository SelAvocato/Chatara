import style from './ChatHeader.module.css'
import pfpImage from '/icons/pfp.svg'
import phoneIcon from '/icons/phone-icon.svg'
import cameraIcon from '/icons/camera-icon.svg'
import infoIcon from '/icons/info-icon.svg'
import { useChatroom } from '../../../hooks/useChatroom'

export default function ChatHeader() {
    const { chatroom } = useChatroom()
    const { chatHeaderStyle, chatHeaderProfileStyle, chatHeaderActionStyle } = style

    return (
        <div className={chatHeaderStyle}>
            <div className={chatHeaderProfileStyle}>
                <img src={pfpImage} alt="Profile Image" />
                <p>{chatroom?.name || 'Chatroom'}</p>
            </div>
            <div className={chatHeaderActionStyle}>
                <img src={phoneIcon} alt="" />
                <img src={cameraIcon} alt="" />
                <img src={infoIcon} alt="" />
            </div>
        </div>
    )
}