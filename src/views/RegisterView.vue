<template>
  <div class="register-page">
    <AppHeader />
    <div class="register-card">
      <h1 class="register-title">Регистрация</h1>
      
      <div v-if="generalError" class="general-error">
        {{ generalError }}
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <!-- Имя -->
        <div class="form-group" :class="getFieldClass('name')">
          <BaseInput
            v-model="name"
            type="text"
            placeholder="Имя"
            :error="errors.name && touched.name ? errors.name : ''"
            :disabled="loading"
            @blur="validateField('name')"
            @update:model-value="handleInput('name')"
          />
        </div>

        <!-- Email -->
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

        <!-- Пароль -->
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
        
        <!-- Кнопка -->
        <BaseButton
          type="submit"
          :disabled="!isFormValid || loading || userStore.isLoading"
          :loading="loading || userStore.isLoading"
          label="Зарегистрироваться"
        />
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
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Состояния формы
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

// Валидация
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/
  return emailRegex.test(email)
}

// Валидация конкретного поля
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

// Валидация всех полей
const validateAllFields = () => {
  ['name', 'email', 'password'].forEach(field => {
    validateField(field)
  })
}

// Обработка ввода
const handleInput = (field) => {
  touched.value[field] = true
  generalError.value = ''
  errors.value[field] = ''
  validateField(field)
}

// Получение класса для поля
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

// Проверка валидности формы
const isFormValid = computed(() => {
  const isNameValid = name.value && name.value.length >= 2
  const isEmailValid = login.value && validateEmail(login.value)
  const isPasswordValid = password.value && password.value.length >= 6
  const hasNoErrors = !errors.value.name && !errors.value.email && !errors.value.password
  return isNameValid && isEmailValid && isPasswordValid && hasNoErrors
})

// Следим за изменениями полей
watch([name, login, password], () => {}, { deep: true })

// Обработка регистрации
const handleRegister = async () => {
  validateAllFields()
  
  if (!isFormValid.value) {
    return
  }
  
  loading.value = true
  generalError.value = ''
  
  const userData = {
    name: name.value,
    email: login.value,
    password: password.value
  }
  
  console.log('📤 Отправка регистрации:', userData)
  
  try {
    const result = await userStore.register(userData)
    console.log('📥 Результат:', result)
    
    if (result.success) {
      router.push('/expenses')
    } else {
      generalError.value = result.error || 'Ошибка регистрации'
    }
  } catch (error) {
    console.error('❌ Ошибка:', error)
    generalError.value = 'Ошибка соединения с сервером'
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
  font-family: 'Montserrat', sans-serif;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  margin-bottom: 4px;
}

.login-wrapper {
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.login-text {
  margin: 0;
  color: #555555;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
}

.login-link {
  color: #565EEF;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  font-family: 'Montserrat', sans-serif;
  transition: color 0.2s;
  text-align: center;
}

.login-link:hover {
  color: #33399b;
  text-decoration: underline;
}
</style>