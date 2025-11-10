import axios from 'axios'

// 🏁 Base Axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000', // Change this to your backend URL
  withCredentials: true, // Include HttpOnly cookies
  headers: {
    'Content-Type': 'application/json',
  },
})

// 📤 Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if(token){
      config.headers.Authorization = `Bearer ${token}`
    }
    // You can attach extra headers here if needed
    return config
  },
  (error) => Promise.reject(error)
)

// 📥 Response Interceptor
api.interceptors.response.use(
  (response) => response.data, // Auto-unwrap JSON data
  (error) => {
    const { response } = error
    if (response && response.status === 401) {
      // const logout = useAuthStore.getState().logout
      // logout()
      console.error('Unauthorized: Logging out.')
    }

    const errorMessage =
      response?.data?.message || error.message || 'Something went wrong'

    return Promise.reject(new Error(errorMessage))
  }
)

// 🌐 API methods
const apiService = {
  get: <T = any>(url: string, config = {}) => api.get<T>(url, config),
  post: <T = any>(url: string, data?: any, config = {}) => api.post<T>(url, data, config),
  put: <T = any>(url: string, data?: any, config = {}) => api.put<T>(url, data, config),
  delete: <T = any>(url: string, config = {}) => api.delete<T>(url, config),
}

export default apiService