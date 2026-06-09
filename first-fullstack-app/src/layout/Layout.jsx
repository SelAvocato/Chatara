import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import { Outlet } from "react-router";
import Sidebar from "../component/Sidebar";
import style from './Layout.module.css'

export default function Layout() {
    const { layoutStyle, sidebar, main } = style
    const { user } = useAuth()
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