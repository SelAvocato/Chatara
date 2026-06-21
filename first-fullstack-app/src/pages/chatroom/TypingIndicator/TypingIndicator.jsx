import style from './TypingIndicator.module.css'

export default function TypingIndicator({ userTyping }) {
    const { userTypingStyle, typingTextStyle, typingAnimationStyle, circle } = style
    return (
        <div className={userTypingStyle}>
            <div className={typingAnimationStyle}>
                <div className={circle}></div>
                <div className={circle}></div>
                <div className={circle}></div>
            </div>
            <p className={typingTextStyle}>{userTyping} is typing</p>
        </div>
    )
}