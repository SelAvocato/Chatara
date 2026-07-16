export const hourFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

export const dateFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})

export const weekDayFormatter = new Intl.DateTimeFormat("en-PH", {
    timeZone: 'Asia/Manila',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
})