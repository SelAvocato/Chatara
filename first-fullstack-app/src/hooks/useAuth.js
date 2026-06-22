import { use } from 'react'
import AuthContext from '../context/AuthContext'

export function useAuth() {
    const auth = use(AuthContext)

    if (!auth) throw new Error('Error: useAuth must be used inside <AuthProvider>')

    return auth
}