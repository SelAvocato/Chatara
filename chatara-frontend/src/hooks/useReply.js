import { use } from "react"
import ReplyContext from "../context/ReplyContext"

export function useReply() {
    const useReply = use(ReplyContext)
    if (!useReply) throw new Error('useReply must be used inside ReplyProvider!')
    return useReply
}