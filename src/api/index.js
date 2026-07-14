import axios from 'axios'

const BASE_URL = ''

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': ''  // ← Пустой заголовок
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  // Убеждаемся, что Content-Type пустой
  config.headers['Content-Type'] = ''
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userLogin')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api