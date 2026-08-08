import style from './ChatHeader.module.css'
import infoIcon from '/icons/info-icon.svg'
import { useChatroom } from '../../../hooks/useChatroom'
import Avatar from '../../../component/Avatar/Avatar'

export default function ChatHeader() {
    const { chatroom, members, isChatroomInfoOpened, setIsChatroomInfoOpened } = useChatroom()
    const { chatHeaderStyle, chatHeaderProfileStyle, chatroomImageContainerStyle, chatHeaderActionStyle, infoIconImageStyle } = style

    return (
        <div className={chatHeaderStyle}>
            <div className={chatHeaderProfileStyle}>
                <div className={chatroomImageContainerStyle}>
                    <Avatar src={chatroom?.chatroom_img_url || members?.length > 2 && 'https://www.svgrepo.com/show/458220/group.svg'} />
                </div>
                <p>{chatroom?.name || 'Chatroom'}</p>
            </div>
            <div className={chatHeaderActionStyle} onClick={() => setIsChatroomInfoOpened(!isChatroomInfoOpened)}>
                <img className={infoIconImageStyle} src={infoIcon} alt="" />
            </div>
        </div>
    )
}