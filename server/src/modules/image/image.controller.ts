import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { Response } from 'express';

import { ImageService } from './image.service';

/** Images Controller */
@Controller('api/image')
export class ImageController {
  constructor(
    private readonly imageService: ImageService
  ) { }
  
  @Get('get-file-names')
  public async listFileNames(@Res() response: Response): Promise<Response> {
    try {
      const fileNames = await this.imageService.listFileNames();
      return response.status(HttpStatus.OK).json({ results: fileNames });
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
    }
  }
}
