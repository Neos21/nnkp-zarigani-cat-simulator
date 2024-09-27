<script setup lang="ts">
import { ref } from 'vue';

const isLoading      = ref<boolean>(true);
const imageFileNames = ref<Array<string>>([]);
const errorMessage   = ref<string | null>(null);

(async () => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));  // 動作確認用の Wait
    
    const response = await fetch('/api/images');
    if(!response.ok) throw new Error('Failed To Fetch Image File Names');
    const json = await response.json();
    imageFileNames.value = json;
  }
  catch(error) {
    console.error('Admin View : Failed To Fetch Image File Names', error);
    errorMessage.value = 'Error : 画像ファイル名一覧の取得に失敗しました';
  }
  finally {
    isLoading.value = false;
  }
})();
</script>

<template>
  <h2>Admin</h2>
  <div v-if="isLoading" class="loading">読み込み中……</div>
  <div v-else-if="errorMessage" class="error">{{ errorMessage }}</div>
  <div v-else>
    <h3>アップロード済み画像ファイル名一覧</h3>
    <p v-if="imageFileNames.length === 0">画像ファイルはありません。</p>
    <ul v-else>
      <li v-for="imageFileName in imageFileNames" v-bind:key="imageFileName">
        <a v-bind:href="`/public/images/${imageFileName}`" target="_blank">{{ imageFileName }}</a>
      </li>
    </ul>
  </div>
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
</style>
