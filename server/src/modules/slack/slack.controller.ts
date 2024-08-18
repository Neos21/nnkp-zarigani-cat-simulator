import { Controller, Get, Logger, Post, Query, Req, Res } from '@nestjs/common';
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
      return this.logger.log(`#events() : Bot の投稿のため無視 (Bot ID : [${request.body.event.bot_id}]`);
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
    // TODO : トークン検証が必要
    response.end();  // とりあえずレスポンスする・リプライは非同期に行う
    this.slackService.zcCommand(request.body?.text, request.body?.response_url);  // Promise
  }
  
  /** ランディングページ */
  @Get('')
  public aboutPage(@Res() response: Response): void {
    const responseHtml = this.slackService.getAboutPageHtml();
    response.type('html').send(responseHtml);
  }
  
  /** OAuth 認証ページ */
  @Get('oauth')
  public oAuthPage(@Query('code') code: string, @Res() response: Response): void {
    // `https://slack.com/api/oauth.v2.access` への POST リクエストによる OAuth 認証が必要
    response.type('html').send(`TODO : OAuth Redirect Page : ${code}`);  // TODO : 要実装
  }
  
  /** プライバシーポリシーページ */
  @Get('privacy-policy')
  public privacyPolicyPage(@Res() response: Response): void {
    response.type('html').send('TODO : Privacy Policy Page');  // TODO : 要実装
  }
  
  /** サポートページ */
  @Get('support')
  public supportPage(@Res() response: Response): void {
    response.type('html').send('TODO : Support Page');  // TODO : 要実装
  }
  
  /** 利用規約ページ */
  @Get('tos')
  public termsOfServicePage(@Res() response: Response): void {
    response.type('html').send('TODO : Terms of Service Page');  // TODO : 要実装
  }
}
