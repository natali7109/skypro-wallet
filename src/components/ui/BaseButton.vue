<template>
  <button 
    :type="type" 
    :disabled="disabled || loading"
    class="base-button"
    :class="{
      'btn-disabled': disabled || loading,
      'btn-loading': loading
    }"
  >
    <span v-if="loading" class="spinner"></span>
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    default: 'Кнопка'
  }
})
</script>

<style scoped>
.base-button {
  width: 100%;
  padding: 12px 24px;
  background: #565EEF;
  color: #FFFFFF;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 48px;
}

.base-button:hover:not(:disabled) {
  background: #33399b;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(86, 94, 239, 0.3);
}

.base-button:active:not(:disabled) {
  transform: translateY(0);
}

.base-button:disabled,
.btn-disabled {
  background: #cccccc !important;
  cursor: not-allowed;
  transform: none !important;
  box-shadow: none !important;
}

/* Спиннер загрузки */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>