import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

/** Slack Module */
@Module({
  imports: [
    SharedModule
  ],
  controllers: [
    SlackController
  ],
  providers: [
    SlackService
  ]
})
export class SlackModule { }
