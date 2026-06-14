
const baseUrl = import.meta.env.VITE_API_BASE_URL
export const apiClient = {
    get: async (endpoint) => {
        const res = await fetch(`${baseUrl}${endpoint}`)
        return res.json()
    },

    post: async (endpoint, data) => {
        const res = await fetch(`${baseUrl}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
        return await res.json()
    }
}