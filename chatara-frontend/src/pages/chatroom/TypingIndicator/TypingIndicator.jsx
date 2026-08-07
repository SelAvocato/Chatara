import Avatar from '../../../component/Avatar/Avatar'
import { useWebsocket } from '../../../hooks/useWebsocket'
import style from './TypingIndicator.module.css'

export default function TypingIndicator() {
    const { userTyping } = useWebsocket()
    const { typingIndicatorContainerStyle, typerPfpContainerStyle, userTypingStyle, typingTextStyle, typingAnimationStyle, circle } = style
    const { username, pfp_url } = userTyping
    return (
        <div className={typingIndicatorContainerStyle}>
            <div className={typerPfpContainerStyle}>
                <Avatar src={pfp_url} />
            </div>
            <div className={userTypingStyle}>
                <p className={typingTextStyle}>{username} is typing</p>
                <div className={typingAnimationStyle}>
                    <div className={circle}></div>
                    <div className={circle}></div>
                    <div className={circle}></div>
                </div>
            </div>
        </div>
    )
}