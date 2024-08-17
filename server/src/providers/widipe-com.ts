import fetch from 'node-fetch';

/** Widipe Com プロバイダ */
export const widipeCom = async function(message: string): Promise<string> {
  const response = await fetch(`https://widipe.com/openai?text=${message}`);
  const json = await response.json();
  const text = json.result;
  return text;
};

/*
 * - https://github.com/AyGemuy/Taylor-V2/blob/95817af4be65b240aeca213094dd4dc7c576ed3f/plugins/Others/open-ai.js#L171
 *   - 参考実装
 *   - 頻繁にエラーになる
 */
