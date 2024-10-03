<script setup lang="ts">
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const id = ref<string>('');

(async () => {
  const route = useRoute();
  id.value = route.params.id as string;
})();
</script>

<template>
<h2>タグ編集・画像削除</h2>
<p>{{ id }}</p>
<p class="footer"><RouterLink to="/admin/images">アップロード済み画像一覧に戻る</RouterLink></p>
</template>

<style scoped>
.footer {
  text-align: right;
}
</style>
