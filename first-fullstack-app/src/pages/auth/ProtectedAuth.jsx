import { Navigate } from "react-router";
import { Outlet } from "react-router";
import { useRefresh } from "../../hooks/useRefresh";

export default function ProtectedAuth() {
    const { isAuthenticated, isLoading } = useRefresh(false)
    if (isLoading) return <div>Loading...</div>
    if (isAuthenticated) return <Navigate to={'/'} replace />
    return (
        <Outlet />
    )
}