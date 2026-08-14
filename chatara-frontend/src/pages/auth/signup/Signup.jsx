import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router'
import { useAuth } from '../../../hooks/useAuth'
import style from './Signup.module.css'
import PasswordInput from '../../../component/PasswordInput/PasswordInput'

export default function Signup() {
    const { signupPage, header, signupForm, error, actions, submitBtn, invalid, cancelBtn } = style
    const { user, signup } = useAuth()
    const navigate = useNavigate()
    const [isValid, setIsValid] = useState(false)
    const [errorMessage, setErrorMessage] = useState(null)
    const [usernameText, setUsernameText] = useState('')
    const [passwordText, setPasswordText] = useState('')

    if (user) return <Navigate to='/' replace />

    async function handleSubmit(e) {
        e.preventDefault()
        try {
            const res = await signup({ username: usernameText, password: passwordText })
            if (res.status !== 'ok') {
                setErrorMessage(res.message)
                return
            }
            navigate('/login')

        } catch (e) {
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
                        <input type="text" id="username" autoComplete="username" required value={usernameText}
                            onChange={(e) => setUsernameText(e.target.value)} />
                    </div>

                    <div>
                        <label htmlFor="password">Password:</label>
                        <PasswordInput passwordText={passwordText} setPasswordText={setPasswordText}
                            setErrorMessage={setErrorMessage} setIsValid={setIsValid}
                        />
                    </div>

                    <p style={!errorMessage ? { display: "none" } : { display: "flex" }} className={error}>{errorMessage}</p>

                    <div className={actions}>
                        <input className={`${submitBtn} ${!isValid && invalid}`} type="submit" value={"Sign up"} disabled={!isValid} />
                        <input className={cancelBtn} type="reset"
                            onClick={() => navigate('/login')}
                            value={"Cancel"}
                        />
                    </div>
                </form>
            </div>
        </div>
    )
}