import api from './index.js'

export const getTransactions = (params = {}) => {
  const { sortBy, filterBy } = params
  let url = '/api/transactions'
  
  const queryParams = []
  if (sortBy) queryParams.push(`sortBy=${sortBy}`)
  if (filterBy) queryParams.push(`filterBy=${filterBy}`)
  
  if (queryParams.length > 0) {
    url += `?${queryParams.join('&')}`
  }
  
  return api.get(url)
}

export const addTransaction = (data) => {
  return api.post('/api/transactions', data)
}

export const deleteTransaction = (id) => {
  return api.delete(`/api/transactions/${id}`)
}

export const updateTransaction = (id, data) => {
  return api.patch(`/api/transactions/${id}`, data)
}

export const getTransactionsByPeriod = (data) => {
  return api.post('/api/transactions/period', data)
}