import { Controller, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('slack')
export class SlackController {
  /** Event Subscriptions 用エンドポイント */
  @Post('events')
  public events(@Req() request: Request, @Res() response: Response): Response | void {
    // Event Subscriptions のリクエスト URL を検証するための応答 https://api.slack.com/events/url_verification
    if(request.body?.type === 'url_verification') {
      return response.type('application/json').send({ challange: request.body.challenge });
    }
    
    console.log('TODO : Event Subscriptions 要実装');
    response.end();
  }
}
