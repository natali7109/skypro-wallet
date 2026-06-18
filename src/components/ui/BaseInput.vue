<template>
  <div class="input-wrapper" :class="{ 'has-error': error }">
    <label v-if="label" class="input-label">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-input"
      @input="$emit('update:model-value', $event.target.value)"
      @blur="$emit('blur')"
      @focus="$emit('focus')"
    />
    <span v-if="error" class="error-text">{{ error }}</span>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  placeholder: {
    type: String,
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

defineEmits(['update:model-value', 'blur', 'focus'])
</script>

<style scoped>
.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.input-label {
  font-size: 14px;
  font-weight: 500;
  color: #555555;
}

.base-input {
  width: 100%;
  padding: 12px 14px;
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  font-size: 16px;
  color: #1a1a1a;
  background: #ffffff;
  transition: all 0.25s ease;
  outline: none;
}

.base-input::placeholder {
  color: #999999;
}

.base-input:focus {
  border-color: #565EEF;
  box-shadow: 0 0 0 3px rgba(86, 94, 239, 0.1);
}

.base-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Состояние ошибки */
.input-wrapper.has-error .base-input {
  border-color: #c62828;
  background-color: #fff5f5;
}

.input-wrapper.has-error .base-input:focus {
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
}

.error-text {
  font-size: 12px;
  color: #c62828;
  padding-left: 4px;
  font-weight: 500;
}
</style>