import { useCallback } from "react"
import { useAuth } from "./useAuth"
export function useHandleTokenExpiration() {
    const { setUser, setAccessToken } = useAuth()
    const handleTokenExpiration = useCallback(() => {
        setUser(null)
        setAccessToken(null)
    }, [setUser, setAccessToken])
    return handleTokenExpiration
}