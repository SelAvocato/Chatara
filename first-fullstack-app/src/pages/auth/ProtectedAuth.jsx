import { Navigate } from "react-router";
import { Outlet } from "react-router";
import { useRefresh } from "../../hooks/useRefresh";

export default function ProtectedAuth() {
    const { isAuthenticated, isLoading } = useRefresh()
    isLoading && <div>Loading...</div>
    isAuthenticated && <Navigate to={'/'} replace />
    return (
        <Outlet />
    )
}