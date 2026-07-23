import style from './ChatHeader.module.css'
import pfpImage from '/icons/pfp.svg'
import infoIcon from '/icons/info-icon.svg'
import { useChatroom } from '../../../hooks/useChatroom'

export default function ChatHeader() {
    const { chatroom, isChatroomInfoOpened, setIsChatroomInfoOpened } = useChatroom()
    const { chatHeaderStyle, chatHeaderProfileStyle, chatHeaderActionStyle, infoIconImageStyle } = style

    return (
        <div className={chatHeaderStyle}>
            <div className={chatHeaderProfileStyle}>
                <img src={pfpImage} alt="Profile Image" />
                <p>{chatroom?.name || 'Chatroom'}</p>
            </div>
            <div className={chatHeaderActionStyle} onClick={() => setIsChatroomInfoOpened(!isChatroomInfoOpened)}>
                <img className={infoIconImageStyle} src={infoIcon} alt="" />
            </div>
        </div>
    )
}