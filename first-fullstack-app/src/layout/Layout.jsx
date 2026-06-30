import { Navigate } from "react-router";
import { Outlet } from "react-router";
import Sidebar from "../component/Sidebar";
import style from './Layout.module.css'
import { useRefresh } from "../hooks/useRefresh";

export default function Layout() {
    const { isAuthenticated, isLoading } = useRefresh()
    const { layoutStyle, sidebar, main } = style

    if (isLoading) return <div>Loading...</div>
    if (!isAuthenticated) return <Navigate to='/login' replace />
    return (
        <div className={layoutStyle}>
            <div className={sidebar}>
                <Sidebar />
            </div>
            <div className={main}>
                <Outlet />
            </div>
        </div>
    )
}