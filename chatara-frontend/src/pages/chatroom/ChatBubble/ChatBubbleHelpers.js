export function checkIfFirstMessageGroup(nextChatMessage, prevChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs, nextChatMessageSentAtMs) {
    if (!nextChatMessage || nextChatMessageSenderId !== currentChatMessageSenderId) return false

    if (prevChatMessageSenderId === currentChatMessageSenderId) {
        const isPrevInGroup = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
        if (isPrevInGroup) return false
    }

    const isNextInGroup = isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
    if (!isNextInGroup) return false

    return true
}

export function checkIfPartOfRecentMessageGroup(prevChatMessage, nextChatMessage, prevChatMessageSenderId, currentChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs, nextChatMessageSentAtMs) {
    if (!prevChatMessage || !nextChatMessage || prevChatMessageSenderId !== currentChatMessageSenderId || nextChatMessageSenderId !== currentChatMessageSenderId) return false
    const isPrevRecent = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    if (!isPrevRecent) return false
    return isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
}

export function checkIfLastOfMessageGroup(prevChatMessage, prevChatMessageSenderId, currentChatMessageSenderId, currentChatMessageSentAtMs, prevChatMessageSentAtMs) {
    if (!prevChatMessage || prevChatMessageSenderId !== currentChatMessageSenderId) return false
    return isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
}

export function checkIfSingleMessage(prevChatMessageSenderId, currentChatMessageSenderId, nextChatMessageSenderId, currentChatMessageSentAtMs, nextChatMessageSentAtMs,prevChatMessageSentAtMs) {
    if (prevChatMessageSenderId !== currentChatMessageSenderId) {
        if (nextChatMessageSenderId !== currentChatMessageSenderId) return true
        return !isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
    }

    const isPrevMessageRecent = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    if (isPrevMessageRecent) return false

    if (nextChatMessageSenderId === currentChatMessageSenderId) {
        const isNextMessageRecent = isRecent(nextChatMessageSentAtMs, currentChatMessageSentAtMs)
        if (isNextMessageRecent) return false
    }
    return true
}

export function checkIfTimestampable(prevChatMessage, currentChatMessageSentAtMs, prevChatMessageSentAtMs) {
    if (!prevChatMessage) return true
    const isPrevRecent = isRecent(currentChatMessageSentAtMs, prevChatMessageSentAtMs)
    if (isPrevRecent) return false

    return true
}

const threeMins = 180000
export function isRecent(recent, old) {
    const lapsedTimeMs = recent - old
    if (lapsedTimeMs > threeMins) return false
    return true
}
