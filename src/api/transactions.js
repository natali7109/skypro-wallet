import api from './index.js'

/**
 * Получить все транзакции пользователя
 * @param {Object} params - { sortBy, filterBy }
 * @returns {Promise} - массив транзакций
 */
export const getTransactions = (params = {}) => {
  const { sortBy, filterBy } = params
  let url = '/transactions'
  
  const queryParams = []
  if (sortBy) queryParams.push(`sortBy=${sortBy}`)
  if (filterBy) queryParams.push(`filterBy=${filterBy}`)
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`
  }
  
  return api.get(url)
}

/**
 * Добавить новую транзакцию
 * @param {Object} data - { description, sum, category, date }
 * @returns {Promise} - обновлённый список транзакций
 */
export const addTransaction = (data) => {
  return api.post('/transactions', data)
}

/**
 * Удалить транзакцию
 * @param {string} id - _id транзакции
 * @returns {Promise} - обновлённый список транзакций
 */
export const deleteTransaction = (id) => {
  return api.delete(`/transactions/${id}`)
}

/**
 * Обновить транзакцию
 * @param {string} id - _id транзакции
 * @param {Object} data - { description, sum, category, date }
 * @returns {Promise} - обновлённый список транзакций
 */
export const updateTransaction = (id, data) => {
  return api.patch(`/transactions/${id}`, data)
}

/**
 * Получить транзакции за период
 * @param {Object} data - { start, end } в формате "12-1-2024"
 * @returns {Promise} - массив транзакций
 */
export const getTransactionsByPeriod = (data) => {
  return api.post('/transactions/period', data)
}