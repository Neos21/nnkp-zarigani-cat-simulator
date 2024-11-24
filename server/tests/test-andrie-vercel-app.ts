import { andrieVercelApp } from '../src/providers/andrie-vercel-app';

/** Andrie Vercel App の API をコールするテスト */
(async () => {
  try {
    const message = 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。';
    const text = await andrieVercelApp(message);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();

// 2024-11-24 : 英語 (ローマ字) で答える
