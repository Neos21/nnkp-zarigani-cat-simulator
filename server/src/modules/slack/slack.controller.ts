import { Controller, Logger, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

import { SlackService } from './slack.service';

/** Slack Controller */
@Controller('slack')
export class SlackController {
  private readonly logger: Logger = new Logger(SlackController.name);
  
  constructor(
    private readonly slackService: SlackService
  ) { }
  
  /** Event Subscriptions 用エンドポイント */
  @Post('events')
  public events(@Req() request: Request, @Res() response: Response): void {
    // Event Subscriptions のリクエスト URL を検証するための応答 https://api.slack.com/events/url_verification
    if(request.body?.type === 'url_verification') {
      response.type('application/json').send({ challange: request.body.challenge });
      return this.logger.log('#events() : リクエスト URL 検証');
    }
    
    // とりあえずレスポンスしてしまう
    response.end();
    
    // Bot の投稿は処理しない
    if(request.body?.event?.bot_id != null) {
      return this.logger.log(`#events() : Bot の投稿のため無視 … Bot ID : [${request.body.event.bot_id}]`);
    }
    
    // Slack からのリクエストか否か認証する・失敗した場合は返信しない
    const xSlackSignature        = String(request.headers['x-slack-signature']);
    const xSlackRequestTimeStamp = String(request.headers['x-slack-request-timestamp']);
    const rawBody                = (request as any).rawBody;
    if(!this.slackService.verifyRequest(xSlackSignature, xSlackRequestTimeStamp, rawBody)) {
      return this.logger.warn('#events() : リクエスト不正・反応しない', request.headers);
    }
    
    // メンション・DM への反応
    if(['app_mention', 'message'].includes(request.body?.event?.type)) {
      const type = request.body.event.type === 'app_mention' ? 'メンション' : 'DM';
      this.slackService.reply(type, request.body.event.channel, request.body.event.text);  // Promise
      return this.logger.log('#events() : メンション or DM への反応');
    }
    
    // その他イベント
    this.logger.log('#events() : その他イベントのため無視', request.headers);
  }
  
  /** `/zc` スラッシュコマンド用エンドポイント */
  @Post('zc')
  public slashCommandZc(@Req() request: Request, @Res() response: Response): void {
    response.end();  // とりあえずレスポンスする・リプライは非同期に行う
    
    // Slack からのリクエストか否か認証する・失敗した場合は返信しない
    const xSlackSignature        = String(request.headers['x-slack-signature']);
    const xSlackRequestTimeStamp = String(request.headers['x-slack-request-timestamp']);
    const rawBody                = (request as any).rawBody;
    if(!this.slackService.verifyRequest(xSlackSignature, xSlackRequestTimeStamp, rawBody)) {
      return this.logger.warn('#slackCommandZc() : リクエスト不正・反応しない', request.headers);
    }
    
    if(request.body?.text != null && request.body?.response_url != null) {
      this.slackService.zcCommand(request.body.text, request.body.response_url);  // Promise
      return this.logger.log('#slackCommandZc() : `/zc` スラッシュコマンドへの反応');
    }
    
    this.logger.log('#slackCommandZc() : 必要なパラメータがないため反応しない', request.body);
  }
}
