import { Module } from '@nestjs/common';

import { ImageController } from './image.controller';
import { ImageService } from './image.service';

/** Image Module */
@Module({
  controllers: [
    ImageController
  ],
  providers: [
    ImageService
  ]
})
export class ImageModule { }
