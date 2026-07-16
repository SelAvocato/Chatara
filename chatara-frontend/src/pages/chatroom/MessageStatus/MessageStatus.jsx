import style from './MessageStatus.module.css'

export default function MessageStatus({ messageStatus }) {
    const { statusStyle } = style

    return (
        <div className={statusStyle}>
            <p>{messageStatus || 'sending...'}</p>
        </div>
    )
}