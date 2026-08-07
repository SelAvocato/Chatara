import style from './ChatHeader.module.css'
import infoIcon from '/icons/info-icon.svg'
import { useChatroom } from '../../../hooks/useChatroom'
import Avatar from '../../../component/Avatar/Avatar'

export default function ChatHeader() {
    const { chatroom, isChatroomInfoOpened, setIsChatroomInfoOpened } = useChatroom()
    const { chatHeaderStyle, chatHeaderProfileStyle, chatroomImageContainerStyle, chatHeaderActionStyle, infoIconImageStyle } = style

    return (
        <div className={chatHeaderStyle}>
            <div className={chatHeaderProfileStyle}>
                <div className={chatroomImageContainerStyle}>
                    <Avatar src={chatroom?.chatroom_img_url} />
                </div>
                <p>{chatroom?.name || 'Chatroom'}</p>
            </div>
            <div className={chatHeaderActionStyle} onClick={() => setIsChatroomInfoOpened(!isChatroomInfoOpened)}>
                <img className={infoIconImageStyle} src={infoIcon} alt="" />
            </div>
        </div>
    )
}