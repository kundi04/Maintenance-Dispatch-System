import axios from 'axios'

// Use environment variable for production, fallback to proxy for development
const baseURL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
})

export default api
