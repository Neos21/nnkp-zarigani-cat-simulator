import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import fetch from 'node-fetch';
import { createHmac } from 'crypto';
import tsscmp from 'tsscmp';

import { ChatMessageService } from '../shared/chat-message.service';
import { SlackLoggerService } from '../shared/slack-logger.service';
import { nexraAryahcrCc } from '../../providers/nexra-aryahcr-cc';

/** Slack Service */
@Injectable()
export class SlackService {
  private readonly logger: Logger = new Logger(SlackService.name);
  
  private readonly slackBotToken: string;
  private readonly slackSigningSecret: string;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly chatMessageService: ChatMessageService,
    private readonly slackLoggerService: SlackLoggerService
  ) {
    this.slackBotToken      = this.configService.get('slackBotToken');
    this.slackSigningSecret = this.configService.get('slackSigningSecret');
  }
  
  /** メンション or DM への返信処理 */
  public async reply(type: 'メンション' | 'DM', channelId: string, inputText: string): Promise<void> {
    try {
      const messages = this.chatMessageService.createMessage(inputText);
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const outputText = result == null
        ? '申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : result.trim();
      
      const response = await fetch('https://slack.com/api/chat.postMessage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization : `Bearer ${this.slackBotToken}`
        },
        body: JSON.stringify({
          channel: channelId,
          text   : outputText
        })
      });
      if(!response.ok) throw new Error('Slack API サーバのエラー');
      const json = await response.json();
      if(!json.ok) throw new Error(json.error);
      
      this.slackLoggerService.notify(`Slack ${type} 返信`, inputText, outputText);
    }
    catch(error) {
      this.slackLoggerService.notify(`Slack ${type} 返信 : 失敗`, inputText, error.toString());
    }
  }
  
  /** `/zc` スラッシュコマンドが呼び出された時の処理 */
  public async zcCommand(inputText: string, responseUrl: string): Promise<void> {
    try {
      const messages = this.chatMessageService.createMessage(inputText);
      const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
      const outputText = result == null
        ? '申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
        : result.trim();
      
      const response = await fetch(responseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          response_type: 'in_channel',  // 「あなただけに表示」ではなくチャンネルに公開表示する
          text         : outputText
        })
      });
      if(!response.ok) throw new Error('Slack API サーバのエラー');
      
      this.slackLoggerService.notify('Slack /zc コマンド返信', inputText, outputText);
    }
    catch(error) {
      this.slackLoggerService.notify('Slack /zc コマンド返信 : 失敗', inputText, error.toString());
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
      this.logger.error(`Header x-slack-request-timestamp Did Not Have The Expected Type : [${xSlackRequestTimeStamp}]`);
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
      this.logger.error(`Unknown Signature Version : Signature [${signatureVersion}] x-slack-signature [${xSlackSignature}]`);
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
}
