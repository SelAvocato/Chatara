import { createContext, useState, useCallback } from 'react'
import { apiClient } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [accessToken, setAccessToken] = useState(null)

    async function login(entries) {
        console.log('entries', entries)
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(entries)
        })
        const data = await res.json()
        if (data.status !== 'ok') return data.message
        setUser(data.user)
        setAccessToken(data.accessToken)
        console.log(data)
    }

    async function signup(username, password) {
        const newUser = { username: username, password: password }
        console.log(newUser)
        const res = await apiClient.post('/auth/signup', newUser)

        return res
    }

    const refresh = useCallback(async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                credentials: 'include'
            })
            const data = await res.json()
            if (data.status !== 'ok') throw new Error(data.message)
            console.log('dataaa', data)
            setUser(data.user)
            setAccessToken(data.accessToken)
            console.log(data)
            return data.user
        } catch (e) {
            console.log(e)
        }
    }, [])

    function logout() {
        localStorage.clear()
        setUser(null)
    }

    return (
        <AuthContext value={{ accessToken, user, signup, login, refresh, logout }}>
            {children}
        </AuthContext>
    )
}

export default AuthContext

