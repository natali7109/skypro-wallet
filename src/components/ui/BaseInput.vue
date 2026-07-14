<template>
  <div class="input-wrapper">
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="base-input"
      :class="{ 'has-error': error }"
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
  position: relative;
  width: 100%;
}

.base-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid #d0d0d0;
  border-radius: 10px;
  font-size: 16px;
  color: #000000;
  background: #ffffff;
  transition: all 0.3s ease;
  outline: none;
  box-sizing: border-box;
  height: 50px;
}

.base-input::placeholder {
  color: #999999;
  font-size: 16px;
}

.base-input:focus {
  border-color: #7334EA;
  box-shadow: 0 0 0 3px rgba(115, 52, 234, 0.1);
}

.base-input:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}

.base-input.has-error {
  border-color: #c62828;
  background-color: #fff5f5;
}

.base-input.has-error:focus {
  box-shadow: 0 0 0 3px rgba(198, 40, 40, 0.1);
}

.error-text {
  font-size: 12px;
  color: #c62828;
  padding-left: 4px;
  font-weight: 500;
  margin-top: 4px;
  display: block;
}
</style>