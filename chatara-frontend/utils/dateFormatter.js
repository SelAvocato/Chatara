const hourFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

const dateFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

const weekDayFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

export function getTimeStamp(hasTimestamp, currentChatMessageSentAtMs, currentDate) {
    if (!hasTimestamp) return

    const sentDate = new Date(currentChatMessageSentAtMs)
    const now = new Date(currentDate)

    const startOfSent = new Date(sentDate.getFullYear(), sentDate.getMonth(), sentDate.getDate())
    const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const dayDiff = Math.round((startOfNow - startOfSent) / 86400000)

    if (dayDiff <= 0) {
        return hourFormatter.format(sentDate)
    } else if (dayDiff === 1) {
        return `YESTERDAY AT ${hourFormatter.format(sentDate)}`
    } else if (dayDiff <= 3) {
        return weekDayFormatter.format(sentDate)
    }
    return dateFormatter.format(sentDate)
}