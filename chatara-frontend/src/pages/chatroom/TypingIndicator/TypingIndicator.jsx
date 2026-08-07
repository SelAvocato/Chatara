import Logo from '../../../component/Logo/Logo'
import { useWebsocket } from '../../../hooks/useWebsocket'
import style from './TypingIndicator.module.css'

export default function TypingIndicator() {
    const { userTyping } = useWebsocket()
    const { typingIndicatorContainerStyle, typerPfpContainerStyle, userTypingStyle, typingTextStyle, typingAnimationStyle, circle } = style
    const { username, pfp_url } = userTyping
    return (
        <div className={typingIndicatorContainerStyle}>
            <div className={typerPfpContainerStyle}>
                <Logo size={35} src={pfp_url} />
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