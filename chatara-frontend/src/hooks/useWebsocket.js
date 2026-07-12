import { use } from "react";
import { WebSocketContext } from "../context/WebSocketContext";

export function useWebsocket() {
    const websocket = use(WebSocketContext)
    if (!websocket) throw new Error("Error: useWebsocket must be used inside <WebsocketProvider>")
    return websocket
}