import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router";
import { Outlet } from "react-router";
import Sidebar from "../component/Sidebar";
import style from './Layout.module.css'

export default function Layout() {
    const [isAuthenticated, setIsAuthenticated] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const { refresh } = useAuth()
    const { layoutStyle, sidebar, main } = style
    useEffect(() => {
        async function fetchUser() {
            try {
                const fetchedUser = await refresh()
                if (!fetchedUser) return setIsAuthenticated(false)
            } catch (e) {
                setIsAuthenticated(false)
                console.log(e)
            } finally {
                setIsLoading(false)
            }
        }
        fetchUser()
    }, [refresh])

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