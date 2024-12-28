// NOTE : ts-node で実行できるように CommonJS 形式の v2 系を使うこと
import fetch from 'node-fetch';

import { Message } from './providers';

/** 選択可能なモデル定義 */
export type NexraAryahcrCcModel = 'gpt-4' | 'gpt3.5-turbo' | 'gpt-3';

/** Nexra AryahCR CC プロバイダ */
export const nexraAryahcrCc = async function(messages: Array<Message>, model: NexraAryahcrCcModel = 'gpt-4'): Promise<string> {
  const response = await fetch('https://nexra.aryahcr.cc/api/chat/gpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messages,
      model: model,
      stream: false,
      markdown: false
    })
  });
  const json = await response.json();
  const text = json.gpt;
  return text;
};

/*
 * - https://nexra.aryahcr.cc/documentation/chatgpt/en
 *   - 公式 API ドキュメント
 * - https://github.com/zachey01/gpt4free.js/blob/main/src/Providers/ChatCompletion/Aryahcr.js
 * - https://github.com/XInTheDark/raycast-g4f/blob/main/src/api/Providers/nexra.jsx
 *   - 参考実装
 */
