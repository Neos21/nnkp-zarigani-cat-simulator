<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const credential = ref<string>('');

// フッターリンクの表示切替用
const currentRoutePath = ref<string>('');

/** Credential を LocalStorage に保存する */
const onSubmit = () => {
  const inputCredential = credential.value;
  if(inputCredential === '') return console.log('Credential 未入力');
  
  localStorage.setItem('credential', inputCredential);
  alert('Credential を保存しました');  // TODO : `alert()` で表示するのダサくない？
};

/** 初期表示時に LocalStorage に保存されている Credential を復元する */
(() => {
  const storedCredential = localStorage.getItem('credential');
  if(storedCredential != null && storedCredential !== '') credential.value = storedCredential;
  
  const route = useRoute();
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
    <button type="submit">保存</button>
  </form>
  
  <RouterView />
  
  <hr>
  <div class="footer">
    <p><RouterLink to="/admin" v-if="currentRoutePath !== '/admin'">管理画面トップに戻る</RouterLink></p>
    <p><RouterLink to="/" v-if="currentRoutePath === '/admin'">Indexに戻る</RouterLink></p>
  </div>
</div>
</template>

<style scoped>
.wrapper {
  min-height: 100%;
  padding: 1rem;  /* 子要素の Margin によるズレ回避も兼ねて Margin ではなく Padding を使う */
  background: #fff;
}

h1 {
  margin-top: 0;
}

form {
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 1fr auto;
}

.footer {
  text-align: right;
}
</style>
