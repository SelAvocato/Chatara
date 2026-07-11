import { useState } from 'react'
import style from './ChatBubbleActions.module.css'
import optionImage from './img/chatbubble-options.svg'
import replyImage from './img/chatbubble-reply.svg'

export default function ChatBubbleActions({ chatMessage, onEdit, onDeleteForEveryone, isSender, isShowingOptions, setIsShowingOptions }) {
    const { optionImageContainerStyle, replyContainerStyle, replyImageContainerStyle, optionContainerStyle, optionDropdownStyle, above, below, receiver } = style

    const [messageIsBelow, setMessageIsBelow] = useState(false)

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
                    <div className={`${optionDropdownStyle} ${messageIsBelow ? above : below} ${!isSender && receiver}`}>
                        <div>
                            <p onClick={() => onEdit(true)}>Edit</p>
                            <p hidden={!isSender} onClick={onDeleteForEveryone}>Delete for everyone</p>
                            <p>Delete for you</p>
                        </div>
                    </div>
                }
            </div >
        </>
    )
}