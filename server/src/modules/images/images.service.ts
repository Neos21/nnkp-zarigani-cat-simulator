import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Images Service */
@Injectable()
export class ImagesService {
  private readonly logger: Logger = new Logger(ImagesService.name);
  private readonly credential: string;
  private readonly imagesDirectoryPath: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.credential          = this.configService.get('credential');
    this.imagesDirectoryPath = this.configService.get('imagesDirectoryPath');
    
    // 対象のディレクトリが存在しなかった場合のために作成しておく
    fs.access(this.imagesDirectoryPath)
      .catch(error => {
        this.logger.warn('#constructor() : The Images Directory Does Not Exist, Creating It', error);
        return fs.mkdir(this.imagesDirectoryPath, { recursive: true })
          .then(() => {
            this.logger.log('#constructor() : The Image Directory Created');
          });
      })
      .catch(error => {
        this.logger.error('#constructor() : Failed To Create Images Directory', error);
      });
  }
  
  public async listFileNames(): Promise<Array<string>> {
    const allFileNames = await fs.readdir(this.imagesDirectoryPath);
    return allFileNames.filter(fileName => fileName !== '.gitkeep');
  }
  
  public validateCredential(inputCredential: string): boolean {
    return inputCredential === this.credential;
  }
  
  public validateFileType(mimeType: string): boolean {
    const allowFileTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];
    return allowFileTypes.includes(mimeType);
  }
  
  public validateFileSize(fileSizeByte: number): boolean {
    if(fileSizeByte == null || fileSizeByte === 0) return false;  // ファイルサイズが 0 バイト (空ファイル) の場合
    const maxFileSizeByte = 10_000_000;  // 10MB までとする
    return fileSizeByte <= maxFileSizeByte;
  }
  
  public validateFileName(fileName: string): boolean {
    // ファイル名は英小文字・数値・ハイフンのみを許容する・1文字以上入力されていること・ハイフンは先頭もしくは末尾に入力されないこと
    return (/^[a-z0-9]+(-?[a-z0-9]+)*$/).test(path.parse(fileName).name);  // 拡張子を外して検証する
  }
  
  public async existsFile(fileName: string): Promise<boolean> {
    return await fs.access(path.resolve(this.imagesDirectoryPath, fileName)).then(() => true).catch(_error => false);
  }
  
  public async saveFile(file: Express.Multer.File, fileName: string): Promise<boolean> {
    // `wx` フラグにより書き込みモードで開き、同名ファイルが存在する場合はエラーとする
    return await fs.writeFile(path.resolve(this.imagesDirectoryPath, fileName), file.buffer, { flag: 'wx' }).then(_result => true).catch(_error => false);
  }
  
  public async removeFile(fileName: string): Promise<boolean> {
    return await fs.unlink(path.resolve(this.imagesDirectoryPath, fileName)).then(_result => true).catch(_error => false);
  }
}
