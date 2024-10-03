<script setup lang="ts">
interface ErrorMessage {
  errorMessage: string
}

const props = withDefaults(defineProps<ErrorMessage>(), { errorMessage: 'エラー' });
</script>

<template>
<div class="error-message">Error : {{ props.errorMessage }}</div>
</template>

<style scoped>
.error-message {
  color: #f00;
  font-weight: bold;
}
</style>
