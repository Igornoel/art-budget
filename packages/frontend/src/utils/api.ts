import axios from 'axios'
import { toast } from 'sonner'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
      toast.error('Session expired. Please login again.')
    } else if (error.config?.responseType === 'blob') {
      // Handle blob errors - try to parse as JSON
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        if (json.error) {
          toast.error(json.error)
        } else {
          toast.error('Failed to export file')
        }
      } catch {
        toast.error('Failed to export file')
      }
    } else if (error.response?.data?.error) {
      toast.error(error.response.data.error)
    } else {
      toast.error('An error occurred')
    }
    return Promise.reject(error)
  }
)

export default api
