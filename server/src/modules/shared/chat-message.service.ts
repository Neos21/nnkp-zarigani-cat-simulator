import { Injectable } from '@nestjs/common';

import { Message } from '../../providers/providers';

/** Chat Message Service */
@Injectable()
export class ChatMessageService {
  /**
   * AI に送信するメッセージオブジェクトを生成する (感情パラメーター要求版)
   * 
   * @param inputText 入力文字列
   * @return メッセージの配列
   */
  public createMessageWithEmotionParameter(inputText: string): Array<Message> {
    const messages: Array<Message> = [
      { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えてザリガニ猫の状況について答えてください。1行目には「喜怒哀楽」のいずれか1文字で表現した感情パラメーターを答え、2行目から回答を書いてください。' },
      { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
      { role: 'user'     , content: inputText }
    ];
    return messages;
  }
  
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
