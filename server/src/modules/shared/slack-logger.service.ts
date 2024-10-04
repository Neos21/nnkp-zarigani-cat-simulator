import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Slack Logger Service */
@Injectable()
export class SlackLoggerService {
  private readonly logger: Logger = new Logger(SlackLoggerService.name);
  private readonly slackWebhookUrl: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.slackWebhookUrl = this.configService.get('slackWebhookUrl');
  }
  
  /**
   * 動作ログを Slack に送信する
   * 
   * @param title タイトル (Slack 通知の1行目に記載する)
   * @param inputText 入力文字列 (Slack 通知の2行目、「【Q】」の後に記載する)
   * @param outputText 出力文字列 (Slack 通知の3行目、「【A】」の後に記載する)
   */
  public async notify(title: string, inputText: string, outputText: string): Promise<void> {
    this.logger.log('#notify() :', { title, inputText, outputText });
    if(this.slackWebhookUrl == null || this.slackWebhookUrl === '') {
      return this.logger.warn('#notify() : Slack Webhook URL が未指定のためログ送信なし');
    }
    
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `【${jst}】${title}\n【Q】${inputText}\n【A】${outputText}`
        })
      });
      if(!response.ok) throw new Error('Response NG');
      this.logger.log('#notify() : ログ送信成功');
    }
    catch(error) {
      this.logger.warn('#notify() : ログ送信失敗', error);
    }
  }
}
