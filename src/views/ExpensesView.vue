<template>
  <div class="expenses-page">
    <div class="page-container">
      <h1 class="page-title">Мои расходы</h1>

      <div class="content-grid">
        <!-- Таблица расходов -->
        <div class="expenses-table-wrapper">
          <h2 class="section-title">Таблица расходов</h2>
          
          <div v-if="transactionsStore.isLoading" class="loading">
            Загрузка...
          </div>
          
          <div v-else-if="transactionsStore.error" class="error">
            {{ transactionsStore.error }}
          </div>
          
          <div class="table-scroll" v-else>
            <table class="expenses-table">
              <thead>
                <tr>
                  <th>Описание</th>
                  <th>Категория</th>
                  <th>Дата</th>
                  <th>Сумма</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="expense in transactionsStore.transactions" :key="expense.id">
                  <td>{{ expense.description }}</td>
                  <td>{{ expense.category }}</td>
                  <td>{{ expense.date }}</td>
                  <td>{{ expense.amount }} ₽</td>
                  <td>
                    <button 
                      @click="deleteExpense(expense.id)" 
                      class="delete-btn"
                      title="Удалить расход"
                      :disabled="transactionsStore.isLoading"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Форма добавления -->
        <div class="add-expense-wrapper">
          <h2 class="section-title">Новый расход</h2>
          
          <form @submit.prevent="submitExpense" class="expense-form">
            <div class="form-group">
              <label for="description">Описание</label>
              <input 
                id="description"
                v-model="expenseForm.description" 
                type="text" 
                placeholder="Введите описание"
                required
                minlength="4"
              />
            </div>

            <div class="form-group">
              <label>Категория</label>
              <div class="category-select">
                <button 
                  v-for="category in categories" 
                  :key="category"
                  type="button"
                  class="category-btn"
                  :class="{ active: expenseForm.category === category }"
                  @click="expenseForm.category = category"
                >
                  <img 
                    :src="categoryIcons[category]" 
                    :alt="category" 
                    class="category-icon"
                  />
                  {{ category }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label for="date">Дата</label>
              <input 
                id="date"
                v-model="expenseForm.date" 
                type="date" 
                required
              />
            </div>

            <div class="form-group">
              <label for="amount">Сумма</label>
              <input 
                id="amount"
                v-model="expenseForm.amount" 
                type="number" 
                placeholder="Введите сумму"
                required
                min="1"
              />
            </div>

            <button type="submit" class="submit-btn" :disabled="transactionsStore.isLoading">
              {{ transactionsStore.isLoading ? 'Добавление...' : 'Добавить новый расход' }}
            </button>
            
            <div v-if="formError" class="form-error">{{ formError }}</div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'
import foodIcon from '@/assets/icons/food.svg'
import transportIcon from '@/assets/icons/transport.svg'
import housingIcon from '@/assets/icons/housing.svg'
import entertainmentIcon from '@/assets/icons/entertainment.svg'
import educationIcon from '@/assets/icons/education.svg'
import otherIcon from '@/assets/icons/other.svg'

// ===== Хранилище =====
const transactionsStore = useTransactionsStore()
const formError = ref('')

// ===== Категории и иконки =====
const categories = ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Образование', 'Другое']

const categoryIcons = {
  'Еда': foodIcon,
  'Транспорт': transportIcon,
  'Жильё': housingIcon,
  'Развлечения': entertainmentIcon,
  'Образование': educationIcon,
  'Другое': otherIcon
}

// ===== Форма =====
const expenseForm = ref({
  description: '',
  category: '',
  date: '',
  amount: ''
})

// ===== Валидация =====
const validateForm = () => {
  const { description, category, date, amount } = expenseForm.value
  
  if (!description || !category || !date || !amount) {
    return 'Пожалуйста, заполните все поля'
  }
  
  if (description.length < 4) {
    return 'Описание должно содержать минимум 4 символа'
  }
  
  if (Number(amount) <= 0) {
    return 'Сумма должна быть положительным числом'
  }
  
  return null
}

const clearForm = () => {
  expenseForm.value = {
    description: '',
    category: '',
    date: '',
    amount: ''
  }
}

// ===== Действия =====
const submitExpense = async () => {
  formError.value = ''
  
  const validationError = validateForm()
  if (validationError) {
    formError.value = validationError
    return
  }

  const result = await transactionsStore.addTransaction({
    description: expenseForm.value.description,
    category: expenseForm.value.category,
    date: expenseForm.value.date,
    amount: Number(expenseForm.value.amount)
  })
  
  if (result.success) {
    clearForm()
  } else {
    formError.value = result.error || 'Ошибка добавления расхода'
  }
}

const deleteExpense = async (id) => {
  if (confirm('Вы уверены, что хотите удалить этот расход?')) {
    await transactionsStore.deleteTransaction(id)
  }
}

// ===== Загрузка данных =====
onMounted(async () => {
  await transactionsStore.fetchTransactions()
})
</script>

<style scoped>
.expenses-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding-top: 100px;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 32px 40px;
}

.page-title {
  font-size: 32px;
  font-weight: 700;
  color: #1A1A1A;
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 16px;
}

.content-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  align-items: stretch;
}

/* ===== Таблица ===== */
.expenses-table-wrapper {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.table-scroll {
  overflow-x: auto;
  max-height: 500px;
  overflow-y: auto;
}

.table-scroll::-webkit-scrollbar {
  width: 6px;
}

.table-scroll::-webkit-scrollbar-track {
  background: #F5F5F5;
  border-radius: 3px;
}

.table-scroll::-webkit-scrollbar-thumb {
  background: #7334EA;
  border-radius: 3px;
}

.expenses-table {
  width: 100%;
  border-collapse: collapse;
}

.expenses-table thead th {
  text-align: left;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #555555;
  border-bottom: 2px solid #E8E8E8;
  position: sticky;
  top: 0;
  background: #FFFFFF;
  z-index: 1;
}

.expenses-table thead th:last-child {
  text-align: center;
  width: 60px;
}

.expenses-table tbody td {
  padding: 12px 16px;
  font-size: 14px;
  color: #1A1A1A;
  border-bottom: 1px solid #F0F0F0;
}

.expenses-table tbody td:last-child {
  text-align: center;
}

.expenses-table tbody tr:hover {
  background: #F8F8F8;
}

.expenses-table tbody tr:last-child td {
  border-bottom: none;
}

.delete-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 8px;
  color: #999999;
  transition: color 0.2s, transform 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  color: #FF4444;
  transform: scale(1.1);
}

.delete-btn:active {
  transform: scale(0.9);
}

.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== Форма ===== */
.add-expense-wrapper {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.expense-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 16px;
  font-weight: 500;
  color: #1A1A1A;
}

.form-group input {
  padding: 10px 14px;
  border: 1px solid #E8E8E8;
  border-radius: 8px;
  font-size: 14px;
  color: #1A1A1A;
  transition: border-color 0.2s;
  width: 100%;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #7334EA;
}

.form-group input::placeholder {
  color: #999999;
}

.form-group input:valid {
  border-color: #7334EA;
  background-color: #F5F0FF;
}

.form-group input:valid:focus {
  border-color: #5A28C7;
  background-color: #EDE4FF;
}

.category-select {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.category-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 6px 16px;
  border: 1px solid #E8E8E8;
  border-radius: 20px;
  background: #FFFFFF;
  color: #555555;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  width: auto;
  justify-content: flex-start;
}

.category-btn:hover,
.category-btn.active {
  color: #7334EA;
}

.category-btn .category-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.category-btn.active .category-icon {
  filter: brightness(0) saturate(100%) invert(30%) sepia(80%) saturate(3000%) hue-rotate(250deg) brightness(95%);
}

.submit-btn {
  padding: 12px 24px;
  background: #7334EA;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 8px;
  width: 100%;
}

.submit-btn:hover {
  background: #5A28C7;
}

.submit-btn:active {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== Состояния ===== */
.loading {
  text-align: center;
  padding: 40px;
  color: #999999;
}

.error {
  text-align: center;
  padding: 40px;
  color: #FF4444;
}

.form-error {
  color: #FF4444;
  font-size: 14px;
  text-align: center;
  margin-top: -10px;
}

/* ===== Адаптивность ===== */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .expenses-page {
    padding-top: 80px;
  }
  
  .page-container {
    padding: 0 16px 24px;
  }

  .content-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .expenses-table-wrapper,
  .add-expense-wrapper {
    padding: 16px;
  }

  .expenses-table {
    font-size: 12px;
  }

  .expenses-table thead th,
  .expenses-table tbody td {
    padding: 8px 10px;
  }

  .category-select {
    gap: 6px;
  }

  .category-btn {
    padding: 4px 12px;
    font-size: 12px;
  }

  .page-title {
    font-size: 24px;
  }

  .section-title {
    font-size: 18px;
  }
}
</style>
