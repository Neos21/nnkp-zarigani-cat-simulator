<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import type { ApiImage, Image } from '../types/image';
import type { Tag } from '../types/tag';
import LoadingComponent from '../components/Loading.component.vue';
import ErrorMessageComponent from '../components/ErrorMessage.component.vue';

const route = useRoute();
const router = useRouter();

/** 読み込み中か否か */
const isLoading = ref<boolean>(true);
/** 初期表示時にエラーがあった場合 */
const errorMessage = ref<string>('');
/** 編集対象の ID */
const id = ref<string>('');
/** API からの取得結果を保持しておく・`tags` のフォームは以下に切り出しているので未使用だが置いておく */
const image = ref<Image>();
/** タグのリスト (編集用フォーム・`ref<Image>` 内の配列操作が困難なため切り出す) */
const tags = ref<Array<Tag>>();

/** 画像情報を取得する */
const onFetchImage = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  image.value = undefined;
  
  try {
    const credential = localStorage.getItem('credential');
    if(credential == null || credential === '') throw new Error('Credential を設定してください');  // TODO : `alert()` で表示するのダサくない？
    
    const response = await fetch(`/api/images/${id.value}?credential=${credential}`);
    const json = await response.json();
    if(json.error) throw new Error(json.error);
    
    const result: ApiImage = json.result;
    image.value = {
      id      : result.id,
      fileName: result.file_name,
      tags    : result.tags
    };
    tags.value = result.tags.map((tag, index) => ({
      id   : index,
      value: tag
    }));
  }
  catch(error) {
    console.error('画像情報の取得に失敗', error);
    errorMessage.value = (error as any).toString();
  }
  finally {
    isLoading.value = false;
  }
};

/** 選択されたタグ行を削除する */
const onRemoveTag = (index: number) => {
  tags.value!.splice(index, 1);
};

/** タグを末尾に1行追加する */
const onAddTag = () => {
  const currentMaxId = Math.max(...tags.value!.map(tag => tag.id));
  const newId = currentMaxId + 1;
  tags.value!.push({ id: newId, value: '' });
};

/** 画像情報を削除する */
const onDelete = async () => {
  if(!confirm('本当に削除しますか？')) return console.log('削除確認ダイアログをキャンセル');  // TODO : `confirm()` で確認するのダサくない？
  
  // Credential
  const credential = localStorage.getItem('credential');
  if(credential == null || credential === '') return alert('Credential を設定してください');  // TODO : `alert()` で表示するのダサくない？
  
  try {
    const response = await fetch(`/api/images/${id.value}?credential=${credential}`, { method: 'DELETE' });
    if(!response.ok) {
      const json = await response.json().catch(_error => null);
      throw new Error(json == null ? '原因不明のエラー' : json.error);
    }
    
    alert('画像情報を削除しました');  // TODO : `alert()` で表示するのダサくない？
    
    // アップロード済み画像一覧に移動する
    router.push('/admin/images');
  }
  catch(error) {
    console.error('画像情報の削除に失敗', error);
    alert('画像削除に失敗しました。もう一度やり直してください');  // TODO : `alert()` で表示するのダサくない？
  }
};

/** 更新ボタン押下時 */
const onUpdate = async () => {
  // Credential
  const credential = localStorage.getItem('credential');
  if(credential == null || credential === '') return alert('Credential を設定してください');  // TODO : `alert()` で表示するのダサくない？
  
  // タグ
  const tagValues = tags.value!.map(tag => tag.value);
  if(tagValues.some(tagValue => tagValue.trim() === '')) return alert('未入力のタグ行があります');  // TODO : `alert()` で表示するのダサくない？
  
  try {
    const response = await fetch(`/api/images/${id.value}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential: credential,
        tags      : tagValues
      })
    });
    if(!response.ok) {
      const json = await response.json().catch(_error => null);
      throw new Error(json == null ? '原因不明のエラー' : json.error);
    }
    
    alert('タグ情報を更新しました');  // TODO : `alert()` で表示するのダサくない？
  }
  catch(error) {
    console.error('画像情報の更新に失敗', error);
    alert('更新に失敗しました。もう一度やり直してください');  // TODO : `alert()` で表示するのダサくない？
  }
};

/** 初期表示時 */
(async () => {
  id.value = route.params.id as string;
  await onFetchImage();
})();
</script>

<template>
<h2>タグ編集・画像削除</h2>
<LoadingComponent v-if="isLoading" />
<div v-else-if="errorMessage">
  <ErrorMessageComponent v-bind:error-message="errorMessage" />
  <p><button type="button" @click="onFetchImage">再読込</button></p>
</div>
<div v-else-if="image != null && tags != null">
  <h3>ID [{{ image.id }}] : {{ image.fileName }}</h3>
  <p class="image-preview"><img v-bind:src="`/public/images/${image.fileName}`"></p>
  
  <p class="add-tag"><button type="button" @click="onAddTag">タグを追加</button></p>
  <div class="tags" v-for="(tag, index) in tags" v-bind:key="tag as unknown as PropertyKey">
    <div class="tag-row">
      <span>{{ index + 1 }}</span>
      <input type="text" v-model="tag.value" placeholder="タグ">
      <button type="button" @click="onRemoveTag(index)" v-bind:disabled="index === 0">削除</button>  <!-- 1行目は削除できないようにしておく -->
    </div>
  </div>
  
  <div class="controls">
    <p><button type="button" @click="onDelete">画像を削除する</button></p>
    <p><button type="button" @click="onUpdate">更新</button></p>
  </div>
</div>
<p class="footer"><RouterLink to="/admin/images">アップロード済み画像一覧に戻る</RouterLink></p>
</template>

<style scoped>
h3 {
  margin: 0 0 1rem;
}

.image-preview img {
  max-width: 300px;  /* TODO : 画像プレビューのサイズ指定がテキトーすぎやしないか？ */
}

.add-tag {
  text-align: right;
}

.tag-row {
  margin-bottom: .5rem;
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 2.5rem 1fr auto;
}

.controls {
  margin-top: 2rem;
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 1fr 1fr;
}

.controls > :last-child {
  text-align: right;
}

.footer {
  margin-top: 2rem;
  text-align: right;
}
</style>
