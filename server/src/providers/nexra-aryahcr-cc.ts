import fetch from 'node-fetch';  // NOTE : CommonJS 形式の v2 系を使うこと

/** ロール定義 */
export type NexraAryahcrCcRole = 'assistant' | 'user';

/** メッセージ定義 */
export type NexraAryahcrCcMessage = { role: NexraAryahcrCcRole; content: string; };

/** メッセージの配列定義 */
export type NexraAryahcrCcMessages = Array<NexraAryahcrCcMessage>;

/** 選択可能なモデル定義 */
export type NexraAryahcrCcModel = 'gpt-4' | 'gpt3.5-turbo' | 'gpt-3';

/** レスポンス定義 (`gpt` プロパティがレスポンステキスト) */
export type NexraAryahcrCcResponse = { code: number; status: boolean; model: string; gpt: string; };

/** Nexra AryahCR CC プロバイダ */
export const nexraAryahcrCc = async function(messages: NexraAryahcrCcMessages, model: NexraAryahcrCcModel): Promise<NexraAryahcrCcResponse> {
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
  const json = await response.json() as NexraAryahcrCcResponse;
  return json;
};

/*
 * - https://nexra.aryahcr.cc/documentation/chatgpt/en
 *   - 公式 API ドキュメント
 * - https://github.com/zachey01/gpt4free.js/blob/main/src/Providers/ChatCompletion/Aryahcr.js
 * - https://github.com/XInTheDark/raycast-g4f/blob/main/src/api/Providers/nexra.jsx
 *   - 参考実装
 */
