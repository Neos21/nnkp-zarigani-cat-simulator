import { Message } from '../src/providers/providers';
import { blackboxAi } from '../src/providers/blackbox-ai';

/** Blackbox AI の API をコールするテスト */
(async () => {
  try {
    const messages: Array<Message> = [
      { role: 'user', content: 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。' }
    ];
    const text = await blackboxAi(messages);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();
