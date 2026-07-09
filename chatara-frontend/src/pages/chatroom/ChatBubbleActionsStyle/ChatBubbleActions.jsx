import { useState } from 'react'
import style from './ChatBubbleActions.module.css'
import optionImage from './img/chatbubble-options.svg'
import replyImage from './img/chatbubble-reply.svg'

export default function ChatBubbleActions({ chatMessage }) {
    const { optionImageContainerStyle, replyContainerStyle, replyImageContainerStyle, optionContainerStyle, optionDropdownStyle } = style

    const [isShowingOptions, setIsShowingOptions] = useState(false)

    return (
        <>
            <div className={replyContainerStyle}>
                <div className={replyImageContainerStyle}>
                    <img src={replyImage} alt="reply image" />
                </div>
            </div>
            <div className={optionContainerStyle}>
                <div className={optionImageContainerStyle} onClick={() => setIsShowingOptions(!isShowingOptions)}>
                    <img src={optionImage} alt="Option image" />
                </div>
                {
                    isShowingOptions &&
                    <div className={optionDropdownStyle}>
                        <div>Edit</div>
                        <div>Delete</div>
                    </div>
                }

            </div>
        </>
    )
}