import { Module } from '@nestjs/common';

import { SlackController } from './slack.controller';
import { SlackService } from './slack.service';

/** Slack Module */
@Module({
  controllers: [
    SlackController
  ],
  providers: [
    SlackService
  ]
})
export class SlackModule { }
