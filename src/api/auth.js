import api from './index.js'

// Правильный адрес из прошлого проекта!
const API_URL = '/api/user'

export const register = (data) => {
  console.log('📤 Регистрация:', data)
  return api.post(API_URL, {
    name: data.name,
    login: data.login,    // ← данные уже приходят с правильным полем
    password: data.password
  })
}

export const login = (data) => {
  console.log('📤 Вход:', data)
  return api.post(`${API_URL}/login`, {
    login: data.login,
    password: data.password
  })
}

export const getMe = () => {
  return api.get('/api/auth/me')
}