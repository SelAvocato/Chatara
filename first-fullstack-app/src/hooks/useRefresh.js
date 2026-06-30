import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useRefresh() {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const { refresh } = useAuth()

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await refresh()
                if (!user) return setIsAuthenticated(false)
            } catch (e) {
                console.log(e)
                return setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [refresh])

    return { isLoading, isAuthenticated }
}