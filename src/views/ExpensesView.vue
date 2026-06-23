<template>
  <div class="expenses-page">
    <AppHeader />
    
    <div class="expenses-content">
      <h1 class="page-title">Все расходы</h1>
      
      <!-- Фильтры и сортировка -->
      <div class="filters-card">
        <div class="filters-row">
          <div class="filter-group">
            <label class="filter-label">Категория</label>
            <select v-model="filters.category" class="filter-select" @change="applyFilters">
              <option value="">Все категории</option>
              <option value="food">Еда</option>
              <option value="transport">Транспорт</option>
              <option value="housing">Жильё</option>
              <option value="joy">Развлечения</option>
              <option value="education">Образование</option>
              <option value="others">Другое</option>
            </select>
          </div>
          
          <div class="filter-group">
            <label class="filter-label">Сортировка</label>
            <select v-model="filters.sortBy" class="filter-select" @change="applyFilters">
              <option value="date">По дате (новые)</option>
              <option value="date_desc">По дате (старые)</option>
              <option value="sum">По сумме (большие)</option>
              <option value="sum_asc">По сумме (маленькие)</option>
            </select>
          </div>
          
          <button @click="resetFilters" class="reset-btn">Сбросить</button>
        </div>
      </div>
      
      <!-- Таблица транзакций -->
      <div class="transactions-card">
        <div class="table-header">
          <h2 class="form-title">
            Транзакции 
            <span v-if="filteredTransactions.length > 0" class="count-badge">
              {{ filteredTransactions.length }}
            </span>
          </h2>
          <button @click="loadTransactions" class="refresh-btn">Обновить</button>
        </div>
        
        <div v-if="loading" class="loading-text">Загрузка...</div>
        
        <div v-else-if="filteredTransactions.length === 0" class="empty-text">
          Нет транзакций
        </div>
        
        <table v-else class="transactions-table">
          <thead>
            <tr>
              <th>Описание</th>
              <th>Категория</th>
              <th>Сумма</th>
              <th>Дата</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in filteredTransactions" :key="transaction._id">
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
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import { getTransactions } from '@/api/transactions'

const router = useRouter()
const userStore = useUserStore()

// Состояния
const transactions = ref([])
const loading = ref(false)

// Фильтры
const filters = ref({
  category: '',
  sortBy: 'date'
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

// Фильтрация и сортировка
const filteredTransactions = computed(() => {
  let result = [...transactions.value]
  
  // Фильтрация по категории
  if (filters.value.category) {
    result = result.filter(t => t.category === filters.value.category)
  }
  
  // Сортировка
  switch (filters.value.sortBy) {
    case 'date':
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
      break
    case 'date_desc':
      result.sort((a, b) => new Date(a.date) - new Date(b.date))
      break
    case 'sum':
      result.sort((a, b) => b.sum - a.sum)
      break
    case 'sum_asc':
      result.sort((a, b) => a.sum - b.sum)
      break
    default:
      result.sort((a, b) => new Date(b.date) - new Date(a.date))
  }
  
  return result
})

// Методы
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

const applyFilters = () => {
  // computed сам пересчитается
}

const resetFilters = () => {
  filters.value.category = ''
  filters.value.sortBy = 'date'
}

// Загрузка при монтировании
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.expenses-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 20px;
  padding-top: 100px;
}

.expenses-content {
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

.filters-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.filters-row {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
  min-width: 150px;
}

.filter-label {
  font-size: 14px;
  font-weight: 500;
  color: #555555;
  font-family: 'Montserrat', sans-serif;
}

.filter-select {
  padding: 10px 14px;
  border: 2px solid #d0d0d0;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
  background: #ffffff;
  color: #1a1a1a;
  height: 44px;
  outline: none;
  transition: all 0.3s ease;
  cursor: pointer;
}

.filter-select:focus {
  border-color: #565EEF;
  box-shadow: 0 0 0 3px rgba(86, 94, 239, 0.1);
}

.reset-btn {
  padding: 10px 24px;
  background: #f0f0f0;
  color: #555555;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: all 0.25s ease;
  height: 44px;
  white-space: nowrap;
}

.reset-btn:hover {
  background: #e0e0e0;
}

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
  font-family: 'Montserrat', sans-serif;
  display: flex;
  align-items: center;
  gap: 10px;
}

.count-badge {
  background: #565EEF;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 10px;
  border-radius: 20px;
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

@media (max-width: 600px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-group {
    min-width: auto;
  }
  
  .reset-btn {
    width: 100%;
  }
  
  .expenses-content {
    padding: 0 10px;
  }
  
  .transactions-card {
    padding: 16px;
  }
}
</style>