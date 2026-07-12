import { useState } from 'react'
import style from './ChatBubbleActions.module.css'
import optionImage from './img/chatbubble-options.svg'
import replyImage from './img/chatbubble-reply.svg'

export default function ChatBubbleActions({ chatMessage, onEdit, onDeleteForEveryone, isSender, isShowingOptions, setIsShowingOptions }) {
    const { optionImageContainerStyle, replyContainerStyle, replyImageContainerStyle, optionContainerStyle, optionDropdownStyle, above, below, receiver, deleted } = style
    const [messageIsBelow, setMessageIsBelow] = useState(false)

    const isDeleted = chatMessage?.is_deleted === 1
    const hidden = isDeleted || !isSender

    function showOptions(e) {
        const rect = e.target.getBoundingClientRect()
        const screenHeight = window.screen.availHeight
        const halfHeight = screenHeight / 2

        if (rect.top >= halfHeight) { setMessageIsBelow(true) } else { setMessageIsBelow(false) }
        setIsShowingOptions(!isShowingOptions)
    }

    return (
        <>
            <div className={replyContainerStyle}>
                <div className={replyImageContainerStyle}>
                    <img src={replyImage} alt="reply image" />
                </div>
            </div>
            <div className={optionContainerStyle}>
                <div className={optionImageContainerStyle} onClick={(e) => showOptions(e)}>
                    <img src={optionImage} alt="Option image" />
                </div>
                {
                    isShowingOptions &&
                    <div className={`${optionDropdownStyle} ${messageIsBelow ? above : below} ${!isSender && receiver} ${hidden && deleted}`}>
                        <div>
                            <p onClick={() => onEdit(true)} hidden={hidden}>Edit</p>
                            <p hidden={hidden} onClick={onDeleteForEveryone}>Delete for everyone</p>
                            <p>Delete for you</p>
                        </div>
                    </div>
                }
            </div >
        </>
    )
}