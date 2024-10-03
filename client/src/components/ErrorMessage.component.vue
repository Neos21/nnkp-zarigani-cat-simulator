<script setup lang="ts">
interface ErrorMessage {
  errorMessage: string
}

const props = withDefaults(defineProps<ErrorMessage>(), { errorMessage: '不明なエラー' });
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
