import { Body, Controller, Delete, HttpStatus, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { ImagesService } from './images.service';

/** Images Controller */
@Controller('api/images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService
  ) { }
  
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('credential') credential: string,
    @Body('tags') tags: Array<string>,
    @Res() response: Response
  ): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    const isValidTags = this.imagesService.validateTags(tags);
    if(!isValidTags) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Tags' });
    
    const isAllowedFileType = this.imagesService.validateFileType(file.mimetype);
    if(!isAllowedFileType) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid File Type' });
    
    const isValidFileSize = this.imagesService.validateFileSize(file.size);
    if(!isValidFileSize) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The File Size Exceeds Or 0 Bytes' });
    
    // ファイル名を生成する
    const fileName = this.imagesService.createFileName(file.mimetype);
    
    // ファイルを保存する
    const isSavedFile = await this.imagesService.saveFile(file, fileName);
    if(!isSavedFile) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Save File' });
    
    // DB に登録する
    const isInsertedDb = await this.imagesService.insertDb(fileName, tags);
    if(!isInsertedDb) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Insert DB' });
    
    return response.status(HttpStatus.CREATED).end();
  }
  
  @Delete('')
  public async deleteFile(
    @Body('credential') credential: string,
    @Body('file_name') fileName: string,
    @Res() response: Response
  ): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    const exists = await this.imagesService.existsFile(fileName);
    if(!exists) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The File Name Does Not Exist' });
    
    const isSucceeded = await this.imagesService.removeFile(fileName);
    if(!isSucceeded) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Delete File' });
    
    return response.status(HttpStatus.OK).end();
  }
}
