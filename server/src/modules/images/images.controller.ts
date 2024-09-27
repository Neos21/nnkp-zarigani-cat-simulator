import { Body, Controller, Delete, Get, HttpStatus, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';

import { ImagesService } from './images.service';

/** Images Controller */
@Controller('api/images')
export class ImagesController {
  constructor(
    private readonly imagesService: ImagesService
  ) { }
  
  @Get('')
  public async listFileNames(@Res() response: Response): Promise<Response> {
    const fileNames = await this.imagesService.listFileNames();
    return response.status(HttpStatus.OK).json(fileNames);
  }
  
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('credential') credential: string,
    @Body('file_name') fileName: string,
    @Res() response: Response
  ): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    const isAllowedFileType = this.imagesService.validateFileType(file.mimetype);
    if(!isAllowedFileType) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid File Type' });
    
    const isValidFileSize = this.imagesService.validateFileSize(file.size);
    if(!isValidFileSize) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The File Size Exceeds Or 0 Bytes' });
    
    const isValidFileName = this.imagesService.validateFileName(fileName);
    if(!isValidFileName) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid File Name' });
    
    const exists = await this.imagesService.existsFile(fileName);  // `file.originalname` でオリジナルのファイル名を拾っても良さそう
    if(exists) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The File Name Already Exists' });
    
    const isSucceeded = await this.imagesService.saveFile(file, fileName);  // ファイル保存
    if(!isSucceeded) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Upload File' });
    
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
