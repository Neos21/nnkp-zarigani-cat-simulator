import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';

import { Message } from '../../providers/providers';
import { nexraAryahcrCc } from '../../providers/nexra-aryahcr-cc';

/** Slack Service */
@Injectable()
export class SlackService {
  private readonly logger: Logger = new Logger(SlackService.name);
  private readonly slackBotToken: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.slackBotToken = this.configService.get('slackBotToken');
  }
  
  /** メンションへの返信処理 */
  public async replyToMention(channelId: string, originalText: string): Promise<void> {
    try {  // https://api.slack.com/methods/chat.postMessage
      
      // 一番動作が安定している Nexra AryahCR CC プロバイダを使ってみる
      const messages: Array<Message> = [
        { role: 'user', content: 'あなたは猫を飼っています。これから質問をしますので、ユーモアを交えて猫の状況について答えてください。' },
        { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。猫の立場から楽しくお答えします。' },
        { role: 'user', content: originalText }
      ];
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const responseText = result == null
        ? 'メンションありがとうございます。\n申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : `メンションにお答えします!\n\n${result}`
      
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.slackBotToken}`
        },
        body: JSON.stringify({
          channel: channelId,
          text: responseText
        })
      });
      const json = await response.json();
      if(json.ok === false) throw new Error(json.error);
      this.logger.log('#replyToMention() : 返信成功');
    }
    catch(error) {
      this.logger.warn('#replyToMention() : 返信失敗', error);
    }
  }
  
  /** メンションへの返信処理 */
  public async replyToDirectMessage(channelId: string, originalText: string): Promise<void> {
    try {
      // 一番動作が安定している Nexra AryahCR CC プロバイダを使ってみる
      const messages: Array<Message> = [
        { role: 'user', content: 'あなたは猫を飼っています。これから質問をしますので、ユーモアを交えて猫の状況について答えてください。' },
        { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。猫の立場から楽しくお答えします。' },
        { role: 'user', content: originalText }
      ];
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const responseText = result == null
        ? 'DM ありがとうございます。\n申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : `DM にお答えします!\n\n${result}`
      
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.slackBotToken}`
        },
        body: JSON.stringify({
          channel: channelId,
          text: responseText
        })
      });
      const json = await response.json();
      if(json.ok === false) throw new Error(json.error);
      this.logger.log('#replyToDirectMessage() : 返信成功');
    }
    catch(error) {
      this.logger.warn('#replyToDirectMessage() : 返信失敗', error);
    }
  }
  
  /** `/zc` スラッシュコマンドが呼び出された時の処理 */
  public async zcCommand(originalText: string, responseUrl: string): Promise<void> {
    try {
      // 一番動作が安定している Nexra AryahCR CC プロバイダを使ってみる
      const messages: Array<Message> = [
        { role: 'user', content: 'あなたは猫を飼っています。これから質問をしますので、ユーモアを交えて猫の状況について答えてください。' },
        { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。猫の立場から楽しくお答えします。' },
        { role: 'user', content: originalText }
      ];
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const responseText = result == null
        ? '「/zc」コマンドを受信しました。\n申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : `「/zc」コマンドにお答えします!\n\n${result}`
      
      const response = await fetch(responseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          response_type: 'in_channel',  // 「あなただけに表示」ではなくチャンネルに公開表示する
          text: responseText
        })
      });
      const text = await response.text();
      this.logger.log('#zcCommand() : 返信成功 …', text);
    }
    catch(error) {
      this.logger.warn('#zcCommand() : 返信失敗 …', error);
    }
  }
  
  /** ランディングページの HTML を返す */
  public getAboutPageHtml(): string {
    return `<!DOCTYPE html>
      <html lang="ja">
        <head>
          <meta charset="UTF-8">
          <meta name="slack-app-id" content="A07HBS5FB8T">
          <title>ザリガニねこシミュレーター</title>
        </head>
        <body>
          <h1>ザリガニねこシミュレーター</h1>
          <p>インストールは ↓ コチラから。</p>
          <p>
            <a href="https://slack.com/oauth/v2/authorize?client_id=6131689063031.7589889521299&scope=app_mentions:read,chat:write,chat:write.public,commands,im:history&user_scope=">
              <img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x">
            </a>
          </p>
        </body>
      </html>
    `;
  }
}
