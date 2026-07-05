<template>
  <div class="analytics-page">
    <div class="page-container">
      <h1 class="page-title">Анализ расходов</h1>

      <div class="content-grid">
        <!-- Календарь (слева) -->
        <div class="calendar-wrapper">
          <h2 class="section-title">Период</h2>

          <!-- Фиксированные дни недели -->
          <div class="weekdays-fixed">
            <div v-for="day in weekDays" :key="day" class="weekday">
              {{ day }}
            </div>
          </div>

          <!-- Прокручиваемый календарь -->
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

        <!-- Диаграмма (справа) -->
        <div class="chart-wrapper">
          <!-- Общая сумма -->
          <div class="chart-header">
            <div class="total-amount">{{ totalAmount }} ₽</div>
            <div class="period-label-chart" v-if="selectedStartDate">
              Расходы за {{ formatDate(selectedStartDate) }} — {{ formatDate(selectedEndDate || selectedStartDate) }}
            </div>
            <div class="period-label-chart" v-else>
              Выберите период в календаре
            </div>
          </div>

          <!-- График -->
          <div class="chart-container">
            <svg width="100%" height="100%" viewBox="0 0 740 420" preserveAspectRatio="xMidYMid meet">
              <!-- Ось X -->
              <line x1="0" y1="380" x2="740" y2="380" stroke="#E8E8E8" stroke-width="1"/>
              
              <!-- Столбцы -->
              <g v-for="(item, index) in chartData" :key="index">
                <!-- Столбец -->
                <rect 
                  :x="item.x" 
                  :y="item.y" 
                  width="94" 
                  :height="item.height" 
                  :fill="item.color" 
                  rx="12"
                />
                
                <!-- Сумма над столбцом -->
                <text 
                  :x="item.x + 47" 
                  :y="item.y - 10" 
                  text-anchor="middle" 
                  class="bar-value"
                >
                  {{ item.value }} ₽
                </text>
                
                <!-- Название категории под столбцом -->
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'

// ===== КАЛЕНДАРЬ =====
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const selectedStartDate = ref(null)
const selectedEndDate = ref(null)
const scrollContainer = ref(null)

// ===== ДАННЫЕ ДЛЯ ДИАГРАММЫ =====
// Цвета категорий
const categoryColors = {
  'Еда': '#D9B6FF',
  'Транспорт': '#FFB53D',
  'Жильё': '#6EE4FE',
  'Развлечения': '#B0AEFF',
  'Образование': '#BCEC30',
  'Другое': '#FFB9B8'
}

// Данные по категориям (суммы за выбранный период)
const categoryData = ref([
  { label: 'Еда', value: 21990 },
  { label: 'Транспорт', value: 11046 },
  { label: 'Жильё', value: 0 },
  { label: 'Развлечения', value: 13050 },
  { label: 'Образование', value: 0 },
  { label: 'Другое', value: 19106 }
])

// Общая сумма
const totalAmount = computed(() => {
  return categoryData.value.reduce((sum, item) => sum + item.value, 0)
})

// Данные для отрисовки диаграммы
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
      x: x,
      y: y,
      height: height,
      color: categoryColors[item.label] || '#CCCCCC'
    }
  })
})

// ===== ФУНКЦИИ КАЛЕНДАРЯ =====
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}.${month}.${year}`
}

const generateAllMonths = () => {
  const months = []
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth()
  
  const startDate = new Date(currentYear, currentMonth - 24, 1)
  const endDate = new Date(currentYear, currentMonth + 12, 1)
  
  const startYear = startDate.getFullYear()
  const startMonth = startDate.getMonth()
  const endYear = endDate.getFullYear()
  const endMonth = endDate.getMonth()
  
  for (let year = startYear; year <= endYear; year++) {
    const monthStart = (year === startYear) ? startMonth : 0
    const monthEnd = (year === endYear) ? endMonth : 11
    
    for (let month = monthStart; month <= monthEnd; month++) {
      const date = new Date(year, month, 1)
      const label = date.toLocaleString('ru', { month: 'long', year: 'numeric' })
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      const daysInMonthCount = lastDay.getDate()
      
      let firstDayOfWeek = firstDay.getDay()
      firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1
      
      const days = []
      
      for (let i = 0; i < firstDayOfWeek; i++) {
        days.push({
          day: null,
          date: null,
          isCurrentMonth: false
        })
      }
      
      for (let i = 1; i <= daysInMonthCount; i++) {
        const dayDate = new Date(year, month, i)
        days.push({
          day: i,
          date: dayDate,
          isCurrentMonth: true
        })
      }
      
      months.push({
        label: label,
        year: year,
        month: month,
        days: days
      })
    }
  }
  
  return months
}

const allMonths = ref(generateAllMonths())

const scrollToCurrentMonth = () => {
  nextTick(() => {
    if (!scrollContainer.value) return
    
    const container = scrollContainer.value
    const today = new Date()
    const currentMonthLabel = today.toLocaleString('ru', { month: 'long', year: 'numeric' })
    
    let targetIndex = -1
    for (let i = 0; i < allMonths.value.length; i++) {
      if (allMonths.value[i].label === currentMonthLabel) {
        targetIndex = i
        break
      }
    }
    
    if (targetIndex === -1) return
    
    const monthElements = container.querySelectorAll('.month-block')
    if (monthElements[targetIndex]) {
      container.scrollTop = monthElements[targetIndex].offsetTop - container.offsetTop - 20
    }
  })
}

const isSingleSelected = (day) => {
  if (!day.date) return false
  if (!selectedStartDate.value) return false
  if (selectedEndDate.value) return false
  
  return day.date.toDateString() === selectedStartDate.value.toDateString()
}

const isDayInPeriod = (day) => {
  if (!day.date) return false
  
  if (!selectedStartDate.value) return false
  
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

const toggleDaySelection = (day) => {
  if (!day.isCurrentMonth) return
  
  const date = new Date(day.date)
  
  if (!selectedStartDate.value || (selectedStartDate.value && selectedEndDate.value)) {
    selectedStartDate.value = date
    selectedEndDate.value = null
  } 
  else if (selectedStartDate.value && !selectedEndDate.value) {
    if (date < selectedStartDate.value) {
      selectedEndDate.value = selectedStartDate.value
      selectedStartDate.value = date
    } else {
      selectedEndDate.value = date
    }
    updateChartData()
  }
}

const updateChartData = () => {
  console.log('Период выбран:', {
    start: formatDate(selectedStartDate.value),
    end: formatDate(selectedEndDate.value)
  })
}

const clearSelection = () => {
  selectedStartDate.value = null
  selectedEndDate.value = null
}

onMounted(() => {
  scrollToCurrentMonth()
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.content-grid {
  display: grid;
  grid-template-columns: 379px 1fr;
  gap: 24px;
  align-items: start;
}

/* ===== КАЛЕНДАРЬ ===== */
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: #F5F5F5;
  transition: all 0.2s;
}

.day-cell.single-selected .day-circle {
  color: #7334EA;
  background: #E8E0FF;
  font-weight: 600;
}

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

/* ===== ДИАГРАММА ===== */
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

.chart-header {
  margin-bottom: 16px;
  flex-shrink: 0;
}

.total-amount {
  font-size: 36px;
  font-weight: 700;
  color: #1A1A1A;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.period-label-chart {
  font-size: 14px;
  color: #999999;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.bar-label {
  font-size: 14px;
  font-weight: 500;
  fill: #555555;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
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

  .bar-value {
    font-size: 12px;
  }

  .bar-label {
    font-size: 12px;
  }
}
</style>