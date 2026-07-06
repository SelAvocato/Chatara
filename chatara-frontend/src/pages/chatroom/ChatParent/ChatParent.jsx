import ChatHeader from "../ChatHeader/ChatHeader"
import style from './ChatParent.module.css'
import ChatBody from "../ChatBody/ChatBody"
import catBg from './chat-backgrounds.svg'

export default function ChatParent() {
    const { chatParent } = style

    return (
        <div className={chatParent} style={{ backgroundImage: `url(${catBg})` }}>
            <ChatHeader />
            <ChatBody />
        </div>
    )
}