import { createContext, useState } from 'react'
import { apiClient } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null)
    async function login(entries) {
        const data = await apiClient.post('/login', entries)

        localStorage.setItem('user', JSON.stringify(data))
        setUser(data)
        console.log(data)
    }

    async function signup(username, password) {
        const newUser = { username: username, password: password }
        console.log(newUser)
        const res = await apiClient.post('/signup', newUser)

        // const res = await fetch(`http://localhost:3000/signup`, {
        //     method: 'POST',
        //     headers: { 'Content-type': 'application/json' },
        //     body: JSON.stringify({ username, password })
        // })

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

