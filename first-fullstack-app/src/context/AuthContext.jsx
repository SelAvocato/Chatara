import { createContext, useState } from 'react'
import { apiClient } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)
    async function login(entries) {
        const data = await apiClient.post('/auth/login', entries)
        if (data.status !== 'ok') return data.message
        localStorage.setItem('user', JSON.stringify(data.user))
        setUser(data.user)
        console.log(data)
    }

    async function signup(username, password) {
        const newUser = { username: username, password: password }
        console.log(newUser)
        const res = await apiClient.post('/auth/signup', newUser)

        return res
    }

    function logout() {
        localStorage.clear()
        setUser(null)
    }

    return (
        <AuthContext value={{ user, signup, login, logout }}>
            {children}
        </AuthContext>
    )
}

export default AuthContext

