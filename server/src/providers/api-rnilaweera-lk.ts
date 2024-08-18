import fetch from 'node-fetch';

/** API Rnilaweera Lk プロバイダ */
export const apiRnilaweeraLk  = async function(message: string): Promise<string> {
  const response = await fetch('https://api.rnilaweera.lk/api/v1/user/gpt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer rsnai_C5Y6ZSoUt3LRAWopF6PQ2Uef'
    },
    body: JSON.stringify({
      prompt: message
    })
  });
  const json = await response.json();
  const text = json.message;
  return text;
};

/*
 * - https://github.com/AyGemuy/Taylor-V2/blob/95817af4be65b240aeca213094dd4dc7c576ed3f/plugins/Others/open-ai.js#L182
 * - https://github.com/rsnlabs/rsnchat-py/blob/0f95b4ff31f3188f4d3d9aba69d186a3786ef26b/rsnchat/main.py
 *   - 参考実装
 *   - 応答は英語で返ってくる
 */
