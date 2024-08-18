import { Message } from '../src/providers/providers';
import { nexraAryahcrCc } from '../src/providers/nexra-aryahcr-cc';

/** Nexra AryahCR CC の API をコールするテスト */
(async () => {
  try {
    const messages: Array<Message> = [
      { role: 'user', content: 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。' }
    ];
    const text = await nexraAryahcrCc(messages);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();
