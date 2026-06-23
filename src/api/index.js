import axios from 'axios'

// Базовый URL для всех запросов
const BASE_URL = 'https://wedev-api.sky.pro/api'

// Создаём экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Перехватчик запросов — добавляем токен в headers
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Перехватчик ответов — обрабатываем ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен истёк или невалидный → удаляем и отправляем на логин
      localStorage.removeItem('token')
      localStorage.removeItem('userName')
      localStorage.removeItem('userLogin')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api