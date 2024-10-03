import { Module } from '@nestjs/common';

import { ChatMessageService } from './chat-message.service';
import { JstService } from './jst.service';
import { SlackLoggerService } from './slack-logger.service';

/** Shared Module */
@Module({
  providers: [
    ChatMessageService,
    JstService,
    SlackLoggerService
  ],
  exports: [
    ChatMessageService,
    JstService,
    SlackLoggerService
  ]
})
export class SharedModule { }
