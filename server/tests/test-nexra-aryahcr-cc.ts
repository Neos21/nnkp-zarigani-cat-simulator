import { nexraAryahcrCc, NexraAryahcrCcMessages } from '../src/providers/nexra-aryahcr-cc';

/** Nexra AryahCR CC の API をコールするテスト */
(async () => {
  try {
    const messages: NexraAryahcrCcMessages = [
      { role: 'user', content: 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。' }
    ];
    const json = await nexraAryahcrCc(messages, 'gpt-4');
    console.log(json.gpt);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();
