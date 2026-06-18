import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const setUser = (userData) => {
    user.value = userData
  }

  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
    } else {
      localStorage.removeItem('token')
    }
  }

  const logout = () => {
    user.value = null
    setToken('')
    localStorage.removeItem('userName')
    localStorage.removeItem('userLogin')
  }

  const isAuthenticated = () => {
    return !!token.value
  }

  return {
    user,
    token,
    setUser,
    setToken,
    logout,
    isAuthenticated
  }
})