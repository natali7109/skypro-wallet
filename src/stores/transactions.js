import { defineStore } from 'pinia'
import { ref } from 'vue'
import { 
  getTransactions as getTransactionsApi,
  addTransaction as addTransactionApi,
  deleteTransaction as deleteTransactionApi,
  updateTransaction as updateTransactionApi,
  getTransactionsByPeriod as getTransactionsByPeriodApi
} from '@/api/transactions'

export const useTransactionsStore = defineStore('transactions', () => {
  // Состояние
  const transactions = ref([])
  const isLoading = ref(false)
  const error = ref('')

  // Маппинг категорий (русские -> английские для API)
  const categoryMap = {
    'Еда': 'food',
    'Транспорт': 'transport',
    'Жильё': 'housing',
    'Развлечения': 'joy',
    'Образование': 'education',
    'Другое': 'others'
  }

  // Обратный маппинг (английские -> русские)
  const categoryMapReverse = {
    'food': 'Еда',
    'transport': 'Транспорт',
    'housing': 'Жильё',
    'joy': 'Развлечения',
    'education': 'Образование',
    'others': 'Другое'
  }

  // Форматирование даты для API (MM-DD-YYYY)
  const formatDateForApi = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${month}-${day}-${year}`
  }

  // Форматирование даты для отображения (DD.MM.YYYY)
  const formatDateForDisplay = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()
    return `${day}.${month}.${year}`
  }

  // Преобразование транзакции из API в формат для отображения
  const transformFromApi = (item) => {
    return {
      id: item._id,
      description: item.description,
      category: categoryMapReverse[item.category] || item.category,
      date: formatDateForDisplay(item.date),
      amount: item.sum,
      _id: item._id,
      userId: item.userId
    }
  }

  // Преобразование транзакции для отправки в API
  const transformToApi = (data) => {
    return {
      description: data.description,
      sum: Number(data.amount),
      category: categoryMap[data.category] || data.category,
      date: formatDateForApi(data.date)
    }
  }

  // Получить все транзакции
  const fetchTransactions = async (params = {}) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const response = await getTransactionsApi(params)
      transactions.value = response.data.map(item => transformFromApi(item))
      return { success: true, data: transactions.value }
    } catch (err) {
      error.value = err.response?.data?.error || 'Ошибка загрузки транзакций'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Добавить транзакцию
  const addTransaction = async (data) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const apiData = transformToApi(data)
      console.log('📤 Отправка в API:', apiData)
      const response = await addTransactionApi(apiData)
      await fetchTransactions()
      return { success: true, data: response.data }
    } catch (err) {
      console.error('❌ Ошибка добавления:', err.response?.data)
      error.value = err.response?.data?.error || 'Ошибка добавления транзакции'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Удалить транзакцию
  const deleteTransaction = async (id) => {
    isLoading.value = true
    error.value = ''
    
    try {
      await deleteTransactionApi(id)
      await fetchTransactions()
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.error || 'Ошибка удаления транзакции'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Получить транзакции за период
  const fetchTransactionsByPeriod = async (startDate, endDate) => {
    isLoading.value = true
    error.value = ''
    
    try {
      const data = {
        start: formatDateForApi(startDate),
        end: formatDateForApi(endDate)
      }
      console.log('📤 Запрос периода:', data)
      const response = await getTransactionsByPeriodApi(data)
      const transformedData = response.data.map(item => transformFromApi(item))
      return { success: true, data: transformedData }
    } catch (err) {
      error.value = err.response?.data?.error || 'Ошибка загрузки транзакций за период'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  // Получить суммы по категориям за период
  const getCategoryTotals = async (startDate, endDate) => {
    const result = await fetchTransactionsByPeriod(startDate, endDate)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    const totals = {}
    const categories = ['Еда', 'Транспорт', 'Жильё', 'Развлечения', 'Образование', 'Другое']
    
    categories.forEach(cat => {
      totals[cat] = 0
    })
    
    result.data.forEach(item => {
      if (totals[item.category] !== undefined) {
        totals[item.category] += item.amount
      }
    })
    
    return { success: true, data: totals }
  }

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    addTransaction,
    deleteTransaction,
    fetchTransactionsByPeriod,
    getCategoryTotals,
    formatDateForDisplay,
    formatDateForApi,
    categoryMap,
    categoryMapReverse
  }
})