import { Module } from '@nestjs/common';

import { ChatMessageService } from './chat-message.service';
import { JsonDbService } from './json-db.service';
import { JstService } from './jst.service';
import { SlackLoggerService } from './slack-logger.service';

/** Shared Module */
@Module({
  providers: [
    ChatMessageService,
    JsonDbService,
    JstService,
    SlackLoggerService
  ],
  exports: [
    ChatMessageService,
    JsonDbService,
    JstService,
    SlackLoggerService
  ]
})
export class SharedModule { }
