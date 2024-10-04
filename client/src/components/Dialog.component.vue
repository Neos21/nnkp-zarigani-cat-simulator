<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

/** ダイアログ要素自身の参照 */
const dialog = ref();
/** ダイアログが開いているか否か : DOM 要素を描画させるため `v-if` を使用している */
const isOpen = ref<boolean>(false);
/** タイトル */
const title = ref<string>('');
/** 本文 */
const text = ref<string>('');
/** 「キャンセル」ボタンを配置するか否か */
const isShowCancelButton = ref<boolean>(false);

/** ダイアログが閉じた時に Promise を返せるようにする */
let closePromiseResolver = null;

/** ダイアログを閉じる時の処理 */
const onCloseDialog = (message: string = 'Cancel') => {
  closePromiseResolver!(message);
};

/** ダイアログの外側・バックドロップを押下した時に閉じる処理 */
const onClickOutsideDialog = (event: Event) => {
  if(event.target === dialog.value) closePromiseResolver!('Cancel');
};

/** ダイアログを開く */
const openDialog = async (inputTitle: string, inputText: string, isShowCancel: boolean = false) => {
  dialog.value?.showModal();
  isOpen.value = true;
  const closePromise = new Promise(resolve => {
    closePromiseResolver = resolve;  // Resolve をキャッシュしておく
  });
  
  title.value = inputTitle;
  text.value = inputText;
  isShowCancelButton.value = isShowCancel;
  
  const result = await closePromise;  // Promise を待機する
  dialog.value?.close();
  isOpen.value = false;
  return result;
};

/** API を外部公開する */
defineExpose({
  openDialog
});

onMounted(() => {
  // Esc キーによるイベント用に追加する
  dialog.value?.addEventListener('cancel', onCloseDialog);
  // ダイアログの外側を押下した時のイベント用に追加する
  dialog.value?.addEventListener('click', onClickOutsideDialog);
});

// イベントを重複して登録しないように解除しておく
onUnmounted(() => {
  dialog.value?.removeEventListener('cancel', onCloseDialog);
  dialog.value?.removeEventListener('click', onClickOutsideDialog);
});

// - 参考 : https://future-architect.github.io/articles/20240515a/
</script>

<template>
<dialog ref="dialog" class="dialog">
  <div v-if="isOpen">
    <h3>{{ title }}</h3>
    <p>{{ text }}</p>
    <div class="controls">
      <div><button type="button" v-if="isShowCancelButton" @click="onCloseDialog('Cancel')">キャンセル</button></div>
      <div><button type="button" @click="onCloseDialog('OK')">OK</button></div>
    </div>
  </div>
</dialog>
</template>

<style scoped>
.dialog {
  min-width: 300px;
  outline: 0;
  border: 0;
  border-radius: 6px;
  padding: 0;
  box-shadow: 0 0 1rem #333;
}

.dialog::backdrop {
  background-color: rgba(0, 0, 0, .5);
  cursor: pointer;
}

h3 {
  margin: 0 0 1rem;
  border-bottom: 1px solid #999;
  padding: 1rem;
  background: #fff3f3;
}

p {
  margin: 1rem;
}

.controls {
  margin: 2rem 1rem 1rem;
  display: grid;
  column-gap: .5rem;
  grid-template-columns: 1fr 1fr;
}
  .controls > :last-child {
    text-align: right;
  }
    .controls > :last-child > button {
      padding-right: 1rem;
      padding-left: 1rem;
    }
</style>
