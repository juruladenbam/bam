import axios from 'axios'

const api = axios.create({
    baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8000/api') + '/admin',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Helper to get cookie value
const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}

// Request interceptor to add CSRF token
api.interceptors.request.use((config) => {
    const token = getCookie('XSRF-TOKEN');
    if (token) {
        config.headers['X-XSRF-TOKEN'] = decodeURIComponent(token);
    }
    return config;
});

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
