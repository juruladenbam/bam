import axios from 'axios'

const api = axios.create({
    baseURL: '/api/admin',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response?.status === 401) {
            // TODO: Implement proper login flow
            console.error('Authentication required. Please login first.')
        }
        return Promise.reject(error.response?.data || error)
    }
)

export default api
