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
    
    // メンションへの反応
    if(request.body?.event?.type === 'app_mention') {
      this.slackService.replyToMention(request.body.event.channel, request.body.event.text);  // Promise
      return this.logger.log('#events() : メンションへの反応');
    }
    // DM への反応
    if(request.body?.event?.type === 'message') {
      this.slackService.replyToDirectMessage(request.body.event.channel, request.body.event.text);  // Promise
      return this.logger.log('#events() : DM への反応');
    }
    // その他イベント
    this.logger.log('#events() : その他イベントのため無視');
  }
  
  /** `/zc` スラッシュコマンド用エンドポイント */
  @Post('zc')
  public slashCommandZc(@Req() request: Request, @Res() response: Response): void {
    this.logger.log('#slackCommandZc() : Request Headers', request.headers);  // TODO : トークン検証が必要
    response.end();  // とりあえずレスポンスする・リプライは非同期に行う
    this.slackService.zcCommand(request.body?.text, request.body?.response_url);  // Promise
    this.logger.log('#slackCommandZc() : `/zc` スラッシュコマンドへの反応');
  }
}
