import { useMemo } from "react";
import { apiClient } from "../services/api";
import { useAuth } from "./useAuth";

export function useApi() {
    const { accessToken, setAccessToken, setUser } = useAuth()

    const api = useMemo(() => {
        return apiClient({
            getToken: () => accessToken,
            onTokenRefresh: (newAccessToken) => setAccessToken(newAccessToken),
            onTokensExpire: (emptyUser) => setUser(emptyUser)
        })
    }, [accessToken, setAccessToken, setUser])

    return api
}