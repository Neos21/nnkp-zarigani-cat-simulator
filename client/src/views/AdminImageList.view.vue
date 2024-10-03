<script setup lang="ts">
import { ref } from 'vue';

/** API からはスネークケースで返しているのでその型の定義 */
type ApiImage = {
  id: number,
  file_name: string,
  tags: Array<string>
};

// TODO : 型定義はどこかで共通化したいわねー
type Image = {
  id: number,
  fileName: string,
  tags: Array<string>
};

const isLoading = ref<boolean>(true);
const errorMessage = ref<string>('');
const images = ref<Array<Image>>([]);

const onFetchImages = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  images.value = [];
  
  try {
    const credential = localStorage.getItem('credential');
    if(credential == null || credential === '') throw new Error('Credential を設定してください');
    
    const response = await fetch(`/api/images?credential=${credential}`);
    const json = await response.json();
    if(json.error) throw new Error(json.error);
    
    const results: Array<ApiImage> = json.results;
    images.value = results.map(item => ({
      id      : item.id,
      fileName: item.file_name,
      tags    : item.tags
    }));
  }
  catch(error) {
    console.error('アップロード済み画像ファイル一覧取得失敗', error);
    errorMessage.value = (error as any).toString();
  }
  finally {
    isLoading.value = false;
  }
};

(async () => {
  await onFetchImages();
})();
</script>

<template>
<h2>アップロード済み画像一覧</h2>
<p v-if="isLoading" class="loading">Loading...</p>
<div v-else-if="errorMessage">
  <p class="error">Error : {{ errorMessage }}</p>
  <p><button type="button" @click="onFetchImages">再読込</button></p>
</div>
<p v-else-if="images.length === 0">アップロード済みの画像はありません。</p>
<ul v-else class="images">
  <!-- TOOD : 一覧の見せ方がダサいのでなんとかしたい -->
  <!-- TODO : 画像のプレビューとかどっかに表示できないかな -->
  <li v-for="image in images" v-bind:key="image as unknown as PropertyKey">
    [{{ image.id }}] <RouterLink v-bind:to="`/admin/images/${image.id}`">{{ image.fileName }}</RouterLink> … {{ image.tags }}
  </li>
</ul>
</template>

<style scoped>
.loading {
  color: #eb0;
  font-weight: bold;
}

.error {
  color: #f00;
  font-weight: bold;
}

.images {
  font-family: monospace;
}
</style>
