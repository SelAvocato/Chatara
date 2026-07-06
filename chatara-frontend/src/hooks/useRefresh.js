import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";

export function useRefresh(bool) {
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(bool)
    const { refresh } = useAuth()

    useEffect(() => {
        async function fetchUser() {
            try {
                const user = await refresh()
                if (!user) setIsAuthenticated(false)
            } catch (e) {
                console.log(e)
                setIsAuthenticated(false)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [refresh])

    return { isLoading, isAuthenticated }
}