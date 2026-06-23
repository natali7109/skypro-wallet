<template>
  <div class="login-page">
    <AppHeader />
    <div class="login-card">
      <h1 class="login-title">Вход</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Поле Email -->
        <div class="form-group" :class="getFieldClass('email')">
          <BaseInput
            v-model="login"
            type="email"
            placeholder="Электронная почта"
            :error="errors.email && touched.email ? errors.email : ''"
            :disabled="loading"
            @blur="validateField('email')"
            @update:model-value="handleInput('email')"
          />
        </div>
        
        <!-- Поле Пароль -->
        <div class="form-group" :class="getFieldClass('password')">
          <BaseInput
            v-model="password"
            type="password"
            placeholder="Пароль"
            :error="errors.password && touched.password ? errors.password : ''"
            :disabled="loading"
            @blur="validateField('password')"
            @update:model-value="handleInput('password')"
          />
        </div>

        <!-- Общая ошибка -->
        <div v-if="generalError" class="general-error">
          {{ generalError }}
        </div>
        
        <!-- Кнопка -->
        <BaseButton
          type="submit"
          :disabled="!isFormValid || loading || userStore.isLoading"
          :loading="loading || userStore.isLoading"
          label="Войти"
        />
      </form>
      
      <div class="register-wrapper">
        <p class="register-text">Нужно зарегистрироваться?</p>
        <router-link to="/register" class="register-link">Зарегистрируйтесь здесь</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Состояния формы
const login = ref('')
const password = ref('')
const loading = ref(false)
const generalError = ref('')
const errors = ref({
  email: '',
  password: ''
})

const touched = ref({
  email: false,
  password: false
})

// Валидация email
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return emailRegex.test(email)
}

// Получение класса для поля
const getFieldClass = (field) => {
  if (field === 'email') {
    if (!login.value && !touched.value.email) return 'field-empty'
    if (errors.value.email && touched.value.email) return 'field-error-state'
    if (login.value && !errors.value.email) return 'field-valid'
    return 'field-empty'
  }
  
  if (field === 'password') {
    if (!password.value && !touched.value.password) return 'field-empty'
    if (errors.value.password && touched.value.password) return 'field-error-state'
    if (password.value && !errors.value.password) return 'field-valid'
    return 'field-empty'
  }
  
  return ''
}

// Обработка ввода
const handleInput = (field) => {
  touched.value[field] = true
  generalError.value = ''
  
  if (field === 'email') {
    errors.value.email = ''
    if (login.value && !validateEmail(login.value)) {
      errors.value.email = 'Введите корректный email'
    }
  }
  
  if (field === 'password') {
    errors.value.password = ''
    if (password.value && password.value.length < 6) {
      errors.value.password = 'Пароль должен содержать минимум 6 символов'
    }
  }
}

// Валидация поля при потере фокуса
const validateField = (field) => {
  touched.value[field] = true
  
  if (field === 'email') {
    if (!login.value) {
      errors.value.email = ''
    } else if (!validateEmail(login.value)) {
      errors.value.email = 'Введите корректный email'
    } else {
      errors.value.email = ''
    }
  }
  
  if (field === 'password') {
    if (!password.value) {
      errors.value.password = ''
    } else if (password.value.length < 6) {
      errors.value.password = 'Пароль должен содержать минимум 6 символов'
    } else {
      errors.value.password = ''
    }
  }
}

// Проверка валидности формы
const isFormValid = computed(() => {
  const isEmailValid = login.value && validateEmail(login.value)
  const isPasswordValid = password.value && password.value.length >= 6
  return isEmailValid && isPasswordValid && !errors.value.email && !errors.value.password
})

// Обработка входа
const handleLogin = async () => {
  touched.value.email = true
  touched.value.password = true
  
  validateField('email')
  validateField('password')
  
  if (!isFormValid.value) {
    return
  }
  
  loading.value = true
  generalError.value = ''
  
  try {
    const result = await userStore.login({
      email: login.value,
      password: password.value
    })
    
    if (result.success) {
      router.push('/expenses')
    } else {
      generalError.value = 'Упс! Введенные вами данные не корректны. Введите данные корректно и повторите попытку.'
      errors.value.email = ' '
      errors.value.password = ' '
    }
  } catch (error) {
    generalError.value = 'Упс! Введенные вами данные не корректны. Введите данные корректно и повторите попытку.'
    errors.value.email = ' '
    errors.value.password = ' '
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;
  padding: 20px;
  padding-top: 100px;
  overflow: hidden;
  box-sizing: border-box;
}

.login-card {
  background: #FFFFFF;
  padding: 24px 28px 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 140px);
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;
}

.login-title {
  margin-bottom: 28px;
  text-align: center;
  color: #1a1a1a;
  font-size: 26px;
  font-weight: 700;
  font-family: 'Montserrat', sans-serif;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.general-error {
  background: #fff5f5;
  color: #c62828;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #ffcdd2;
  font-family: 'Montserrat', sans-serif;
}

.register-wrapper {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.register-text {
  margin: 0;
  color: #555555;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
}

.register-link {
  color: #565EEF;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
  transition: color 0.2s;
  text-align: center;
}

.register-link:hover {
  color: #33399b;
  text-decoration: underline;
}
</style>