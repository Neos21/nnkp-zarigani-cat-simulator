import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { nexraAryahcrCc } from '../../providers/nexra-aryahcr-cc';
import { Message } from '../../providers/providers';

/** Chat Service */
@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);
  private readonly slackWebhookUrl: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.slackWebhookUrl = this.configService.get('slackWebhookUrl');
  }
  
  /** AI Chat 処理 */
  public async chat(inputText: string): Promise<string> {
    // 一番動作が安定している Nexra AryahCR CC プロバイダを使ってみる
    const messages: Array<Message> = [
      { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えて猫の状況について答えてください。' },
      { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
      { role: 'user'     , content: inputText }
    ];
    const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
    const responseText = result == null
      ? '申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
      : result.trim();
    
    this.sendLogToSlack('Web', inputText, responseText);
    return responseText;
  }
  
  /** 動作ログを Slack に送信する */
  private async sendLogToSlack(title: string, inputText: string, outputText: string): Promise<void> {
    if(this.slackWebhookUrl == null || this.slackWebhookUrl === '') return;
    
    try {
      const jstNow = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
      const jst = jstNow.getFullYear()
                + '-' + ('0' + (jstNow.getMonth() + 1)).slice(-2)
                + '-' + ('0' + jstNow.getDate()).slice(-2)
                + ' ' + ('0' + jstNow.getHours()).slice(-2)
                + ':' + ('0' + jstNow.getMinutes()).slice(-2)
                + ':' + ('0' + jstNow.getSeconds()).slice(-2);
      
      const response = await fetch(this.slackWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `【${jst}】${title}\n【Q】${inputText}\n【A】${outputText}`
        })
      });
      if(!response.ok) throw new Error('Response NG');
      const text = await response.text();
      this.logger.log('#sendLogToSlack() : ログ送信成功', text);
    }
    catch(error) {
      this.logger.warn('#sendLogToSlack() : ログ送信失敗', error);
    }
  }
}
