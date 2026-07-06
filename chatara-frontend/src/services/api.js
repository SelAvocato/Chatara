const baseUrl = import.meta.env.VITE_API_BASE_URL

export function apiClient({ getToken, onTokenRefresh }) {
    async function request(endpoint, options = {}) {
        const token = getToken()
        if (!token) throw new Error('Missing token')

        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        }
        headers['authorization'] = `Bearer ${token}`

        const newOption = { ...options, headers, credentials: 'include' }
        let res = await fetch(`${baseUrl}${endpoint}`, newOption)
        let data = await res.json()
        if (res.status !== 401) return data

        res = await fetch(`${baseUrl}/auth/refresh`, { method: 'POST', ...newOption.credentials })
        data = await res.json()
        if (!res.ok) return data
        onTokenRefresh(data.accessToken)

        res = await fetch(`${baseUrl}${endpoint}`, newOption)
        if (!res.ok) throw new Error('Something went wrong')
        data = await res.json()
        return data
    }

    return {
        get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
        post: (endpoint, data, options) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(data) })
    }
}