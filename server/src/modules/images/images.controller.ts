import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
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
  public async listFiles(@Query('credential') credential: string, @Res() response: Response): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    const fileNames = await this.imagesService.listFiles();
    return response.status(HttpStatus.OK).json({ results: fileNames });
  }
  
  @Get(':id')
  public async getFile(@Param('id') id: string, @Query('credential') credential: string, @Res() response: Response): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    const image = await this.imagesService.getFile(Number(id));  // `@Param()` は必ず `string` なので型変換して渡す
    if(image == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'The Image Of The ID Does Not Exist' });
    
    return response.status(HttpStatus.OK).json({ result: image });
  }
  
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('credential') credential: string, @Body('tags') tags: Array<string>, @Res() response: Response): Promise<Response> {
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
  
  @Patch(':id')
  public async patchTags(@Param('id') id: string, @Body('credential') credential: string, @Body('tags') tags: Array<string>, @Res() response: Response): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    // DB のタグ情報を更新する
    const isUpdatedDb = await this.imagesService.updateDb(Number(id), tags);
    if(!isUpdatedDb) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Update DB' });
    
    return response.status(HttpStatus.OK).end();
  }
  
  @Delete(':id')
  public async deleteFile(@Query('credential') credential: string, @Param('id') id: string, @Res() response: Response): Promise<Response> {
    const isValidCredential = this.imagesService.validateCredential(credential);
    if(!isValidCredential) return response.status(HttpStatus.BAD_REQUEST).json({ error: 'Invalid Credential '});
    
    // DB からレコードを削除し、削除したファイル名を返してもらう
    const removedFileName = await this.imagesService.deleteDb(Number(id));
    if(removedFileName == null) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Delete DB' });
    
    // ファイルを削除する
    const isRemovedFile = await this.imagesService.removeFile(removedFileName);
    if(!isRemovedFile) return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Failed To Remove File' });
    
    return response.status(HttpStatus.OK).end();
  }
}
