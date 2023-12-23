<script setup lang="ts">
defineProps<{
  testId?: string,
  color: string,
  disabled?: boolean;
}>();
defineEmits<{
  (e: 'clicked'): void;
}>();


</script>
<template>
  <button type="button" :class="{ btn: true, primary: color === 'primary', default: color === 'default', disabled }"
    :data-testid="testId" :disabled="disabled" @click="$emit('clicked')">
    <slot />
  </button>
</template>
<style scoped>
.btn {
  display: block;
  width: 164px;
  height: 46px;
  border-radius: 6px;
  font-size: 1rem;
  line-height: 20px;
  font-family: "Sora", sans-serif;
}

.btn:enabled {
  cursor: pointer;
}

.btn.primary:hover:enabled,
.btn.default:hover:enabled {
  color: var(--white);
  background-color: var(--primary--hover);
  border: none;
}

.btn.primary:active:enabled,
.btn.default:active:enabled {
  color: var(--white);
  background-color: var(--primary--active);
  border: none;
}

.btn.primary:active,
.btn.default:active {
  color: var(--white);
  background-color: var(--primary--active);
  border: none;
}

.btn.primary {
  color: var(--white);
  background-color: var(--primary);
}

.btn:disabled {
  background-color: var(--primary--gray);
}

.btn.default {
  color: var(--primary);
  background-color: var(--white);
  border: 2px solid var(--primary);
}
</style>