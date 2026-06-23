import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { login as loginApi, register as registerApi, getMe } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  // Состояние
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')
  const isLoading = ref(false)
  const error = ref('')

  // Геттеры
  const isAuthenticated = computed(() => !!token.value)

  // Действия
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const setUser = (userData) => {
    user.value = userData
    if (userData) {
      localStorage.setItem('userName', userData.name || '')
      localStorage.setItem('userLogin', userData.email || '')
    }
  }

  const login = async (credentials) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await loginApi(credentials)
      const { user, token } = response.data
      
      setToken(token)
      setUser(user)
      
      return { success: true, user, token }
    } catch (err) {
      const message = err.response?.data?.message || 'Ошибка входа'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const register = async (userData) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await registerApi(userData)
      const { user, token } = response.data
      
      setToken(token)
      setUser(user)
      
      return { success: true, user, token }
    } catch (err) {
      const message = err.response?.data?.message || 'Ошибка регистрации'
      error.value = message
      return { success: false, error: message }
    } finally {
      isLoading.value = false
    }
  }

  const fetchUser = async () => {
    if (!isAuthenticated.value) return
    
    try {
      const response = await getMe()
      setUser(response.data.user)
    } catch (err) {
      console.error('Ошибка получения пользователя:', err)
      logout()
    }
  }

  const logout = () => {
    user.value = null
    setToken('')
    localStorage.removeItem('userName')
    localStorage.removeItem('userLogin')
  }

  return {
    // Состояние
    user,
    token,
    isLoading,
    error,
    // Геттеры
    isAuthenticated,
    // Действия
    setToken,
    setUser,
    login,
    register,
    fetchUser,
    logout,
  }
})