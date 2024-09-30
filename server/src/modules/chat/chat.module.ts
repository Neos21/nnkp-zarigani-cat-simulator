import { Module } from '@nestjs/common';

import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

/** Chat Module */
@Module({
  controllers: [
    ChatController
  ],
  providers: [
    ChatService
  ]
})
export class ChatModule { }
