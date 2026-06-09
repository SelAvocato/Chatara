import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { useAuth } from '../../hooks/useAuth'
import style from './Signup.module.css'

export default function Signup() {
    const navigate = useNavigate()
    const [isValid, setIsValid] = useState(true)
    const [errorMessage, setErrorMessage] = useState(null)
    const { signupPage, header, signupForm, error, actions, submitBtn, cancelBtn } = style
    const { user, signup } = useAuth()

    if (user) return <Navigate to='/' replace />

    async function handleSubmit(e) {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const entries = Object.fromEntries(formData.entries())

        const { username, password, confirmPassword } = entries

        if (password !== confirmPassword) {
            setIsValid(false)
            return setErrorMessage(`Passwords don't match`)
        }

        try {
            const res = await signup(username, password)
            if (res.status !== 'ok') {
                setErrorMessage(res.message)
                return setIsValid(false)
            }
            setIsValid(true)
            navigate('/login')

        } catch (e) {
            setIsValid(false)
            setErrorMessage(e.message)
        }

    }

    return (
        <div className={signupPage}>
            <div className={header}>Signup</div>
            <div>
                <form onSubmit={handleSubmit} className={signupForm}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" id="username" name="username" autoComplete="username" required />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" id="password" name="password" autoComplete="current-password" required />
                    </div>

                    <div>
                        <label htmlFor="confirmPassword">Confirm Password:</label>
                        <input type="password" id="confirmPassword" name="confirmPassword" autoComplete="current-password" required />
                    </div>
                    <p style={isValid ? { display: "none" } : { display: "flex" }} className={error}>{errorMessage}</p>

                    <div className={actions}>
                        <input className={submitBtn} type="submit" value={"Sign up"} />
                        <input className={cancelBtn} onClick={() => navigate('/login')} type="reset" value={"Cancel"} />
                    </div>
                </form>
            </div>
        </div>
    )
}