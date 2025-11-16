import axios from 'axios'
import { notification } from 'antd'

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
    const isAuthEndpoint = error.config?.url?.includes('/auth/login') || error.config?.url?.includes('/auth/register')
    
    if (error.response?.status === 401) {
      // Don't auto-redirect for login/register endpoints - let them handle the error
      if (!isAuthEndpoint) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
        notification.error({
          message: 'Session Expired',
          description: 'Your session has expired. Please login again.',
          placement: 'topRight',
        })
      }
      // For auth endpoints, the error will be handled by the calling component
    } else if (error.config?.responseType === 'blob') {
      // Handle blob errors - try to parse as JSON
      try {
        const text = await error.response.data.text()
        const json = JSON.parse(text)
        if (json.error) {
          notification.error({
            message: 'Export Failed',
            description: json.error,
            placement: 'topRight',
          })
        } else {
          notification.error({
            message: 'Export Failed',
            description: 'Failed to export file',
            placement: 'topRight',
          })
        }
      } catch {
        notification.error({
          message: 'Export Failed',
          description: 'Failed to export file',
          placement: 'topRight',
        })
      }
    } else if (error.response?.data?.error) {
      // Only show notification for non-auth endpoints to avoid duplicate errors
      if (!isAuthEndpoint) {
        notification.error({
          message: 'Error',
          description: error.response.data.error,
          placement: 'topRight',
        })
      }
    } else {
      // Only show notification for non-auth endpoints
      if (!isAuthEndpoint) {
        notification.error({
          message: 'Error',
          description: 'An error occurred',
          placement: 'topRight',
        })
      }
    }
    return Promise.reject(error)
  }
)

export default api
