import fetch from 'node-fetch';

/** Andrie Vercel App プロバイダ */
export const andrieVercelApp = async function(message: string): Promise<string> {
  const response = await fetch(`https://andrie.vercel.app/api/gpt?query=${message}`);
  const json = await response.json();
  const text = json.result;
  return text;
};

/*
 * - https://github.com/AyGemuy/Taylor-V2/blob/95817af4be65b240aeca213094dd4dc7c576ed3f/plugins/Others/open-ai.js#L263
 * - https://github.com/Lucifer105127/yaserf/blob/1f1dc430d018c93e44dc4d5dd081819657117d71/scripts/commands/kazuma.js
 *   - 参考実装
 */
