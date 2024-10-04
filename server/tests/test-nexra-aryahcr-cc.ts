import { Message } from '../src/providers/providers';
import { nexraAryahcrCc } from '../src/providers/nexra-aryahcr-cc';

/** Nexra AryahCR CC の API をコールするテスト */
(async () => {
  try {
    const messages: Array<Message> = [
      { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えてザリガニ猫の状況について答えてください。1行目には「喜怒哀楽」のいずれか1文字で表現した感情パラメーターを答え、2行目から回答を書いてください。' },
      { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
      { role: 'user'     , content: 'ザリガニ猫がイライラするときは？' }
    ];
    const text = await nexraAryahcrCc(messages);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();
