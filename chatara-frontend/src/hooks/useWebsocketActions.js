import { use } from "react";
import { WebsocketActionsContext } from '../context/WebSocketContext'
export function useWebsocketActions() {
    const websocketActions = use(WebsocketActionsContext)
    if (!websocketActions) throw new Error('Error: Must be used inside WebsocketActionsProvider')
    return websocketActions
}