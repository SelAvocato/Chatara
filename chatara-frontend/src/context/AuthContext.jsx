import { createContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)

    async function request(endpoint, options = {}) {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            ...options
        })
        return await res.json()
    }

    async function login(entries) {
        const data = await request('/auth/login', { body: JSON.stringify(entries) })
        if (data.status !== 'ok') return data.message

        setUser(data.user)
        setAccessToken(data.accessToken)
        console.log(data)
    }

    async function signup(username, password) {
        const newUser = { username, password }
        const data = await request('/auth/signup', { body: JSON.stringify(newUser) })
        return data
    }

    const refresh = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/user`, {
                method: 'POST',
                credentials: 'include'
            })
            const data = await res.json()
            if (data.status !== 'ok') throw new Error(data.message)
            setUser(data.user)
            setAccessToken(data.accessToken)
            return data.user
        } catch (e) {
            console.error(e)
            setUser(null)
            setAccessToken(null)
        }
    }, [])

    async function logout() {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: { authorization: `Bearer ${accessToken}` }
        })
        const data = await res.json()
        console.log(data.message)
        setUser(null)
        setAccessToken(null)
    }

    return (
        <AuthContext value={{ accessToken, setAccessToken, user, setUser, signup, login, refresh, logout }}>
            {children}
        </AuthContext>
    )
}

export default AuthContext

