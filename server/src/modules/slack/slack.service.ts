import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { createHmac } from 'crypto';
import tsscmp from 'tsscmp';

import { Message } from '../../providers/providers';
import { nexraAryahcrCc } from '../../providers/nexra-aryahcr-cc';

/** Slack Service */
@Injectable()
export class SlackService {
  private readonly logger: Logger = new Logger(SlackService.name);
  private readonly slackBotToken: string;
  private readonly slackSigningSecret: string;
  private readonly slackWebhookUrl: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.slackBotToken      = this.configService.get('slackBotToken');
    this.slackSigningSecret = this.configService.get('slackSigningSecret');
    this.slackWebhookUrl    = this.configService.get('slackWebhookUrl');
  }
  
  /** メンションへの返信処理 */
  public async replyToMention(channelId: string, originalText: string): Promise<void> {
    try {  // https://api.slack.com/methods/chat.postMessage
      const messages: Array<Message> = [
        { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えてザリガニ猫の状況について答えてください。' },
        { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
        { role: 'user'     , content: originalText }
      ];
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const responseText = result == null
        ? 'メンションありがとうございます。\n申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : `メンションにお答えします!\n\n${result}`;
      this.logger.log('#replyToMention()')
      
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
      if(!response.ok) throw new Error('Server Error');
      const json = await response.json();
      if(!json.ok) throw new Error(json.error);
      
      this.sendLogToSlack('Slack メンション返信', originalText, responseText);
      this.logger.log('#replyToMention() : 返信成功', `【Q】${originalText}`, `【A】${responseText}`);
    }
    catch(error) {
      this.sendLogToSlack('Slack メンション返信 : 失敗', originalText, error.toString());
      this.logger.warn('#replyToMention() : 返信失敗', `【Q】${originalText}`, error);
    }
  }
  
  /** メンションへの返信処理 */
  public async replyToDirectMessage(channelId: string, originalText: string): Promise<void> {
    try {
      const messages: Array<Message> = [
        { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えてザリガニ猫の状況について答えてください。' },
        { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
        { role: 'user'     , content: originalText }
      ];
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const responseText = result == null
        ? 'DM ありがとうございます。\n申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : `DM にお答えします!\n\n${result}`;
      
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
      if(!response.ok) throw new Error('Server Error');
      const json = await response.json();
      if(!json.ok) throw new Error(json.error);
      
      this.sendLogToSlack('Slack DM 返信', originalText, responseText);
      this.logger.log('#replyToDirectMessage() : 返信成功', `【Q】${originalText}`, `【A】${responseText}`);
    }
    catch(error) {
      this.sendLogToSlack('Slack DM 返信 : 失敗', originalText, error.toString());
      this.logger.warn('#replyToDirectMessage() : 返信失敗', `【Q】${originalText}`, error);
    }
  }
  
  /** `/zc` スラッシュコマンドが呼び出された時の処理 */
  public async zcCommand(originalText: string, responseUrl: string): Promise<void> {
    try {
      const messages: Array<Message> = [
        { role: 'user'     , content: 'あなたはザリガニ猫を飼っています。これから質問をしますので、ユーモアを交えてザリガニ猫の状況について答えてください。' },
        { role: 'assistant', content: 'もちろんです！では、どんな質問でも受け付けますよ。ザリガニ猫の飼い主の立場から楽しくお答えします。' },
        { role: 'user'     , content: originalText }
      ];
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const responseText = result == null
        ? '「/zc」コマンドを受信しました。\n申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : `「/zc」コマンドにお答えします!\n\n${result}`;
      
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
      if(!response.ok) throw new Error('Server Error');
      const text = await response.text();
      
      this.sendLogToSlack('Slack /zc コマンド返信', originalText, responseText);
      this.logger.log('#zcCommand() : 返信成功', `【Q】${originalText}`, `【A】${responseText}`, text);
    }
    catch(error) {
      this.sendLogToSlack('Slack /zc コマンド返信 : 失敗', originalText, error.toString());
      this.logger.warn('#zcCommand() : 返信失敗', `【Q】${originalText}`, error);
    }
  }
  
  /**
   * Slack からのリクエストか否か検証する
   * 
   * - 参考 : https://github.com/slackapi/bolt-js/blob/main/src/receivers/verify-request.ts
   * - 参考 : https://gist.github.com/Alasano/c66f6e5c03518306ba94cf2ea4617bfc
   * - 参考 : https://dev.to/soumyadey/verifying-requests-from-slack-the-correct-method-for-nodejs-417i
   */
  public verifyRequest(xSlackSignature: string, xSlackRequestTimeStamp: string, rawBody: string): boolean {
    const xSlackRequestTimeStampNumber = Number(xSlackRequestTimeStamp);
    if(Number.isNaN(xSlackRequestTimeStampNumber)) {
      this.logger.error('Header x-slack-request-timestamp Did Not Have The Expected Type', xSlackRequestTimeStamp);
      return false;
    }
    
    const nowMs = Date.now();
    const requestTimestampMaxDeltaMinutes = 5;
    const fiveMinutesAgoSec = Math.floor(nowMs / 1000) - 60 * requestTimestampMaxDeltaMinutes;
    // 古いリクエストを弾く
    if (xSlackRequestTimeStampNumber < fiveMinutesAgoSec) {
      this.logger.error(`Header x-slack-request-timestamp Must Differ From System Time By No More Than ${requestTimestampMaxDeltaMinutes} Minutes Or Request Is Stale`);
      return false;
    }
    
    // シグネチャを確認する
    const [signatureVersion, signatureHash] = xSlackSignature.split('=');
    if(signatureVersion !== 'v0') {
      this.logger.error('Unknown Signature Version', signatureVersion, xSlackSignature);
      return false;
    }
    const hmac = createHmac('sha256', this.slackSigningSecret);
    hmac.update(`${signatureVersion}:${xSlackRequestTimeStampNumber}:${rawBody}`);
    const ourSignatureHash = hmac.digest('hex');
    if(!signatureHash || !tsscmp(signatureHash, ourSignatureHash)) {
      this.logger.error('Signature Mismatch', signatureHash, ourSignatureHash);
      return false;
    }
    
    // 認証成功
    return true;
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
