<template>
  <div class="input-wrapper" :class="[fieldClass, { 'has-error': error }]">
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
    <span v-if="error" class="error-star">*</span>
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
  error: {
    type: String,
    default: ''
  },
  disabled: {
    type: Boolean,
    default: false
  },
  fieldClass: {
    type: String,
    default: ''
  }
})

defineEmits(['update:model-value', 'blur', 'focus'])
</script>

<style scoped>
.input-wrapper {
  position: relative;
  width: 100%;
}

.base-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #d0d0d0;
  border-radius: 10px;
  font-size: 16px;
  color: #999999;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
  height: 50px;
  font-family: Montserrat;
}

.base-input::placeholder {
  color: #999999;
  font-size: 16px;
}

/* Состояние: пустое поле */
.field-empty .base-input {
  border-color: #d0d0d0;
  color: #999999;
  background: #ffffff;
}

.field-empty .base-input::placeholder {
  color: #999999;
}

/* Состояние: при вводе */
.base-input:not(.field-empty) {
  color: #000000;
}

/* Состояние: валидное поле */
.field-valid .base-input {
  border-color: #4a3cb5;
  background-color: #f0edff;
  color: #000000;
}

.field-valid .base-input::placeholder {
  color: #999999;
}

/* Состояние: ошибка */
.field-error-state .base-input {
  border-color: #c62828;
  background-color: #fff5f5;
  color: #000000;
}

.input-wrapper.has-error .base-input:focus {
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
}

.error-star {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #c62828;
  font-size: 20px;
  font-weight: 700;
}

.error-text {
  font-size: 12px;
  color: #c62828;
  padding-left: 4px;
  font-weight: 500;
  font-family: Montserrat;
  margin-top: 4px;
  display: block;
}
</style>