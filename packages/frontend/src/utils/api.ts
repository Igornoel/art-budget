import axios from 'axios'
import { notification } from 'antd'

// Detect environment and set base URL
const getBaseURL = () => {
  // Check if we're in production
  // Vite sets import.meta.env.PROD to true in production builds
  const isProduction = import.meta.env.PROD
  
  // Also check hostname as fallback
  const isProductionHost = 
    window.location.hostname !== 'localhost' && 
    window.location.hostname !== '127.0.0.1' &&
    !window.location.hostname.startsWith('192.168.') &&
    window.location.hostname !== ''
  
  if (isProduction || isProductionHost) {
    // Production: use Render.com backend
    return 'https://art-budget.onrender.com/api'
  }
  
  // Development: use Vite proxy (which forwards to localhost:3001)
  return '/api'
}

const api = axios.create({
  baseURL: getBaseURL(),
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
    
    // Log error for debugging
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      code: error.code,
    })
    
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
        const errorMessage = error.response.data.error
        const errorDetails = error.response.data.details
        notification.error({
          message: 'Error',
          description: errorDetails ? `${errorMessage}: ${errorDetails}` : errorMessage,
          placement: 'topRight',
          duration: 5,
        })
      }
    } else if (error.request) {
      // Network error - request was made but no response received
      if (!isAuthEndpoint) {
        notification.error({
          message: 'Network Error',
          description: 'Unable to connect to the server. Please check your connection and ensure the backend is running.',
          placement: 'topRight',
          duration: 5,
        })
      }
    } else {
      // Request setup error
      if (!isAuthEndpoint) {
        notification.error({
          message: 'Request Error',
          description: error.message || 'An error occurred while setting up the request',
          placement: 'topRight',
          duration: 5,
        })
      }
    }
    return Promise.reject(error)
  }
)

export default api
