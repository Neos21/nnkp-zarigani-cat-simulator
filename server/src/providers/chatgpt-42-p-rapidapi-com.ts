import fetch from 'node-fetch';

import { Message } from './providers';

/** ChatGPT 42 P RapidAPI Com プロバイダ */
export const chatGpt42PRapidApiCom = async function(messages: Array<Message>): Promise<string> {
  const response = await fetch('https://chatgpt-42.p.rapidapi.com/conversationgpt4', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': 'ec4a07939fmsh4daed89d45e8bccp165f71jsn06c493b781a9',
      'X-RapidAPI-Host': 'chatgpt-42.p.rapidapi.com'
    },
    body: JSON.stringify({
      messages: messages,
      temperature: .2,
      top_k: 5,
      top_p: .9,
      max_tokens: 806,
      web_access: false
    })
  });
  const json = await response.json();
  const text = json.result;
  return text;
};

/*
 * - https://github.com/AyGemuy/Taylor-V2/blob/95817af4be65b240aeca213094dd4dc7c576ed3f/plugins/Others/open-ai.js#L202
 * - https://github.com/idlanyor/little-kanata/blob/f08a4d068977d9c7ccf0553bcf93213d29e23d6d/features/rapidai.js
 * - https://github.com/sohaibkhan1125/boge123/blob/01948c3bb47079427e00242edd58be3721f07259/utils/AiModal.tsx
 *   - 参考実装
 *   - 応答は日本語と英語が混じり精度が悪い
 */
