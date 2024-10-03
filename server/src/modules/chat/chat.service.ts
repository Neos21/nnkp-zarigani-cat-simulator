import { Injectable } from '@nestjs/common';

import { ChatMessageService } from '../shared/chat-message.service';
import { SlackLoggerService } from '../shared/slack-logger.service';
import { nexraAryahcrCc } from '../../providers/nexra-aryahcr-cc';

/** Chat Service */
@Injectable()
export class ChatService {
  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly slackLoggerService: SlackLoggerService
  ) { }
  
  /** AI Chat 処理 */
  public async chat(inputText: string): Promise<string> {
    const messages = this.chatMessageService.createMessage(inputText);
    const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
    const responseText = result == null
      ? '申し訳ありませんが、ザリガニねこの様子が分かりませんでした。'
      : result.trim();
    
    this.slackLoggerService.notify('Web', inputText, responseText);
    return responseText;
  }
}
