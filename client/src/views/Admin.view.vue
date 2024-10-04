<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import DialogComponent from '../components/Dialog.component.vue';

const route = useRoute();

/** Credential */
const credential = ref<string>('');
/** フッターリンクの表示切替用・現在のパスを取得しておく */
const currentRoutePath = ref<string>('');
/** ダイアログ要素の参照 */
const dialog = ref();

/** Credential を LocalStorage に保存する */
const onSubmit = async () => {
  const inputCredential = credential.value.trim();
  if(inputCredential === '') return console.log('Credential 未入力');
  
  localStorage.setItem('credential', inputCredential);
  await dialog.value!.openDialog('保存完了', 'Credential を保存しました');
};

/** 初期表示時 */
(() => {
  // LocalStorage に保存されている Credential があれば復元する
  const storedCredential = localStorage.getItem('credential');
  if(storedCredential != null && storedCredential !== '') credential.value = storedCredential;
  
  // 現在のパスを監視して控えておく
  currentRoutePath.value = route.path;
  watch(() => route.path, () => {
    currentRoutePath.value = route.path;
  });
})();
</script>

<template>
<div class="wrapper">
  <h1>Admin</h1>
  
  <form @submit.prevent="onSubmit">
    <input type="text" v-model="credential" placeholder="Credential">
    <button type="submit" v-bind:disabled="credential.trim() === ''">保存</button>
  </form>
  
  <RouterView />
  
  <div class="footer">
    <RouterLink to="/admin" v-if="currentRoutePath !== '/admin'">管理画面トップに戻る</RouterLink>
    <RouterLink to="/"      v-if="currentRoutePath === '/admin'">Index に戻る</RouterLink>
  </div>
  
  <DialogComponent ref="dialog" />
</div>
</template>

<style scoped>
.wrapper {
  min-height: 100%;
  padding: 1rem;  /* 子要素の Margin によるズレ回避も兼ねて Margin ではなく Padding を使う */
  background: #fff;
}

h1 {
  margin: 0 0 1rem;
}

form {
  margin: 0 0 3rem;
  border-bottom: 1px solid #ccc;
  padding-bottom: 3rem;
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 1fr auto;
}

.footer {
  margin: 3rem 0;
  border-top: 1px solid #ccc;
  padding-top: 3rem;
  text-align: right;
}


/* 子コンポーネントの共通デザイン */

.wrapper :deep(a) {
  color: #00f;
}
  .wrapper :deep(a:hover) {
    color: #f00;
  }

.wrapper :deep(h2) {
  margin: 0 0 1rem;
}
</style>
