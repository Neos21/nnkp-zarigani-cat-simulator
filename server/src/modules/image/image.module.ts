import { Module } from '@nestjs/common';

import { SharedModule } from '../shared/shared.module';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';

/** Image Module */
@Module({
  imports: [
    SharedModule
  ],
  controllers: [
    ImageController
  ],
  providers: [
    ImageService
  ]
})
export class ImageModule { }
