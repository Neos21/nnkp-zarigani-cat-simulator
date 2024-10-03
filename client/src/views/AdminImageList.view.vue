<script setup lang="ts">
import { ref } from 'vue';

import type { ApiImage, Image } from '../types/image';
import LoadingComponent from '../components/Loading.component.vue';
import ErrorMessageComponent from '../components/ErrorMessage.component.vue';

/** 読み込み中か否か */
const isLoading = ref<boolean>(true);
/** 初期表示時にエラーがあった場合 */
const errorMessage = ref<string>('');
/** 画像情報一覧 */
const images = ref<Array<Image>>([]);

/** 画像情報一覧を取得する */
const onFetchImages = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  images.value = [];
  
  try {
    const credential = localStorage.getItem('credential');
    if(credential == null || credential === '') throw new Error('Credential を設定してください');  // TODO : `alert()` で表示するのダサくない？
    
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
    console.error('アップロード済み画像ファイル一覧の取得に失敗', error);
    errorMessage.value = (error as any).toString();
  }
  finally {
    isLoading.value = false;
  }
};

/** 初期表示時 */
(async () => {
  await onFetchImages();
})();
</script>

<template>
<h2>アップロード済み画像一覧</h2>
<LoadingComponent v-if="isLoading" />
<div v-else-if="errorMessage">
  <ErrorMessageComponent v-bind:error-message="errorMessage" />
  <p><button type="button" @click="onFetchImages">再読込</button></p>
</div>
<p v-else-if="images.length === 0">アップロード済みの画像はありません。</p>
<div v-else class="images">
  <!-- TOOD : 一覧の見せ方がダサいのでなんとかしたい・画像のプレビューとかどっかに表示できないかな -->
  <div class="image-row" v-for="image in images" v-bind:key="image as unknown as PropertyKey">
    <div class="image-id">{{ image.id }}</div>
    <RouterLink class="image-link" v-bind:to="`/admin/images/${image.id}`">{{ image.fileName }}</RouterLink>
    <div class="image-tags">{{ image.tags }}</div>
  </div>
</div>
</template>

<style scoped>
.images {
  font-family: monospace;
}

.image-row {
  margin-bottom: .25rem;
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 2.5rem auto 1fr;
  grid-template-areas: "id link tags";
}

.image-id {
  grid-area: id;
  text-align: right;
}

.image-link {
  grid-area: link;
}

.image-tags {
  grid-area: tags;
}

/* 画面幅が小さい時のレイアウト調整 */
@media (max-width: 600px) {
  .image-row {
    grid-template-columns: 2.5rem 1fr;
    grid-template-areas: "id link"
                         "id tags";
  }
}
</style>
