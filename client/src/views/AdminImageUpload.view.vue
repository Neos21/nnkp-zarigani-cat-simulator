<script setup lang="ts">
import { ref } from 'vue';

import type { Tag } from '../types/tag';
import LoadingComponent from '../components/Loading.component.vue';
import ErrorMessageComponent from '../components/ErrorMessage.component.vue';
import DialogComponent from '../components/Dialog.component.vue';

/** アップロード対象ファイルを控えておく */
let file: File | null = null;

/** 読み込み中か否か */
const isLoading = ref<boolean>(true);
/** 初期表示時にエラーがあった場合 */
const errorMessage = ref<string>('');
/** フォーム要素の参照 */
const form = ref();
/** アップロード対象ファイルのプレビュー用 `src` 属性値 */
const fileSrc = ref<string>('');
/** タグのリスト : デフォルト値として1行置いておく */
const tags = ref<Array<Tag>>([{ id: 0, value: '' }]);
/** ダイアログ要素の参照 */
const dialog = ref();

/** Credential を取得する・取得できなかった場合は例外を Throw する */
const getCredential = (): string => {
  const credential = localStorage.getItem('credential');
  if(credential == null || credential === '') throw new Error('Credential を設定してください');
  return credential;
};

/** Credential がなかった場合の「再読込」ボタン押下時 */
const loadCredential = () => {
  isLoading.value = true;
  errorMessage.value = '';
  try {
    getCredential();
  }
  catch(error) {
    errorMessage.value = (error as any).toString();
  }
  finally {
    isLoading.value = false;
  }
}

/** 画像ファイル変更時 : `[type="file"]` に対して `v-model` は使えないので `v-on:change` で監視する */
const onChangeFile = async (event: Event) => {
  const inputFile: File | undefined = (event.target as HTMLInputElement).files?.[0];
  if(inputFile == null) return console.warn('画像ファイルが取得できなかった', event);
  
  if(!['.jpeg', '.jpg', '.gif', '.png'].some(extension => inputFile.name.endsWith(extension))) {
    console.warn('画像ではないファイルが選択されました', inputFile);
    return await dialog.value!.openDialog('エラー', '画像ではないファイルが選択されました');
  }
  
  // ファイルを控えておく
  file = inputFile;
  
  // プレビューを表示する
  const fileReader = new FileReader();
  fileReader.onload = () => {
    fileSrc.value = fileReader.result as string;
  };
  fileReader.readAsDataURL(file);
};

/** 選択されたタグ行を削除する */
const onRemoveTag = (index: number) => {
  tags.value.splice(index, 1);
};

/** タグを末尾に1行追加する */
const onAddTag = () => {
  const currentMaxId = Math.max(...tags.value.map(tag => tag.id));
  const newId = currentMaxId + 1;
  tags.value.push({ id: newId, value: '' });
};

/** リセットボタン押下時に「アップロード対象ファイル」の参照を削除し、タグを1行に戻す */
const onReset = () => {
  file = null;
  fileSrc.value = '';
  
  tags.value = [{ id: 0, value: '' }];
};

/** アップロードボタン押下時 */
const onSubmit = async () => {
  // Validate : Credential
  let credential;
  try {
    credential = getCredential();
  }
  catch(error) {
    return await dialog.value!.openDialog('エラー', 'Credential を設定してください');
  }
  
  // Validate : 画像ファイル
  if(file == null) return await dialog.value!.openDialog('エラー', '画像を選択してください');
  
  // Validate : タグ
  const tagValues = tags.value.map(tag => tag.value);
  if(tagValues.some(tagValue => tagValue.trim() === '')) return await dialog.value!.openDialog('エラー', '未入力のタグ行があります');
  
  try {
    const formData = new FormData();
    formData.append('credential', credential);
    formData.append('file', file, file.name);
    tagValues.forEach(tagValue => formData.append('tags[]', tagValue));
    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData  // NOTE : FormData を POST する際は Content-Type を指定しないこと : https://zenn.dev/kariya_mitsuru/articles/25c9aeb27059e7
    });
    if(!response.ok) {
      const json = await response.json().catch(_error => null);
      throw new Error(json == null ? '原因不明のエラー' : json.error);
    }
    
    await dialog.value!.openDialog('登録完了', '画像がアップロードできました');
    
    // フォームをリセットする
    form.value.reset();
    onReset();
  }
  catch(error) {
    console.error('アップロードに失敗', error);
    await dialog.value!.openDialog('エラー', 'アップロードに失敗しました。もう一度やり直してください');
  }
};

/** 初期表示時 */
(() => {
  loadCredential();
})();
</script>

<template>
<h2>画像アップロード</h2>
<LoadingComponent v-if="isLoading" />
<div v-else-if="errorMessage">
  <ErrorMessageComponent v-bind:error-message="errorMessage" />
  <p><button type="button" @click="loadCredential">再読込</button></p>
</div>
<form v-else @submit.prevent="onSubmit" ref="form">
  <p><input type="file" accept=".jpeg, .jpg, .gif, .png" @change="onChangeFile"></p>
  <p class="image-preview" v-if="fileSrc !== ''">
    <img v-bind:src="fileSrc">
  </p>
  
  <p class="add-tag"><button type="button" accesskey="a" @click="onAddTag">タグを追加</button></p>
  <div class="tags" v-for="(tag, index) in tags" v-bind:key="tag as unknown as PropertyKey">
    <div class="tag-row">
      <input type="text" v-model="tag.value" v-bind:placeholder="`タグ ${index + 1}`">
      <button type="button" @click="onRemoveTag(index)" v-bind:disabled="index === 0">削除</button>  <!-- 1行目は削除できないようにしておく -->
    </div>
  </div>
  
  <div class="controls">
    <p><button type="reset" @click="onReset">リセット</button></p>
    <p><button type="submit">アップロード</button></p>
  </div>
  
  <DialogComponent ref="dialog" />
</form>
</template>

<style scoped>
.image-preview img {
  max-width: 300px;
}

.add-tag {
  text-align: right;
}

.tag-row {
  margin-bottom: .5rem;
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 1fr auto;
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
</style>
