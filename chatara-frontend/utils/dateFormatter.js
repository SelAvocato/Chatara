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

    const day = currentChatMessageSentAtMs.getDate()
    const dayDiff = currentDate - day
    console.log('this is the day', day, dayDiff)

    if (dayDiff === 1) {
        return `YESTERDAY AT ${hourFormatter.format(currentChatMessageSentAtMs)}`
    } else if (dayDiff > 1) {
        return weekDayFormatter.format(currentChatMessageSentAtMs)
    } else if (dayDiff > 3) {
        return dateFormatter.format(currentChatMessageSentAtMs)
    }
    return hourFormatter.format(currentChatMessageSentAtMs)
}