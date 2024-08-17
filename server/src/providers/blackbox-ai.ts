import fetch from 'node-fetch';

import { Message } from './providers';

/** Blackbox AI プロバイダ */
export const blackboxAi = async function(messages: Array<Message>): Promise<string> {
  const response = await fetch('https://www.blackbox.ai/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: messages,
      id: 'pgK5Du2',
      userId: 'a369da6d-f18c-4c69-b99b-6a59c41466f1',
      agentMode: {},
      codeModelMode: true,
      isChromeExt: false,
      isMicMode: false,
      playgroundMode: false,
      trendingAgentMode: {},
      userSystemPrompt: '',
      webSearchMode: false
    })
  });
  const rawText = await response.text();
  const text = rawText.replace(/(\$\@\$.*?\$\@\$)/g, '');
  return text;
};

/*
 * - https://github.com/zachey01/gpt4free.js/blob/main/src/Providers/ChatCompletion/BlackBox.js
 * - https://github.com/XInTheDark/raycast-g4f/blob/main/src/api/Providers/blackbox.jsx
 * - https://github.com/Barnie-Corps/barniebot/blob/92b35cbea05d1408dbd8151cb3d83cc96ff7f7ec/utils.ts
 * - https://github.com/OzRAGEHarm/blackbox-ai/blob/f66314dce1e75708558f6babf5998a54765928e9/src/chat.js
 * - https://github.com/Nevesto/aura/blob/d2ffa70fdbc1e8520076c901faf9e142c893d777/commands/askBlackBox.ts
 * - https://github.com/mohamedeldony30/boh/blob/920cb16cada2169babbf82d371219c57f15b94a2/lib/scraper/kotakhitam.js
 *   - 参考実装
 */
