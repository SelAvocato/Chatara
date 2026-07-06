import { useMemo } from "react";
import { apiClient } from "../services/api";
import { useAuth } from "./useAuth";

export function useApi() {
    const { accessToken, setAccessToken } = useAuth()

    const api = useMemo(() => {
        return apiClient({
            getToken: () => accessToken,
            onTokenRefresh: (newAccessToken) => setAccessToken(newAccessToken)
        })
    }, [accessToken, setAccessToken])

    return api
}