const baseUrl = import.meta.env.VITE_API_BASE_URL

export function apiClient({ getToken, onTokenRefresh, onTokensExpire }) {
    async function request(endpoint, options = {}) {
        const token = getToken()
        if (!token) throw new Error('Missing token')

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        }
        headers['authorization'] = `Bearer ${token}`

        let newOption = { ...options, headers, credentials: 'include' }
        const res = await fetch(`${baseUrl}${endpoint}`, newOption)
        const data = await res.json()
        if (res.ok) return data

        if (res.status === 401) {
            const refreshRes = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST', credentials: 'include' })
            const refreshData = await refreshRes.json()
            if (refreshRes.status === 401) {
                onTokensExpire(null)
                throw new Error('Session expired. Please re-login')
            }
            if (!refreshRes.ok) throw new Error(refreshData.message)
            onTokenRefresh(data.accessToken)
        }

        if (!res.ok) throw new Error(data.message || data.errorMessage)

        headers['authorization'] = `Bearer ${data.accessToken}`
        newOption = { ...options, headers, credentials: 'include' }
        const newRes = await fetch(`${baseUrl}${endpoint}`, newOption)
        if (!newRes.ok) throw new Error('Something went wrong')
        const newData = await res.json()
        return newData
    }

    return {
        get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
        post: (endpoint, data, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) }),
        put: (endpoint, data, options) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(data) }),
        delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' })
    }
}