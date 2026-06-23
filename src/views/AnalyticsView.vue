<template>
  <div class="analytics-page">
    <AppHeader />
    
    <div class="analytics-content">
      <h1 class="page-title">Аналитика расходов</h1>
      
      <!-- Выбор периода -->
      <div class="period-card">
        <div class="period-row">
          <div class="period-group">
            <label class="period-label">Начало</label>
            <input 
              type="date" 
              v-model="period.start" 
              class="period-input"
              @change="loadAnalytics"
            />
          </div>
          <div class="period-group">
            <label class="period-label">Конец</label>
            <input 
              type="date" 
              v-model="period.end" 
              class="period-input"
              @change="loadAnalytics"
            />
          </div>
          <button @click="setDefaultPeriod" class="period-btn">Текущий месяц</button>
          <button @click="loadAnalytics" class="period-btn primary">Применить</button>
        </div>
      </div>
      
      <div class="analytics-grid">
        <!-- Календарь -->
        <div class="analytics-card calendar-card">
          <h2 class="card-title">Календарь</h2>
          <div class="calendar-container">
            <div class="calendar-header">
              <button @click="changeMonth(-1)" class="calendar-nav">‹</button>
              <span class="calendar-month">{{ currentMonth }}</span>
              <button @click="changeMonth(1)" class="calendar-nav">›</button>
            </div>
            
            <div class="calendar-weekdays">
              <div v-for="day in weekDays" :key="day" class="weekday">
                {{ day }}
              </div>
            </div>
            
            <div class="calendar-days">
              <div
                v-for="day in calendarDays"
                :key="day.date"
                class="calendar-day"
                :class="{
                  'empty': !day.date,
                  'today': day.isToday,
                  'has-transaction': day.hasTransaction
                }"
                @click="day.hasTransaction && selectDay(day)"
              >
                <span v-if="day.date" class="day-number">{{ day.date }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Диаграмма -->
        <div class="analytics-card chart-card">
          <h2 class="card-title">Распределение расходов</h2>
          
          <div v-if="loading" class="loading-text">Загрузка...</div>
          
          <div v-else-if="chartData.length === 0" class="chart-empty">
            Нет данных за выбранный период
          </div>
          
          <div v-else class="chart-container">
            <div class="chart-bars">
              <div
                v-for="item in chartData"
                :key="item.category"
                class="chart-bar-wrapper"
              >
                <div class="chart-bar-label">{{ item.label }}</div>
                <div class="chart-bar-track">
                  <div
                    class="chart-bar-fill"
                    :style="{
                      height: item.percentage + '%',
                      backgroundColor: item.color
                    }"
                  >
                    <span class="chart-bar-value">{{ item.percentage }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Итоги по категориям -->
      <div class="analytics-card summary-card">
        <h2 class="card-title">Итоги по категориям</h2>
        
        <div v-if="loading" class="loading-text">Загрузка...</div>
        
        <div v-else-if="summaryData.length === 0" class="summary-empty">
          Нет данных за выбранный период
        </div>
        
        <div v-else class="summary-grid">
          <div
            v-for="item in summaryData"
            :key="item.category"
            class="summary-item"
          >
            <span class="summary-dot" :style="{ backgroundColor: item.color }"></span>
            <span class="summary-label">{{ item.label }}</span>
            <span class="summary-value">{{ formatSum(item.total) }}</span>
          </div>
          <div class="summary-item total-item">
            <span class="summary-label">ИТОГО</span>
            <span class="summary-value total-value">{{ formatSum(totalSum) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import AppHeader from '@/components/AppHeader.vue'
import { getTransactionsByPeriod } from '@/api/transactions'

const router = useRouter()
const userStore = useUserStore()

// Состояния
const loading = ref(false)
const transactions = ref([])
const selectedDate = ref(null)

// Период
const period = ref({
  start: '',
  end: ''
})

// Категории
const categories = [
  { value: 'food', label: 'Еда', color: '#4CAF50' },
  { value: 'transport', label: 'Транспорт', color: '#2196F3' },
  { value: 'housing', label: 'Жильё', color: '#E91E63' },
  { value: 'joy', label: 'Развлечения', color: '#9C27B0' },
  { value: 'education', label: 'Образование', color: '#FF9800' },
  { value: 'others', label: 'Другое', color: '#607D8B' }
]

// Состояние календаря
const currentDate = ref(new Date())
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

// Геттеры для календаря
const currentMonth = computed(() => {
  return currentDate.value.toLocaleDateString('ru-RU', {
    month: 'long',
    year: 'numeric'
  })
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay() === 0 ? 7 : firstDay.getDay()
  
  // Создаём карту дней с транзакциями
  const transactionDays = new Set()
  transactions.value.forEach(t => {
    const date = new Date(t.date)
    if (date.getMonth() === month && date.getFullYear() === year) {
      transactionDays.add(date.getDate())
    }
  })
  
  const days = []
  const today = new Date()
  
  // Пустые ячейки в начале
  for (let i = 1; i < startDayOfWeek; i++) {
    days.push({ date: null })
  }
  
  // Дни месяца
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i)
    const isToday = date.toDateString() === today.toDateString()
    const hasTransaction = transactionDays.has(i)
    
    days.push({
      date: i,
      isToday,
      hasTransaction,
      fullDate: date
    })
  }
  
  return days
})

// Геттеры для диаграммы
const chartData = computed(() => {
  if (transactions.value.length === 0) return []
  
  const categoryTotals = {}
  categories.forEach(cat => {
    categoryTotals[cat.value] = 0
  })
  
  // Суммируем по категориям
  transactions.value.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.sum
    }
  })
  
  const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0)
  if (total === 0) return []
  
  return Object.keys(categoryTotals)
    .filter(key => categoryTotals[key] > 0)
    .map(key => {
      const cat = categories.find(c => c.value === key)
      return {
        category: key,
        label: cat?.label || key,
        color: cat?.color || '#999999',
        total: categoryTotals[key],
        percentage: Math.round((categoryTotals[key] / total) * 100)
      }
    })
    .sort((a, b) => b.total - a.total)
})

const summaryData = computed(() => {
  if (transactions.value.length === 0) return []
  
  const categoryTotals = {}
  categories.forEach(cat => {
    categoryTotals[cat.value] = 0
  })
  
  transactions.value.forEach(t => {
    if (categoryTotals[t.category] !== undefined) {
      categoryTotals[t.category] += t.sum
    }
  })
  
  return Object.keys(categoryTotals)
    .filter(key => categoryTotals[key] > 0)
    .map(key => {
      const cat = categories.find(c => c.value === key)
      return {
        category: key,
        label: cat?.label || key,
        color: cat?.color || '#999999',
        total: categoryTotals[key]
      }
    })
    .sort((a, b) => b.total - a.total)
})

const totalSum = computed(() => {
  return transactions.value.reduce((sum, t) => sum + t.sum, 0)
})

// Методы
const formatSum = (sum) => {
  return `${sum} ₽`
}

const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('ru-RU')
}

const setDefaultPeriod = () => {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  period.value.start = start.toISOString().split('T')[0]
  period.value.end = end.toISOString().split('T')[0]
  
  loadAnalytics()
}

const loadAnalytics = async () => {
  if (!period.value.start || !period.value.end) {
    setDefaultPeriod()
    return
  }
  
  loading.value = true
  try {
    // Форматируем даты для API: "12-1-2025"
    const startDate = new Date(period.value.start)
    const endDate = new Date(period.value.end)
    
    const formattedStart = `${startDate.getMonth() + 1}-${startDate.getDate()}-${startDate.getFullYear()}`
    const formattedEnd = `${endDate.getMonth() + 1}-${endDate.getDate()}-${endDate.getFullYear()}`
    
    const response = await getTransactionsByPeriod({
      start: formattedStart,
      end: formattedEnd
    })
    
    transactions.value = response.data || []
  } catch (error) {
    console.error('Ошибка загрузки аналитики:', error)
    if (error.response?.status === 401) {
      userStore.logout()
      router.push('/login')
    }
  } finally {
    loading.value = false
  }
}

const changeMonth = (delta) => {
  const newDate = new Date(currentDate.value)
  newDate.setMonth(newDate.getMonth() + delta)
  currentDate.value = newDate
}

const selectDay = (day) => {
  selectedDate.value = day.fullDate
  // Можно показать транзакции за этот день
  const dayTransactions = transactions.value.filter(t => {
    const date = new Date(t.date)
    return date.toDateString() === day.fullDate.toDateString()
  })
  console.log('Транзакции за день:', dayTransactions)
}

// Загрузка при монтировании
onMounted(() => {
  setDefaultPeriod()
})
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background: #F5F5F5;
  padding: 20px;
  padding-top: 100px;
}

.analytics-content {
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 24px;
  font-family: 'Montserrat', sans-serif;
}

/* Период */
.period-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.period-row {
  display: flex;
  align-items: flex-end;
  gap: 16px;
  flex-wrap: wrap;
}

.period-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.period-label {
  font-size: 14px;
  font-weight: 500;
  color: #555555;
  font-family: 'Montserrat', sans-serif;
}

.period-input {
  padding: 10px 14px;
  border: 2px solid #d0d0d0;
  border-radius: 10px;
  font-size: 14px;
  font-family: 'Montserrat', sans-serif;
  height: 44px;
  outline: none;
  transition: all 0.3s ease;
}

.period-input:focus {
  border-color: #565EEF;
  box-shadow: 0 0 0 3px rgba(86, 94, 239, 0.1);
}

.period-btn {
  padding: 10px 20px;
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

.period-btn:hover {
  background: #e0e0e0;
}

.period-btn.primary {
  background: #565EEF;
  color: #FFFFFF;
}

.period-btn.primary:hover {
  background: #33399b;
}

/* Сетка */
.analytics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.analytics-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 24px 28px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 16px;
  font-family: 'Montserrat', sans-serif;
}

/* Календарь */
.calendar-container {
  font-family: 'Montserrat', sans-serif;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.calendar-nav {
  padding: 4px 12px;
  background: #f0f0f0;
  border: none;
  border-radius: 6px;
  font-size: 20px;
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: background 0.2s;
}

.calendar-nav:hover {
  background: #e0e0e0;
}

.calendar-month {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 4px;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #888888;
  padding: 6px 0;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 14px;
  color: #1a1a1a;
  transition: all 0.2s;
}

.calendar-day.empty {
  visibility: hidden;
}

.day-number {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.calendar-day.today .day-number {
  background: #565EEF;
  color: #FFFFFF;
  font-weight: 700;
}

.calendar-day.has-transaction .day-number {
  background: #f0edff;
  color: #565EEF;
  font-weight: 600;
  cursor: pointer;
}

.calendar-day.has-transaction:hover .day-number {
  background: #d5cfff;
}

/* Диаграмма */
.chart-container {
  height: 260px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-top: 10px;
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 20px;
  height: 100%;
  width: 100%;
  justify-content: center;
}

.chart-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 60px;
  height: 100%;
}

.chart-bar-label {
  font-size: 11px;
  color: #888888;
  text-align: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 500;
}

.chart-bar-track {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  border-radius: 6px 6px 0 0;
  position: relative;
  min-height: 20px;
}

.chart-bar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border-radius: 6px 6px 0 0;
  transition: height 0.6s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 24px;
}

.chart-bar-value {
  font-size: 10px;
  color: #FFFFFF;
  font-weight: 600;
  font-family: 'Montserrat', sans-serif;
}

.chart-empty,
.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #888888;
  font-family: 'Montserrat', sans-serif;
  font-size: 16px;
}

/* Итоги */
.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: #f8f8f8;
  border-radius: 8px;
  font-family: 'Montserrat', sans-serif;
}

.summary-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}

.summary-label {
  flex: 1;
  font-size: 14px;
  color: #555555;
}

.summary-value {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.summary-empty {
  text-align: center;
  color: #888888;
  padding: 20px 0;
  font-family: 'Montserrat', sans-serif;
}

.total-item {
  background: #f0edff;
  grid-column: span 2;
}

.total-value {
  color: #565EEF;
  font-size: 16px;
}

@media (max-width: 768px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
  
  .period-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .period-btn {
    width: 100%;
  }
  
  .analytics-content {
    padding: 0 10px;
  }
  
  .analytics-card {
    padding: 16px;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .total-item {
    grid-column: span 1;
  }
  
  .chart-bars {
    gap: 10px;
  }
  
  .chart-bar-wrapper {
    max-width: 40px;
  }
}
</style>