<template>
  <div class="home-page">
    <AppHeader />
    
    <div class="home-content">
      <h1 class="page-title">Мои расходы</h1>
      
      <!-- Форма добавления транзакции -->
      <div class="add-form-card">
        <h2 class="form-title">Добавить расход</h2>
        
        <form @submit.prevent="handleAddTransaction" class="add-form">
          <div class="form-row">
            <BaseInput
              v-model="newTransaction.description"
              type="text"
              placeholder="Описание"
              :error="formErrors.description"
              @update:model-value="clearFieldError('description')"
            />
          </div>
          
          <div class="form-row">
            <BaseInput
              v-model="newTransaction.sum"
              type="number"
              placeholder="Сумма"
              :error="formErrors.sum"
              @update:model-value="clearFieldError('sum')"
            />
          </div>
          
          <div class="form-row">
            <select v-model="newTransaction.category" class="category-select">
              <option value="" disabled>Выберите категорию</option>
              <option value="food">Еда</option>
              <option value="transport">Транспорт</option>
              <option value="housing">Жильё</option>
              <option value="joy">Развлечения</option>
              <option value="education">Образование</option>
              <option value="others">Другое</option>
            </select>
          </div>
          
          <div class="form-row">
            <BaseInput
              v-model="newTransaction.date"
              type="date"
              :error="formErrors.date"
              @update:model-value="clearFieldError('date')"
            />
          </div>
          
          <BaseButton
            type="submit"
            :disabled="!isAddFormValid || isLoading"
            :loading="isLoading"
            label="Добавить"
          />
        </form>
      </div>
      
      <!-- Таблица транзакций -->
      <div class="transactions-card">
        <div class="table-header">
          <h2 class="form-title">Последние транзакции</h2>
          <button @click="loadTransactions" class="refresh-btn">Обновить</button>
        </div>
        
        <div v-if="loading" class="loading-text">Загрузка...</div>
        
        <div v-else-if="transactions.length === 0" class="empty-text">
          Нет транзакций. Добавьте первую!
        </div>
        
        <table v-else class="transactions-table">
          <thead>
            <tr>
              <th>Описание</th>
              <th>Категория</th>
              <th>Сумма</th>
              <th>Дата</th>
              <th class="actions-col">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in transactions" :key="transaction._id">
              <td>{{ transaction.description }}</td>
              <td>
                <span class="category-tag" :class="transaction.category">
                  {{ getCategoryLabel(transaction.category) }}
                </span>
              </td>
              <td :class="transaction.sum > 0 ? 'positive' : 'negative'">
                {{ formatSum(transaction.sum) }}
              </td>
              <td>{{ formatDate(transaction.date) }}</td>
              <td>
                <div class="actions">
                  <button 
                    @click="openEditModal(transaction)" 
                    class="action-btn edit-btn"
                    title="Редактировать"
                  >
                    ✏️
                  </button>
                  <button 
                    @click="handleDelete(transaction._id)" 
                    class="action-btn delete-btn"
                    title="Удалить"
                    :disabled="deletingId === transaction._id"
                  >
                    {{ deletingId === transaction._id ? '...' : '🗑️' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Модалка редактирования -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="closeEditModal">
      <div class="modal-content">
        <h2 class="modal-title">Редактировать транзакцию</h2>
        
        <form @submit.prevent="handleEditTransaction" class="edit-form">
          <div class="form-row">
            <BaseInput
              v-model="editTransaction.description"
              type="text"
              placeholder="Описание"
              :error="editErrors.description"
            />
          </div>
          
          <div class="form-row">
            <BaseInput
              v-model="editTransaction.sum"
              type="number"
              placeholder="Сумма"
              :error="editErrors.sum"
            />
          </div>
          
          <div class="form-row">
            <select v-model="editTransaction.category" class="category-select">
              <option value="" disabled>Выберите категорию</option>
              <option value="food">Еда</option>
              <option value="transport">Транспорт</option>
              <option value="housing">Жильё</option>
              <option value="joy">Развлечения</option>
              <option value="education">Образование</option>
              <option value="others">Другое</option>
            </select>
          </div>
          
          <div class="form-row">
            <BaseInput
              v-model="editTransaction.date"
              type="date"
            />
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeEditModal" class="modal-btn cancel-btn">
              Отмена
            </button>
            <BaseButton
              type="submit"
              :disabled="!isEditFormValid || isEditLoading"
              :loading="isEditLoading"
              label="Сохранить"
            />
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { getTransactions, addTransaction, deleteTransaction, updateTransaction } from '@/api/transactions'

const router = useRouter()
const userStore = useUserStore()

// Состояния
const transactions = ref([])
const loading = ref(false)
const isLoading = ref(false)
const deletingId = ref(null)
const showEditModal = ref(false)
const isEditLoading = ref(false)

// Новая транзакция
const newTransaction = ref({
  description: '',
  sum: '',
  category: '',
  date: ''
})

const formErrors = ref({
  description: '',
  sum: '',
  category: '',
  date: ''
})

// Редактирование
const editTransaction = ref({
  id: '',
  description: '',
  sum: '',
  category: '',
  date: ''
})

const editErrors = ref({
  description: '',
  sum: '',
  category: '',
  date: ''
})

// Категории
const categories = [
  { value: 'food', label: 'Еда' },
  { value: 'transport', label: 'Транспорт' },
  { value: 'housing', label: 'Жильё' },
  { value: 'joy', label: 'Развлечения' },
  { value: 'education', label: 'Образование' },
  { value: 'others', label: 'Другое' }
]

// Геттеры
const isAddFormValid = computed(() => {
  return (
    newTransaction.value.description.trim().length >= 4 &&
    Number(newTransaction.value.sum) > 0 &&
    newTransaction.value.category &&
    newTransaction.value.date
  )
})

const isEditFormValid = computed(() => {
  return (
    editTransaction.value.description.trim().length >= 4 &&
    Number(editTransaction.value.sum) > 0 &&
    editTransaction.value.category &&
    editTransaction.value.date
  )
})

// Методы
const getCategoryLabel = (value) => {
  const cat = categories.find(c => c.value === value)
  return cat ? cat.label : value
}

const formatSum = (sum) => {
  return `${sum} ₽`
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU')
}

const clearFieldError = (field) => {
  formErrors.value[field] = ''
}

// Загрузка транзакций
const loadTransactions = async () => {
  loading.value = true
  try {
    const response = await getTransactions()
    transactions.value = response.data || []
  } catch (error) {
    console.error('Ошибка загрузки транзакций:', error)
    if (error.response?.status === 401) {
      userStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

// Добавление транзакции
const handleAddTransaction = async () => {
  let isValid = true
  formErrors.value = { description: '', sum: '', category: '', date: '' }
  
  if (newTransaction.value.description.trim().length < 4) {
    formErrors.value.description = 'Минимум 4 символа'
    isValid = false
  }
  
  if (!newTransaction.value.sum || Number(newTransaction.value.sum) <= 0) {
    formErrors.value.sum = 'Укажите сумму'
    isValid = false
  }
  
  if (!newTransaction.value.category) {
    formErrors.value.category = 'Выберите категорию'
    isValid = false
  }
  
  if (!newTransaction.value.date) {
    formErrors.value.date = 'Укажите дату'
    isValid = false
  }
  
  if (!isValid) return
  
  isLoading.value = true
  
  try {
    const dateObj = new Date(newTransaction.value.date)
    const formattedDate = `${dateObj.getMonth() + 1}-${dateObj.getDate()}-${dateObj.getFullYear()}`
    
    await addTransaction({
      description: newTransaction.value.description.trim(),
      sum: Number(newTransaction.value.sum),
      category: newTransaction.value.category,
      date: formattedDate
    })
    
    newTransaction.value = {
      description: '',
      sum: '',
      category: '',
      date: ''
    }
    
    await loadTransactions()
    
  } catch (error) {
    console.error('Ошибка добавления:', error)
    alert('Ошибка при добавлении транзакции')
  } finally {
    isLoading.value = false
  }
}

// Удаление транзакции
const handleDelete = async (id) => {
  if (!confirm('Вы уверены, что хотите удалить эту транзакцию?')) return
  
  deletingId.value = id
  try {
    await deleteTransaction(id)
    await loadTransactions()
  } catch (error) {
    console.error('Ошибка удаления:', error)
    alert('Ошибка при удалении транзакции')
  } finally {
    deletingId.value = null
  }
}

// Открыть модалку редактирования
const openEditModal = (transaction) => {
  const dateObj = new Date(transaction.date)
  const formattedDate = dateObj.toISOString().split('T')[0]
  
  editTransaction.value = {
    id: transaction._id,
    description: transaction.description,
    sum: transaction.sum,
    category: transaction.category,
    date: formattedDate
  }
  editErrors.value = { description: '', sum: '', category: '', date: '' }
  showEditModal.value = true
}

// Закрыть модалку
const closeEditModal = () => {
  showEditModal.value = false
  editTransaction.value = {
    id: '',
    description: '',
    sum: '',
    category: '',
    date: ''
  }
}

// Редактирование транзакции
const handleEditTransaction = async () => {
  let isValid = true
  editErrors.value = { description: '', sum: '', category: '', date: '' }
  
  if (editTransaction.value.description.trim().length < 4) {
    editErrors.value.description = 'Минимум 4 символа'
    isValid = false
  }
  
  if (!editTransaction.value.sum || Number(editTransaction.value.sum) <= 0) {
    editErrors.value.sum = 'Укажите сумму'
    isValid = false
  }
  
  if (!editTransaction.value.category) {
    editErrors.value.category = 'Выберите категорию'
    isValid = false
  }
  
  if (!editTransaction.value.date) {
    editErrors.value.date = 'Укажите дату'
    isValid = false
  }
  
  if (!isValid) return
  
  isEditLoading.value = true
  
  try {
    const dateObj = new Date(editTransaction.value.date)
    const formattedDate = `${dateObj.getMonth() + 1}-${dateObj.getDate()}-${dateObj.getFullYear()}`
    
    await updateTransaction(editTransaction.value.id, {
      description: editTransaction.value.description.trim(),
      sum: Number(editTransaction.value.sum),
      category: editTransaction.value.category,
      date: formattedDate
    })
    
    closeEditModal()
    await loadTransactions()
    
  } catch (error) {
    console.error('Ошибка обновления:', error)
    alert('Ошибка при обновлении транзакции')
  } finally {
    isEditLoading.value = false
  }
}

// Загрузка при монтировании
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 20px;
  padding-top: 100px;
}

.home-content {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  font-family: 'Montserrat', sans-serif;
}

.add-form-card,
.transactions-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  font-family: 'Montserrat', sans-serif;
}

.add-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-row {
  display: flex;
  flex-direction: column;
}

.form-row:last-child {
  grid-column: span 2;
}

.category-select {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #d0d0d0;
  border-radius: 10px;
  font-size: 16px;
  font-family: 'Montserrat', sans-serif;
  background: #ffffff;
  color: #1a1a1a;
  height: 50px;
  outline: none;
  transition: all 0.3s ease;
}

.category-select:focus {
  border-color: #565EEF;
  box-shadow: 0 0 0 3px rgba(86, 94, 239, 0.1);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.refresh-btn {
  padding: 8px 20px;
  background: #565EEF;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.25s ease;
}

.refresh-btn:hover {
  background: #33399b;
}

.loading-text,
.empty-text {
  text-align: center;
  color: #888888;
  padding: 40px 0;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
}

.transactions-table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Montserrat', sans-serif;
}

.transactions-table thead {
  background: #f8f8f8;
}

.transactions-table th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #555555;
  font-size: 14px;
}

.transactions-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #1a1a1a;
  font-size: 14px;
}

.transactions-table tbody tr:hover {
  background: #fafafa;
}

.actions-col {
  text-align: center;
  width: 100px;
}

.actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
  padding: 4px 8px;
  border-radius: 6px;
  transition: background 0.2s;
}

.action-btn:hover {
  background: #f0f0f0;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.delete-btn:hover {
  background: #ffebee;
}

.edit-btn:hover {
  background: #e8f5e9;
}

.category-tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.category-tag.food { background: #e8f5e9; color: #2e7d32; }
.category-tag.transport { background: #e3f2fd; color: #0d47a1; }
.category-tag.housing { background: #fce4ec; color: #880e4f; }
.category-tag.joy { background: #f3e5f5; color: #6a1b9a; }
.category-tag.education { background: #fff3e0; color: #e65100; }
.category-tag.others { background: #eceff1; color: #37474f; }

.positive {
  color: #2e7d32;
  font-weight: 600;
}

.negative {
  color: #c62828;
  font-weight: 600;
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 32px;
  width: 100%;
  max-width: 460px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-title {
  font-size: 22px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  font-family: 'Montserrat', sans-serif;
  text-align: center;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.modal-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.25s ease;
  height: 50px;
}

.cancel-btn {
  background: #f0f0f0;
  color: #555555;
}

.cancel-btn:hover {
  background: #e0e0e0;
}

@media (max-width: 600px) {
  .add-form {
    grid-template-columns: 1fr;
  }
  
  .form-row:last-child {
    grid-column: span 1;
  }
  
  .home-content {
    padding: 0 10px;
  }
  
  .add-form-card,
  .transactions-card {
    padding: 16px;
  }
  
  .modal-content {
    padding: 20px;
    margin: 20px;
  }
  
  .actions-col {
    width: 70px;
  }
}
</style>