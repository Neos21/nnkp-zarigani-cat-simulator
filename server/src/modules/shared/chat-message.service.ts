import { Injectable } from '@nestjs/common';

import { Message } from '../../providers/providers';

/** Chat Message Service */
@Injectable()
export class ChatMessageService {
  /**
   * AI に送信するメッセージオブジェクトを生成する
   * 
   * @param inputText 入力文字列
   * @return メッセージの配列
   */
  public createMessage(inputText: string): Array<Message> {
    const messages: Array<Message> = [
      { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えてザリガニ猫の状況について答えてください。' },
      { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
      { role: 'user'     , content: inputText }
    ];
    return messages;
  }
}
