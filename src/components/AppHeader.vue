<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <!-- Иконка -->
        <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#1A1A1A" stroke="#1A1A1A"/>
          <rect x="6" y="12" width="5" height="12" rx="2.5" fill="white"/>
          <rect x="13.5" y="7" width="5" height="17" rx="2.5" fill="white"/>
          <rect x="21" y="16" width="5" height="8" rx="2.5" fill="white"/>
        </svg>
        <span class="logo-text">Skypro.Wallet</span>
      </div>
      
      <nav v-if="isAuthenticated" class="header-nav">
        <router-link to="/expenses" class="nav-link" active-class="active-link">Мои расходы</router-link>
        <router-link to="/analytics" class="nav-link" active-class="active-link">Анализ расходов</router-link>
      </nav>

      <div v-if="isAuthenticated" class="header-actions">
        <button @click="handleLogout" class="nav-link logout-btn">Выйти</button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

const isAuthenticated = computed(() => {
  return !!localStorage.getItem('token')
})

const handleLogout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('userName')
  localStorage.removeItem('userLogin')
  userStore.logout?.()
  router.push('/login')
}
</script>

<style scoped>
.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: #FFFFFF;
  border-bottom: 1px solid #E8E8E8;
  padding: 16px 32px;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
  flex-shrink: 0;
}

.logo-icon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
}

.logo-text {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  letter-spacing: -0.3px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 48px;
  flex: 1;
  justify-content: center;
}

.header-actions {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.nav-link {
  font-size: 15px;
  font-weight: 400;
  color: #000000;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  position: relative;
}

.nav-link:hover {
  color: #7334EA;
}

/* Активное состояние с подчёркиванием */
.nav-link.active-link {
  color: #7334EA;
  font-weight: 600;
  text-decoration: none;
}

/* Подчёркивание для активной ссылки */
.nav-link.active-link::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #7334EA;
  border-radius: 2px;
}

.logout-btn {
  color: #000000;
}

.logout-btn:hover {
  color: #7334EA;
}

/* Убираем подчёркивание у кнопки выхода */
.logout-btn.active-link::after {
  display: none;
}
</style>