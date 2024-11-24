import { widipeCom } from '../src/providers/widipe-com';

/** Widipe Com の API をコールするテスト */
(async () => {
  try {
    const message = 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。';
    const text = await widipeCom(message);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();

// 2024-11-24 : ENOTFOUND エラー
