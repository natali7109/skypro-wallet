import api from './index.js'

/**
 * Регистрация нового пользователя
 * @param {Object} data - { name, email, password }
 * @returns {Promise} - { user, token }
 */
export const register = (data) => {
  return api.post('/auth/register', data)
}

/**
 * Вход пользователя
 * @param {Object} data - { email, password }
 * @returns {Promise} - { user, token }
 */
export const login = (data) => {
  return api.post('/auth/login', data)
}

/**
 * Получение информации о текущем пользователе
 * @returns {Promise} - { user }
 */
export const getMe = () => {
  return api.get('/auth/me')
}