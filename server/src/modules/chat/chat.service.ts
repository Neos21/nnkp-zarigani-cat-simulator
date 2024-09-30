import { Injectable } from '@nestjs/common';

import { nexraAryahcrCc } from 'src/providers/nexra-aryahcr-cc';
import { Message } from 'src/providers/providers';

/** Chat Service */
@Injectable()
export class ChatService {
  /** AI Chat 処理 */
  public async chat(inputText: string): Promise<string> {
    // 一番動作が安定している Nexra AryahCR CC プロバイダを使ってみる
    const messages: Array<Message> = [
      { role: 'user'     , content: 'あなたは猫を飼っています。これから質問をしますので、ユーモアを交えて猫の状況について答えてください。' },
      { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。猫の飼い主の立場から楽しくお答えします。' },
      { role: 'user'     , content: inputText }
    ];
    const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
    const responseText = result == null
      ? '申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
      : result.trim()
    return responseText;
  }
}
