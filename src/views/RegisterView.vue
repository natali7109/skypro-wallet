<template>
  <div class="register-page">
  <AppHeader />
    <div class="register-card">
      <h1 class="register-title">Регистрация</h1>
      
      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
         
        <div class="form-group" :class="getFieldClass('name')">
         
          <div class="input-wrapper">
            <input
              type="text"
              v-model="name"
              placeholder="Имя"
              :disabled="loading"
              @input="handleInput('name')"
              @blur="validateField('name')"
              class="base-input"
            />
            <span v-if="errors.name && touched.name" class="error-star">*</span>
          </div>
          <div v-if="errors.name && touched.name" class="field-error">
            {{ errors.name }}
          </div>
        </div>

         
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
        
        <button 
          type="submit" 
          :disabled="!isFormValid || loading"
          class="register-button"
          :class="{ 'button-active': isFormValid && !loading, 'button-inactive': !isFormValid || loading }"
        >
          {{ loading ? 'Регистрация...' : 'Зарегистрироваться' }}
        </button>
      </form>
      
       
      <div class="login-wrapper">
        <p class="login-text">Уже есть аккаунт?</p>
        <router-link to="/login" class="login-link">Войдите здесь</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from '@/components/AppHeader.vue'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

 
const name = ref('')
const login = ref('')
const password = ref('')
const loading = ref(false)
const generalError = ref('')
const errors = ref({
  name: '',
  email: '',
  password: ''
})

const touched = ref({
  name: false,
  email: false,
  password: false
})

 
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return emailRegex.test(email)
}

 
const validateField = (field) => {
  touched.value[field] = true
  
  switch(field) {
    case 'name':
      if (!name.value) {
        errors.value.name = ''
      } else if (name.value.length < 2) {
        errors.value.name = 'Имя должно содержать минимум 2 символа'
      } else {
        errors.value.name = ''
      }
      break
      
    case 'email':
      if (!login.value) {
        errors.value.email = ''
      } else if (!validateEmail(login.value)) {
        errors.value.email = 'Введите корректный email'
      } else {
        errors.value.email = ''
      }
      break
      
    case 'password':
      if (!password.value) {
        errors.value.password = ''
      } else if (password.value.length < 6) {
        errors.value.password = 'Пароль должен содержать минимум 6 символов'
      } else {
        errors.value.password = ''
      }
      break
  }
}

 
const validateAllFields = () => {
  ['name', 'email', 'password'].forEach(field => {
    validateField(field)
  })
}

 
const handleInput = (field) => {
  touched.value[field] = true
  generalError.value = ''
  
  errors.value[field] = ''
  
  
  validateField(field)
}

 
const getFieldClass = (field) => {
  const fieldMap = {
    name: name.value,
    email: login.value,
    password: password.value
  }
  
  const value = fieldMap[field]
  const hasError = errors.value[field]
  const isTouched = touched.value[field]
  
  if (!value && !isTouched) return 'field-empty'
  if (hasError && isTouched) return 'field-error-state'
  if (value && !hasError) return 'field-valid'
  return 'field-empty'
}

 
const isFormValid = computed(() => {
  // Проверяем все поля
  const isNameValid = name.value && name.value.length >= 2
  const isEmailValid = login.value && validateEmail(login.value)
  const isPasswordValid = password.value && password.value.length >= 6
  
   
  const hasNoErrors = !errors.value.name && !errors.value.email && !errors.value.password
  
  return isNameValid && isEmailValid && isPasswordValid && hasNoErrors
})

 
watch([name, login, password], () => {
  // Пересчитываем валидность при любом изменении
  // computed сам пересчитается
}, { deep: true })

 
const handleRegister = async () => {
  // Валидируем все поля перед отправкой
  validateAllFields()
  
  if (!isFormValid.value) {
    return
  }
  
  loading.value = true
  generalError.value = ''
  
  try {
    await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (login.value === 'existing@example.com') {
          reject(new Error('Пользователь с таким email уже зарегистрирован'))
        } else {
          resolve({ success: true })
        }
      }, 1000)
    })
    
    router.push('/login')
    
  } catch (error) {
    generalError.value = error.message || 'Ошибка при регистрации'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
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

.register-card {
  background: #FFFFFF;
  padding: 28px 28px 24px;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  max-height: calc(100vh - 140px);
  overflow: hidden;  
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  box-sizing: border-box;  
}

.register-title {
  margin-bottom: 20px;
  text-align: center;
  color: #1a1a1a;
  font-size: 24px;
  font-weight: 700;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
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

 
.field-empty .base-input {
  border-color: #d0d0d0;
  color: #999999;
  background: #ffffff;
}

.field-empty .base-input::placeholder {
  color: #999999;
}

 
.base-input:not(.field-empty) {
  color: #000000;
}

 
.field-valid .base-input {
  border-color: #4a3cb5;
  background-color: #f0edff;
  color: #000000;
}

.field-valid .base-input::placeholder {
  color: #999999;
}

 
.field-error-state .base-input {
  border-color: #c62828;
  background-color: #fff5f5;
  color: #000000;
}

  
.error-star {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #c62828;
  font-size: 20px;
  font-weight: 700;
}

 
.field-error {
  font-size: 12px;
  color: #c62828;
  padding-left: 4px;
  font-weight: 500;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin-top: 2px;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin-bottom: 4px;
}

 
.register-button {
  width: 100%;
  padding: 14px 16px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 46px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  margin-top: 4px;
}

 
.register-button.button-active {
  background: #565EEF;
  color: #FFFFFF;
}

.register-button.button-active:hover:not(:disabled) {
  background: #33399b;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(86, 94, 239, 0.3);
}

 
.register-button.button-inactive {
  background: #cccccc;
  color: #ffffff;
  cursor: not-allowed;
}

.register-button:disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

 
.login-wrapper {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.login-text {
  margin: 0;
  color: #555555;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  text-align: center;
}

.login-link {
  color: #565EEF;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  transition: color 0.2s;
  text-align: center;
}

.login-link:hover {
  color: #33399b;
  text-decoration: underline;
}


</style>