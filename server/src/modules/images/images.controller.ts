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
    try {
      this.imagesService.validateCredential(credential);
    }
    catch(error) {
      return response.status(HttpStatus.BAD_REQUEST).json({ error: error.toString() });
    }
    
    try {
      const fileNames = await this.imagesService.listFiles();
      return response.status(HttpStatus.OK).json({ results: fileNames });
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
    }
  }
  
  @Get(':id')
  public async getFile(@Param('id') id: string, @Query('credential') credential: string, @Res() response: Response): Promise<Response> {
    try {
      this.imagesService.validateCredential(credential);
    }
    catch(error) {
      return response.status(HttpStatus.BAD_REQUEST).json({ error: error.toString() });
    }
    
    try {
      const image = await this.imagesService.getFile(Number(id));  // `@Param()` は必ず `string` なので型変換して渡す
      if(image == null) return response.status(HttpStatus.BAD_REQUEST).json({ error: '指定 ID の画像情報は存在しませんでした' });
      return response.status(HttpStatus.OK).json({ result: image });
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
    }
  }
  
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  public async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('credential') credential: string, @Body('tags') tags: Array<string>, @Res() response: Response): Promise<Response> {
    try {
      this.imagesService.validateCredential(credential);
      this.imagesService.validateTags(tags);
      this.imagesService.validateFileType(file.mimetype)
      this.imagesService.validateFileSize(file.size)
    }
    catch(error) {
      return response.status(HttpStatus.BAD_REQUEST).json({ error: error.toString() });
    }
    
    try {
      const fileName = this.imagesService.createFileName(file.mimetype);
      await this.imagesService.saveFile(file, fileName);  // ファイルを保存する
      await this.imagesService.insertDb(fileName, tags);  // DB に登録する
      return response.status(HttpStatus.CREATED).end();
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
    }
  }
  
  @Patch(':id')
  public async patchTags(@Param('id') id: string, @Body('credential') credential: string, @Body('tags') tags: Array<string>, @Res() response: Response): Promise<Response> {
    try {
      this.imagesService.validateCredential(credential);
    }
    catch(error) {
      return response.status(HttpStatus.BAD_REQUEST).json({ error: error.toString() });
    }
    
    try {
      await this.imagesService.updateDb(Number(id), tags);  // DB のタグ情報を更新する
      return response.status(HttpStatus.OK).end();  // 特に何も返さない
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
    }
  }
  
  @Delete(':id')
  public async deleteFile(@Query('credential') credential: string, @Param('id') id: string, @Res() response: Response): Promise<Response> {
    try {
      this.imagesService.validateCredential(credential);
    }
    catch(error) {
      return response.status(HttpStatus.BAD_REQUEST).json({ error: error.toString() });
    }
    
    try {
      const fileNameToRemove = await this.imagesService.deleteDb(Number(id));  // DB からレコードを削除し、削除するファイル名を返してもらう
      await this.imagesService.removeFile(fileNameToRemove);  // ファイルを削除する
      return response.status(HttpStatus.NO_CONTENT).end();  // 特に何も返さない
    }
    catch(error) {
      return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
    }
  }
}
