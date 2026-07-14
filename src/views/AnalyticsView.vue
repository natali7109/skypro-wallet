<template>
  <div class="analytics-page">
    <div class="page-container">
      <h1 class="page-title">Анализ расходов</h1>

      <div class="content-grid">
        <!-- Календарь -->
        <div class="calendar-wrapper">
          <h2 class="section-title">Период</h2>

          <div class="weekdays-fixed">
            <div v-for="day in weekDays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>

          <div class="calendar-scroll-container" ref="scrollContainer">
            <div class="calendar-months">
              <div 
                v-for="(monthData, index) in allMonths" 
                :key="index"
                class="month-block"
              >
                <div class="month-label">
                  {{ monthData.label }}
                </div>

                <div class="days-grid">
                  <div 
                    v-for="day in monthData.days" 
                    :key="day.date"
                    class="day-cell"
                    :class="{
                      'empty': !day.isCurrentMonth,
                      'in-period': isDayInPeriod(day),
                      'single-selected': isSingleSelected(day)
                    }"
                    @click="toggleDaySelection(day)"
                  >
                    <span class="day-circle">{{ day.day }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Диаграмма -->
        <div class="chart-wrapper">
          <div v-if="isLoading" class="loading-state">
            Загрузка данных...
          </div>

          <div v-else-if="error" class="error-state">
            {{ error }}
          </div>

          <template v-else>
            <div class="chart-header">
              <div class="total-amount">{{ totalAmount }} ₽</div>
              <div class="period-label-chart" v-if="selectedStartDate">
                Расходы за {{ formatDate(selectedStartDate) }} — {{ formatDate(selectedEndDate || selectedStartDate) }}
              </div>
              <div class="period-label-chart" v-else>
                Выберите период в календаре
              </div>
            </div>

            <div class="chart-container">
              <svg width="100%" height="100%" viewBox="0 0 740 420" preserveAspectRatio="xMidYMid meet">
                <line x1="0" y1="380" x2="740" y2="380" stroke="#E8E8E8" stroke-width="1"/>
                
                <g v-for="(item, index) in chartData" :key="index">
                  <rect 
                    :x="item.x" 
                    :y="item.y" 
                    width="94" 
                    :height="item.height" 
                    :fill="item.color" 
                    rx="12"
                  />
                  <text 
                    :x="item.x + 47" 
                    :y="item.y - 10" 
                    text-anchor="middle" 
                    class="bar-value"
                  >
                    {{ item.value }} ₽
                  </text>
                  <text 
                    :x="item.x + 47" 
                    :y="405" 
                    text-anchor="middle" 
                    class="bar-label"
                  >
                    {{ item.label }}
                  </text>
                </g>
              </svg>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useTransactionsStore } from '@/stores/transactions'

// ===== Хранилище =====
const transactionsStore = useTransactionsStore()

// ===== Календарь =====
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const selectedStartDate = ref(null)
const selectedEndDate = ref(null)
const scrollContainer = ref(null)

// ===== Состояния =====
const isLoading = ref(false)
const error = ref('')

// ===== Категории и цвета =====
const categories = ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Образование', 'Другое']

const categoryColors = {
  'Еда': '#D9B6FF',
  'Транспорт': '#FFB53D',
  'Жильё': '#6EE4FE',
  'Развлечения': '#B0AEFF',
  'Образование': '#BCEC30',
  'Другое': '#FFB9B8'
}

// ===== Данные диаграммы =====
const categoryData = ref(categories.map(cat => ({ label: cat, value: 0 })))

const totalAmount = computed(() => 
  categoryData.value.reduce((sum, item) => sum + item.value, 0)
)

const chartData = computed(() => {
  const maxValue = Math.max(...categoryData.value.map(item => item.value), 1)
  const chartHeight = 280
  const startX = 20
  
  return categoryData.value.map((item, index) => {
    const height = (item.value / maxValue) * chartHeight
    const x = startX + index * (94 + 20)
    const y = 380 - height
    
    return {
      ...item,
      x,
      y,
      height,
      color: categoryColors[item.label] || '#CCCCCC'
    }
  })
})

// ===== Форматирование даты =====
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`
}

// ===== Генерация месяцев =====
const generateMonths = (startYear, startMonth, endYear, endMonth) => {
  const months = []
  
  for (let year = startYear; year <= endYear; year++) {
    const monthStart = (year === startYear) ? startMonth : 0
    const monthEnd = (year === endYear) ? endMonth : 11
    
    for (let month = monthStart; month <= monthEnd; month++) {
      const date = new Date(year, month, 1)
      const label = date.toLocaleString('ru', { month: 'long', year: 'numeric' })
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonth = lastDay.getDate()
      
      let firstDayOfWeek = firstDay.getDay()
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
      
      const days = []
      
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({ day: null, date: null, isCurrentMonth: false })
      }
      
      for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i)
        days.push({ day: i, date: dayDate, isCurrentMonth: true })
      }
      
      months.push({ label, year, month, days })
    }
  }
  
  return months
}

const allMonths = ref(
  (() => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth()
    
    return generateMonths(
      currentYear, currentMonth - 24,
      currentYear, currentMonth + 12
    )
  })()
)

// ===== Прокрутка к текущему месяцу =====
const scrollToCurrentMonth = () => {
  nextTick(() => {
    if (!scrollContainer.value) return
    
    const container = scrollContainer.value
    const today = new Date()
    const currentMonthLabel = today.toLocaleString('ru', { month: 'long', year: 'numeric' })
    
    const targetIndex = allMonths.value.findIndex(m => m.label === currentMonthLabel)
    if (targetIndex === -1) return
    
    const monthElements = container.querySelectorAll('.month-block')
    if (monthElements[targetIndex]) {
      container.scrollTop = monthElements[targetIndex].offsetTop - container.offsetTop - 20
    }
  })
}

// ===== Проверки календаря =====
const isSingleSelected = (day) => {
  if (!day.date || !selectedStartDate.value || selectedEndDate.value) return false
  return day.date.toDateString() === selectedStartDate.value.toDateString()
}

const isDayInPeriod = (day) => {
  if (!day.date || !selectedStartDate.value) return false
  
  if (selectedStartDate.value && !selectedEndDate.value) {
    return day.date.toDateString() === selectedStartDate.value.toDateString()
  }
  
  if (selectedStartDate.value && selectedEndDate.value) {
    const start = new Date(selectedStartDate.value)
    const end = new Date(selectedEndDate.value)
    const current = new Date(day.date)
    return current >= start && current <= end
  }
  
  return false
}

// ===== Выбор дня =====
const toggleDaySelection = (day) => {
  if (!day.isCurrentMonth) return
  
  const date = new Date(day.date)
  
  if (!selectedStartDate.value || (selectedStartDate.value && selectedEndDate.value)) {
    selectedStartDate.value = date
    selectedEndDate.value = null
  } else if (selectedStartDate.value && !selectedEndDate.value) {
    if (date < selectedStartDate.value) {
      selectedEndDate.value = selectedStartDate.value
      selectedStartDate.value = date
    } else {
      selectedEndDate.value = date
    }
    updateChartData()
  }
}

// ===== Обновление диаграммы =====
const updateChartData = async () => {
  if (!selectedStartDate.value) {
    categoryData.value = categories.map(cat => ({ label: cat, value: 0 }))
    return
  }
  
  isLoading.value = true
  error.value = ''
  
  try {
    const start = new Date(selectedStartDate.value)
    const end = selectedEndDate.value ? new Date(selectedEndDate.value) : new Date(start)
    
    const result = await transactionsStore.getCategoryTotals(start, end)
    
    if (result.success) {
      categoryData.value = categories.map(cat => ({
        label: cat,
        value: result.data[cat] || 0
      }))
    } else {
      error.value = result.error || 'Ошибка загрузки данных'
      categoryData.value = categories.map(cat => ({ label: cat, value: 0 }))
    }
  } catch (err) {
    error.value = 'Ошибка загрузки данных'
    categoryData.value = categories.map(cat => ({ label: cat, value: 0 }))
  } finally {
    isLoading.value = false
  }
}

// ===== Жизненный цикл =====
onMounted(() => {
  scrollToCurrentMonth()
  
  const today = new Date()
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  selectedStartDate.value = firstDayOfMonth
  selectedEndDate.value = today
  updateChartData()
})
</script>

<style scoped>
.analytics-page {
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

.content-grid {
  display: grid;
  grid-template-columns: 379px 1fr;
  gap: 24px;
  align-items: start;
}

/* ===== Календарь ===== */
.calendar-wrapper {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 379px;
  height: 540px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.weekdays-fixed {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.weekday {
  text-align: center;
  font-size: 13px;
  font-weight: 600;
  color: #555555;
  padding: 8px 0;
}

.calendar-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

.calendar-scroll-container::-webkit-scrollbar {
  width: 4px;
}

.calendar-scroll-container::-webkit-scrollbar-track {
  background: #F5F5F5;
  border-radius: 2px;
}

.calendar-scroll-container::-webkit-scrollbar-thumb {
  background: #7334EA;
  border-radius: 2px;
}

.month-block {
  margin-bottom: 20px;
}

.month-label {
  font-size: 14px;
  font-weight: 600;
  color: #1A1A1A;
  margin-bottom: 8px;
}

.days-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.day-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2px;
  cursor: pointer;
  user-select: none;
}

.day-cell.empty {
  visibility: hidden;
  cursor: default;
}

.day-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 13px;
  color: #1A1A1A;
  background: #F5F5F5;
  transition: all 0.2s;
}

.day-cell.single-selected .day-circle,
.day-cell.in-period .day-circle {
  color: #7334EA;
  background: #E8E0FF;
  font-weight: 600;
}

.day-cell:not(.empty):hover .day-circle {
  background: #F0ECFF;
  transform: scale(1.1);
}

.day-cell.empty .day-circle {
  visibility: hidden;
}

/* ===== Диаграмма ===== */
.chart-wrapper {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  width: 789px;
  height: 540px;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

.loading-state,
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  font-size: 18px;
  color: #999999;
}

.error-state {
  color: #FF4444;
}

.chart-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.total-amount {
  font-size: 36px;
  font-weight: 700;
  color: #1A1A1A;
}

.period-label-chart {
  font-size: 14px;
  color: #999999;
  margin-top: 4px;
}

.chart-container {
  flex: 1;
  width: 100%;
  min-height: 0;
}

.chart-container svg {
  width: 100%;
  height: 100%;
}

.bar-value {
  font-size: 14px;
  font-weight: 600;
  fill: #1A1A1A;
}

.bar-label {
  font-size: 14px;
  font-weight: 500;
  fill: #555555;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .calendar-wrapper {
    width: 100%;
    height: auto;
    min-height: 400px;
  }

  .chart-wrapper {
    width: 100%;
    height: auto;
    min-height: 400px;
  }
}

@media (max-width: 768px) {
  .analytics-page {
    padding-top: 80px;
  }
  
  .page-container {
    padding: 0 16px 24px;
  }

  .calendar-wrapper,
  .chart-wrapper {
    padding: 16px;
  }

  .calendar-wrapper {
    min-height: 350px;
  }

  .chart-wrapper {
    min-height: 350px;
  }

  .total-amount {
    font-size: 28px;
  }

  .day-circle {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }

  .weekday {
    font-size: 11px;
    padding: 6px 0;
  }

  .page-title {
    font-size: 24px;
  }

  .bar-value,
  .bar-label {
    font-size: 12px;
  }

  .loading-state,
  .error-state {
    font-size: 14px;
  }
}
</style>