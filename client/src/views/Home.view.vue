<script lang="ts">
/** 画像ファイル名をキャッシュしておく */
const imageFileNames: Array<string> = [];

/**
 * API をコールして画像ファイル名一覧を取得する
 * 
 * @return 画像ファイル名一覧・キャッシュ済であればそれを返す
 * @
 */
const fetchImageFileNames: Promise<Array<string>> = async () => {
  if(imageFileNames.length !== 0) return imageFileNames;
  
  const imageFileNamesResponse = await fetch('/api/images');
  if(!imageFileNamesResponse.ok) throw new Error('Failed To Fetch Image File Names');
  const imageFileNamesJson: Array<string> = await imageFileNamesResponse.json();
  
  // ファイルパスを調整する
  const renamedImageFileNames = imageFileNamesJson.map(imageFileName => `/public/images/${imageFileName}`);
  imageFileNames.push(...renamedImageFileNames);  // キャッシュに残す
  return imageFileNames;
};

/** 配列から要素をランダムに1つ取得する */
const getRandomFromArray = (array: Array<any>) => array[Math.floor(Math.random() * array.length)];
</script>

<script setup lang="ts">
import { ref } from 'vue';

const isLoaded     = ref<boolean>(false);  // 初期表示が完了したか否か
const isProcessing = ref<boolean>(false);  // API 通信中か否か
const imageSrc     = ref<string>('');
const message      = ref<string>('ザリガニねこは今何をしているでしょう？');

const inputTextModel = defineModel('inputTextModel');
/** 送信ボタン押下時の処理 */
const onSubmit = async () => {
  // Validate
  const inputText = inputTextModel.value.trim();
  if(inputText === '') return alert('質問文を打ち込んでください');  // エラーメッセージの出し方イマイチ…
  
  try {
    message.value = 'ザリガニねこに問い合わせています…';
    isProcessing.value = true;  // 二度押し防止
    
    // 質問を API に投げる
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input_text: inputText
      })
    });
    if(!response.ok) throw new Error('ザリガニねこさんの様子が聞けませんでした。ごめんね');
    const json = await response.json();
    
    // メッセージを表示する
    message.value  = json.result;
    // 画像をランダムに差し替える
    const imageFileNames = await fetchImageFileNames();
    imageSrc.value = getRandomFromArray(imageFileNames);
  }
  catch(error) {
    console.error('Failed To Chat', error);
    message.value = error.message;
  }
  finally {
    isProcessing.value = false;
  }
};

/** 画像をクリックした時の処理 */
const onClickImage = async () => {
  // 再びランダムに画像を取得して差し替える・押下前と同じ画像が連続して表示されることもありうる
  const imageFileNames = await fetchImageFileNames();
  imageSrc.value = getRandomFromArray(imageFileNames);
};

// 初期表示時の処理
(async () => {
  try {
    // 画像ファイル名のリストを取得する
    const imageFileNames = await fetchImageFileNames();  // Throws
    // ランダムに1つ画像ファイル名を取得し、表示する画像として割り当てる
    imageSrc.value = getRandomFromArray(imageFileNames);
  }
  catch(error) {
    console.error('Failed To Initialize', error);
    message.value = 'エラーが発生しました。ごめんね';
  }
  finally {
    isLoaded.value = true;
  }
})();
</script>

<template>
<Transition>
  <div class="wrapper" v-show="isLoaded">
    <div class="container">
      <h1>ザリガニねこに話しかけてみよう</h1>
      
      <div class="output-container">
        <div class="image">
          <img v-bind:src="imageSrc" @click="onClickImage">
        </div>
        <div class="message">
          {{ message }}
        </div>
      </div>
      
      <form class="input-container" @submit.prevent="onSubmit">
        <div class="textbox">
          <input type="text" v-model="inputTextModel" v-bind:disabled="isProcessing" placeholder="質問文を打ち込んでください" required maxlength="50">
        </div>
        <div class="submit-button">
          <button type="submit" v-bind:disabled="isProcessing">送信</button>
        </div>
      </form>
    </div>
  </div>
</Transition>
<RouterLink to="/admin" class="admin-link">●</RouterLink>
</template>

<style scoped>
/*
 * Transition コンポーネントによる初期表示
 * 
 * - Web Font 読み込みのため初期表示時にレイアウトがカクつく
 * - 初期表示の画像読み込みもあるため、初期表示用の処理が終わった段階で `isLoaded` によりフェード表示させる
 * - 参考 : https://ja.vuejs.org/guide/built-ins/transition
 */
.v-enter-active {
  transition: opacity .3s;
}
.v-enter-from {
  opacity: 0;
}
.v-enter-to {
  opacity: 1;
}

/* 画面縦横中央揃え */
.wrapper {
  /* 汎用 : 余白指定用 */
  --space-small  : 0.5rem;
  --space-default: 1.0rem;
  --space-large  : 1.5rem;
  /* 画像の最大表示サイズ */
  --image-max-width : 450px;
  --image-max-height: 400px;
  
  height: 100%;
  display: grid;
  place-items: center;
}
  .container {
    text-align: center;
  }

h1 {
  margin: 0 0 var(--space-small);
  font-size: 1.7rem;
  white-space: nowrap;
}

.output-container {
  --border-width: 4px;
  --inner-space : var(--space-large);
  
  margin-bottom: var(--space-default);
  width: calc(var(--image-max-width) + var(--inner-space) * 2 + var(--border-width) * 2);
  border: var(--border-width) solid #ffb1b1;
  padding: var(--inner-space);
  background: #fff;
}
  .image {
    margin-bottom: var(--space-default);
  }
    .image img {
      width : var(--image-max-width);
      height: var(--image-max-height);
      object-fit: contain;  /* 縦横比が異なる場合は短辺に余白を設ける形で表示する */
      outline: 1px solid rgba(128, 128, 128, .25);
      margin: 0;
      background: #fff;
      vertical-align: top;
      cursor: pointer;
    }
      .image img:hover {
        background: #f6f6f6;
      }
  /* .message */

.input-container {
  margin: 0;
}
  .textbox {
    margin-bottom: var(--space-default);
  }
    .textbox input {
      width: calc(var(--image-max-width) - 2rem);
      border: 1.25px solid #ccc;
      border-radius: 6px;
      padding: .4rem .75rem;
      color: inherit;
      font-size: 17px;
      font-family: inherit !important;
      background: #fff;
    }
      .textbox input:disabled {
        background: #f0f0f0;
        cursor: not-allowed;
      }
  /* .submit-button */
    .submit-button button {
      border: 0;
      border-radius: 6px;
      padding: .45rem 1.5rem;
      color: inherit;
      font-size: 17px;
      font-family: inherit !important;
      font-weight: normal;
      line-height: 1.25;
      background: #ffc2c2;
      cursor: pointer;
    }
      /* Hover・Focus 時の色は現状適当 */
      .submit-button button:hover {
        background: #ffb2b2;
      }
      .submit-button button:focus {
        background: #ffa2a2;
      }
      .submit-button button:disabled {
        background: #e0e0e0;
        cursor: not-allowed;
      }

.admin-link {
  position: absolute;
  bottom: 0;
  right: 0;
  color: #000;
  text-decoration: none;
  opacity: .1;
}

/* 画面幅が小さい時のレイアウト調整 */
@media (max-width: 600px) {
  .wrapper {
    --image-max-width : 280px;
    --image-max-height: 250px;
  }
  
  h1 {
    font-size: 1.2rem;
  }
  
  .output-container {
    --inner-space: var(--space-small);
  }
    .message {
      line-height: 1.5;
    }
  
  /* .input-container */
    .textbox input {
      width: var(--image-max-width);
    }
}
</style>
