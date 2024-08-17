import { Module } from '@nestjs/common';

import { SlackController } from './slack.controller';

/** Slack Module */
@Module({
  controllers: [
    SlackController
  ]
})
export class SlackModule { }
