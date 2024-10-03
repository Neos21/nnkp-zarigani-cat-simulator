import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { ImagesController } from './images.controller';
import { ImagesService } from './images.service';

/** Images Module */
@Module({
  imports: [
    SharedModule
  ],
  controllers: [
    ImagesController
  ],
  providers: [
    ImagesService
  ]
})
export class ImagesModule { }
