import { apiRnilaweeraLk } from '../src/providers/api-rnilaweera-lk';

/** API Rnilaweera Lk の API をコールするテスト */
(async () => {
  try {
    const message = 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。';
    const text = await apiRnilaweeraLk(message);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();
