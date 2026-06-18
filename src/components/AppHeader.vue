<template>
  <header class="app-header">
    <div class="header-content">
      <div class="logo">
        <!-- Иконка: чёрный квадрат с белыми столбцами -->
        <svg class="logo-icon" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          
          <rect x="0.5" y="0.5" width="31" height="31" rx="8" fill="#1A1A1A" stroke="#1A1A1A"/>
          
         
          <rect x="6" y="12" width="5" height="12" rx="2.5" fill="white"/>
          <rect x="13.5" y="7" width="5" height="17" rx="2.5" fill="white"/>
          <rect x="21" y="16" width="5" height="8" rx="2.5" fill="white"/>
        </svg>
        <span class="logo-text">Skypro.Wallet</span>
      </div>
      <nav v-if="isAuthenticated" class="header-nav">
        <router-link to="/expenses" class="nav-link">Мои расходы</router-link>
        <router-link to="/analytics" class="nav-link">Анализ расходов</router-link>
        <button @click="handleLogout" class="nav-link logout-btn">Выйти</button>
      </nav>
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

.logo-text:hover {
  color: #565EEF;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  font-size: 15px;
  font-weight: 500;
  color: #555555;
  text-decoration: none;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: color 0.2s;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.nav-link:hover {
  color: #565EEF;
}

.nav-link.router-link-active {
  color: #565EEF;
  font-weight: 600;
}

.logout-btn {
  color: #c62828;
}

.logout-btn:hover {
  color: #b71c1c;
}

@media (max-width: 768px) {
  .app-header {
    padding: 12px 16px;
  }
  
  .logo-icon {
    width: 28px;
    height: 28px;
  }
  
  .logo-text {
    font-size: 17px;
  }
  
  .header-nav {
    gap: 16px;
  }
  
  .nav-link {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .logo-icon {
    width: 24px;
    height: 24px;
  }
  
  .logo-text {
    font-size: 15px;
  }
  
  .header-nav {
    gap: 12px;
  }
  
  .nav-link {
    font-size: 12px;
  }
}
</style>