import { useState } from "react"
import style from "./Login.module.css"
import { Link, useNavigate } from 'react-router'
import { useAuth } from "../../../hooks/useAuth"

export default function Login() {
    const { loginPage, form, actions, submitBtn, cancelBtn, error } = style
    const { login } = useAuth()
    const [statusMessage, setStatusMessage] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [usernameText, setUsernameText] = useState('')
    const [passwordText, setPasswordText] = useState('')
    let navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        try {
            const res = await login({ username: usernameText, password: passwordText })
            if (res) {
                setErrorMessage('Invalid username or password')
                return
            }
            setStatusMessage(res)
            setStatusMessage('Logged in successfully')
            navigate("/")
        } catch (e) {
            setErrorMessage(e.message || 'Something went wrong')
            return
        }
    }

    return (
        <div>
            {
                statusMessage
                    ? <div>
                        <p>{statusMessage}</p>
                    </div>
                    : null
            }

            <div className={loginPage}>
                <p style={{ marginBlock: "1rem 3rem", fontSize: "30px", fontWeight: "500", textAlign: "center" }}>Login</p>
                <form onSubmit={handleSubmit} className={form}>
                    <div>
                        <label htmlFor="username">Username:</label>
                        <input type="text" name="username" id="username" autoComplete="username" required
                            value={usernameText}
                            onChange={(e) => setUsernameText(e.target.value)}
                        />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" autoComplete="current-password" id="password" required
                            value={passwordText}
                            onChange={(e) => setPasswordText(e.target.value)} />
                    </div>
                    <p style={errorMessage ? { display: "flex" } : { display: "none" }}
                        className={error}>{errorMessage}</p>
                    <div className={actions}>
                        <input className={submitBtn} type="submit" value={"Log in"} />
                        <input className={cancelBtn} type="reset" value={"Cancel"} onClick={() => setErrorMessage('')} />
                    </div>
                </form>
                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "14px", color: "black" }}>
                    Don't have an account?
                    <span style={{ color: "blue", cursor: "pointer" }}>
                        <Link to='/signup' style={{ textDecoration: 'none' }}>
                            Signup
                        </Link>
                    </span>
                </p>
            </div>
        </div >
    )
}