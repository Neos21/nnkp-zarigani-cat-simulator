import { Message } from '../src/providers/providers';
import { chatGpt42PRapidApiCom } from '../src/providers/chatgpt-42-p-rapidapi-com';

/** ChatGPT 42 P RapidAPI Com の API をコールするテスト */
(async () => {
  try {
    const messages: Array<Message> = [
      { role: 'user', content: 'あなたは猫を飼っています。ユーモアを交えて猫の状況を教えてください。' }
    ];
    const text = await chatGpt42PRapidApiCom(messages);
    console.log(text);
  }
  catch(error) {
    console.error('Error :', error);
  }
})();

// 2024-11-24 : 英語で答える
