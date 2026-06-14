import { useState } from "react"
import style from "./Login.module.css"
import { Link, useNavigate, Navigate } from 'react-router'
import { useAuth } from "../../hooks/useAuth"

export default function Login() {
    const [statusMessage, setStatusMessage] = useState(null)
    const [isInvalid, setIsInvalid] = useState(false)
    const { loginPage, form, actions, submitBtn, cancelBtn, error } = style
    let navigate = useNavigate()
    const { user, login } = useAuth()
    if (user) return <Navigate to='/' replace />

    const handleSubmit = async (e) => {
        e.preventDefault()

        const formData = new FormData(e.currentTarget)
        const entries = Object.fromEntries(formData.entries())

        try {
            const res = await login(entries)
            if (res) {
                setStatusMessage(res)
                return setIsInvalid(true)
            }
            const message = 'Logged in successfully'
            setStatusMessage(message)
            setIsInvalid(false)
            navigate("/")
            console.log('test')
        } catch (e) {
            setIsInvalid(true)
            return console.error(e.message || "Something went wrong")
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
                        <input type="text" name="username" id="username" autoComplete="username" required />
                    </div>
                    <div>
                        <label htmlFor="password">Password:</label>
                        <input type="password" autoComplete="current-password" id="password" name="password" required />
                    </div>
                    <p style={isInvalid ? { display: "flex" } : { display: "none" }} className={error}>Invalid username or password</p>
                    <div className={actions}>
                        <input className={submitBtn} type="submit" value={"Log in"} />
                        <input className={cancelBtn} type="reset" value={"Cancel"} />
                    </div>
                </form>
                <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "14px", color: "black" }}>Wala pang acc and bebe ko na yan? <br />
                    <span style={{ color: "blue", cursor: "pointer" }}><Link to='/signup'>Signup</Link></span></p>
            </div>

        </div >
    )
}