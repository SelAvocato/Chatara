import { useEffect } from "react"

const invalidChars = /[^A-Za-z0-9]/
export default function PasswordInput({ passwordText, setPasswordText, setErrorMessage, setIsValid }) {
    useEffect(() => {
        if (!passwordText || passwordText.trim() === '') {
            setErrorMessage('')
            setIsValid(false)
            return
        }
        if (typeof passwordText !== 'string') {
            setErrorMessage('Missing or Invalid password')
            setIsValid(false)
            return
        }
        const hasSpecialChars = invalidChars.test(passwordText)
        const isShort = passwordText.length < 8
        if (!hasSpecialChars && !isShort) {
            setErrorMessage('')
            setIsValid(true)
            return
        }
        if (hasSpecialChars) {
            setErrorMessage('Password must only be letters or numbers')
            setIsValid(false)
            return
        }
        if (isShort) {
            setErrorMessage('Password must have 8 characters or more')
            setIsValid(false)
            return
        }
    }, [passwordText, setErrorMessage, setIsValid])
    return (
        <div>
            <input id="password" type="password" required autoComplete="current-password" onChange={(e) => setPasswordText(e.target.value)} />
        </div>
    )
}