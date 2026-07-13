import { Navigate, Outlet } from "react-router";
import Sidebar from "../component/Sidebar";
import style from './Layout.module.css'
import { useRefresh } from "../hooks/useRefresh";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
    const { isLoading } = useRefresh(true)
    const { user } = useAuth()
    const { layoutStyle, sidebar, main } = style

    if (isLoading) return <div>Loading...</div>
    if (!user) return <Navigate to='/login' replace />
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