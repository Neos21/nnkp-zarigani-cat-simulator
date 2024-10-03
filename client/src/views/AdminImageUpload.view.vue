<script setup lang="ts">
import { ref } from 'vue';

/** タグ1要素を示す型 (`v-for` 内で `v-model` を用いるためにオブジェクトが必要だったため定義する) */
type Tag = { index: number, value: string; };

/** フォーム要素の参照 */
const form = ref();

/** アップロード対象ファイル */
let file: File | null = null;
/** アップロード対象ファイルのプレビュー用 `src` 属性値 */
const fileSrc = ref<string>('');
/** タグのリスト */
const tags = ref<Array<Tag>>([
  { index: 0, value: '' }  // デフォルト値として1行置いておく
]);

/** `[type="file"]` に対して `v-model` は使えないので `v-on:change` で監視する */
const onChangeFile = (event: Event) => {
  const inputFile: File | undefined = (event.target as HTMLInputElement).files?.[0];
  if(inputFile == null) return console.warn('画像ファイルが取得できなかった', event);
  
  if(!['.jpeg', '.jpg', '.gif', '.png'].some(extension => inputFile.name.endsWith(extension))) {
    console.warn('画像でないファイルが選択されました', inputFile);
    return alert('画像でないファイルが選択されました');
  }
  
  file = inputFile;  // ファイルを控えておく
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
  const newIndex = tags.value.length + 1;
  tags.value.push({ index: newIndex, value: '' });
};

/** リセットボタン押下時に「アップロード対象ファイル」の参照を削除し、タグを1行に戻す */
const onReset = () => {
  file = null;
  fileSrc.value = '';
  
  tags.value = [{ index: 0, value: '' }];
};

/** アップロードボタン押下時 */
const onSubmit = async () => {
  // Credential
  const credential = localStorage.getItem('credential');
  if(credential == null || credential === '') return alert('Credential を設定してください');
  
  // 画像ファイル
  if(file == null) return alert('画像を選択してください');
  
  // タグ
  const tagValues = tags.value.map(tag => tag.value);
  if(tagValues.some(tagValue => tagValue === '')) return alert('未入力のタグ行があります');
  
  try {
    const formData = new FormData();
    formData.append('credential', credential);
    formData.append('file', file, file.name);
    formData.append('file_name', 'test.gif');
    tagValues.forEach(tagValue => formData.append('tags[]', tagValue));
    const response = await fetch('/api/images', {
      method: 'POST',
      body: formData  // FormData を POST する際は Content-Type は指定しないこと : https://zenn.dev/kariya_mitsuru/articles/25c9aeb27059e7
    });
    if(!response.ok) {
      const json = await response.json().catch(_error => null);
      throw new Error(json == null ? '原因不明のエラー' : json.error);
    }
    
    console.log('アップロード成功');
    alert('アップロードできました');
    
    // フォームをリセットする
    form.value.reset();
    onReset();
  }
  catch(error) {
    console.error('アップロード失敗', error);
    alert('アップロードに失敗しました。もう一度やり直してください');
  }
};
</script>

<template>
<h2>画像アップロード</h2>
<form @submit.prevent="onSubmit" ref="form">
  <p><input type="file" accept=".jpeg, .jpg, .gif, .png" @change="onChangeFile"></p>
  <p class="image-preview" v-if="fileSrc !== ''">
    <img v-bind:src="fileSrc">
  </p>
  
  <hr>
  <div class="tags" v-for="(tag, index) in tags" v-bind:key="index">
    <div class="tag-row">
      <span>{{ index + 1 }}</span>
      <input type="text" v-model="tag.value" placeholder="タグ">
      <button type="button" @click="onRemoveTag(index)" v-bind:disabled="index === 0">削除</button>  <!-- 1行目は削除できないようにしておく -->
    </div>
  </div>
  <p class="add-tag"><button type="button" @click="onAddTag">タグを追加</button></p>
  
  <hr>
  <div class="controls">
    <p><button type="reset" @click="onReset">リセット</button></p>
    <p><button type="submit">アップロード</button></p>
  </div>
</form>
</template>

<style scoped>
.image-preview img {
  max-width: 300px;
}

.tag-row {
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 2.5rem 1fr auto;
}

.add-tag {
  text-align: right;
}

.controls {
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 1fr 1fr;
}

.controls > p:last-child {
  text-align: right;
}
</style>
