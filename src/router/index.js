import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ExpensesView from '@/views/ExpensesView.vue'
import AnalyticsView from '@/views/AnalyticsView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/expenses' 
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { requiresAuth: false }
    },
    {
      path: '/expenses',
      name: 'expenses',
      component: ExpensesView,
      meta: { requiresAuth: true }
    },
    {
      path: '/analytics',
      name: 'analytics',
      component: AnalyticsView,
      meta: { requiresAuth: true }
    }
  ]
})

// Защита маршрутов
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')
  
  // Если страница требует авторизации, а пользователь не авторизован
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // Если пользователь уже авторизован, но пытается зайти на login/register
  else if ((to.path === '/login' || to.path === '/register') && isAuthenticated) {
    next('/expenses') 
  } 
  else {
    next()
  }
})

export default router