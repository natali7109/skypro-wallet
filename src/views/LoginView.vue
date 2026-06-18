<template>
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">Вход</h1>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <!-- Поле Email -->
        <div class="form-group" :class="getFieldClass('email')">
         
          <div class="input-wrapper">
            <input
              type="email"
              v-model="login"
              placeholder="Электронная почта"
              :disabled="loading"
              @input="handleInput('email')"
              @blur="validateField('email')"
              class="base-input"
            />
            <span v-if="errors.email && touched.email" class="error-star">*</span>
          </div>
          <div v-if="errors.email && touched.email" class="field-error">
            {{ errors.email }}
          </div>
        </div>

        <!-- Поле Пароль -->
        <div class="form-group" :class="getFieldClass('password')">
          
          <div class="input-wrapper">
            <input
              type="password"
              v-model="password"
              placeholder="Пароль"
              :disabled="loading"
              @input="handleInput('password')"
              @blur="validateField('password')"
              class="base-input"
            />
            <span v-if="errors.password && touched.password" class="error-star">*</span>
          </div>
          <div v-if="errors.password && touched.password" class="field-error">
            {{ errors.password }}
          </div>
        </div>

        <!-- Общая ошибка -->
        <div v-if="generalError" class="general-error">
          Упс! Введенные вами данные не корректны. Введите данные корректно и повторите попытку.
        </div>
        
        <!-- Кнопка -->
        <button 
          type="submit" 
          :disabled="!isFormValid || loading"
          class="login-button"
          :class="{ 'button-active': isFormValid && !loading, 'button-inactive': !isFormValid || loading }"
        >
          {{ loading ? 'Вход...' : 'Войти' }}
        </button>
      </form>
      
      <!-- Ссылка на регистрацию в две строки -->
      <div class="register-wrapper">
        <p class="register-text">Нужно зарегистрироваться?</p>
        <router-link to="/register" class="register-link">Зарегистрируйтесь здесь</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

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
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (login.value === 'test@example.com' && password.value === '123456') {
          resolve({
            user: { id: 1, name: 'Тестовый пользователь', email: login.value },
            token: 'fake-jwt-token-12345'
          })
        } else {
          reject(new Error('Invalid credentials'))
        }
      }, 1000)
    })
    
    localStorage.setItem('token', 'fake-jwt-token-12345')
    localStorage.setItem('userName', 'Тестовый пользователь')
    localStorage.setItem('userLogin', login.value)
    
    router.push('/expenses')
    
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
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F5F5F5;;
  padding: 20px;
}

.login-card {
  background: #FFFFFF;
  padding: 40px 32px 32px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
}

.login-title {
  margin-bottom: 28px;
  text-align: center;
  color: #1a1a1a;
  font-size: 26px;
  font-weight: 700;
  font-family:apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Группа полей */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-label {
  font-size: 14px;
  font-weight: 500;
  color: #555555;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin-bottom: 2px;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

/* Базовый стиль инпута */
.base-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #d0d0d0;
  border-radius: 10px;
  font-size: 16px;
  color: #999999;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
  height: 50px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.base-input::placeholder {
  color: #999999;
  font-size: 16px;
}

/* Состояние 1: Пустое поле (серая обводка, серый текст) */
.field-empty .base-input {
  border-color: #d0d0d0;
  color: #999999;
  background: #ffffff;
}

.field-empty .base-input::placeholder {
  color: #999999;
}

/* Состояние 2: При вводе (черный текст) */
.base-input:not(.field-empty) {
  color: #000000;
}

/* Состояние 3: Валидное поле (светло-фиолетовый фон, темно-фиолетовая обводка) */
.field-valid .base-input {
  border-color: #4a3cb5;
  background-color: #f0edff;
  color: #000000;
}

.field-valid .base-input::placeholder {
  color: #999999;
}

/* Состояние 4: Ошибка (светло-красный фон, темно-красная обводка) */
.field-error-state .base-input {
  border-color: #c62828;
  background-color: #fff5f5;
  color: #000000;
}

/* Стиль для звездочки ошибки */
.error-star {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #c62828;
  font-size: 20px;
  font-weight: 700;
}

/* Сообщение об ошибке поля */
.field-error {
  font-size: 12px;
  color: #c62828;
  padding-left: 4px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin-top: 2px;
}

/* Общая ошибка */
.general-error {
  background: #fff5f5;
  color: #c62828;
  padding: 10px 14px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
  border: 1px solid #ffcdd2;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Кнопка входа */
.login-button {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 50px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* Активная кнопка (фиолетовая) */
.login-button.button-active {
  background: #565EEF;
  color: #FFFFFF;
}

.login-button.button-active:hover:not(:disabled) {
  background: #33399b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 94, 239, 0.3);
}

/* Неактивная кнопка (серая) */
.login-button.button-inactive {
  background: #cccccc;
  color: #ffffff;
  cursor: not-allowed;
}

.login-button:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

/* Ссылка на регистрацию - две строки */
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}

.register-link {
  color: #565EEF;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: color 0.2s;
  text-align: center;
}

.register-link:hover {
  color: #33399b;
  text-decoration: underline;
}

/* Адаптация под мобильные устройства */
@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px 24px;
  }
  
  .login-title {
    font-size: 22px;
    margin-bottom: 24px;
  }
  
  .base-input,
  .login-button {
    height: 46px;
    padding: 12px 14px;
    font-size: 15px;
  }
  
  .register-wrapper {
    margin-top: 20px;
    gap: 4px;
  }
  
  .register-text,
  .register-link {
    font-size: 14px;
  }
}
</style>