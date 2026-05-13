import axios from 'axios'
import { getCsrfToken, setCsrfToken, clearCsrfToken } from '../utils/csrf'

// Use environment variable for production, fallback to proxy for development
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const method = (config.method || 'get').toLowerCase()
  if (['post', 'put', 'patch', 'delete'].includes(method)) {
    const token = getCsrfToken()
    if (token) {
      config.headers = config.headers || {}
      config.headers['X-CSRFToken'] = token
    }
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const token = response.data?.csrfToken
    if (token) setCsrfToken(token)
    const url = response.config?.url || ''
    if (url.includes('/auth/logout/') && response.status === 200) {
      clearCsrfToken()
    }
    return response
  },
  (error) => {
    const token = error.response?.data?.csrfToken
    if (token) setCsrfToken(token)
    return Promise.reject(error)
  }
)

export default api
