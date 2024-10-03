import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JSONFilePreset } from '../../low-db/presets';

/** JSON DB の1要素の型 */
type DbItem = {
  id: number,
  file_name: string,
  tags: Array<string>
};

/** JSON DB の型 */
type DbData = Array<DbItem>;

/** Images Service */
@Injectable()
export class ImagesService {
  /** アップロードできるファイルサイズの最大容量は 10MB までとする */
  private readonly maxFileSizeByte: number = 10_000_000;
  
  private readonly credential: string;
  private readonly imagesDirectoryPath: string;
  private readonly imagesDbFilePath: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.credential          = this.configService.get('credential');
    this.imagesDirectoryPath = this.configService.get('imagesDirectoryPath');
    this.imagesDbFilePath    = this.configService.get('imagesDbFilePath');
  }
  
  public async listFiles(): Promise<Array<DbItem>> {
    const db = await JSONFilePreset<DbData>(this.imagesDbFilePath, []);
    return db.data;
  }
  
  public async getFile(id: number): Promise<DbItem | null> {
    const db = await JSONFilePreset<DbData>(this.imagesDbFilePath, []);
    const image = db.data.find(item => item.id === id);
    if(image == null) return null;
    return image;
  }
  
  public validateCredential(inputCredential: string): boolean {
    return inputCredential === this.credential;
  }
  
  public validateTags(tags: Array<string>): boolean {
    if(tags == null || tags.length === 0) return false;
    if(tags.some(tag => tag == null || tag.trim() === '')) return false;
    return true;
  }
  
  public validateFileType(mimeType: string): boolean {
    const allowFileTypes = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];
    return allowFileTypes.includes(mimeType);
  }
  
  public validateFileSize(fileSizeByte: number): boolean {
    if(fileSizeByte == null || fileSizeByte === 0) return false;  // ファイルサイズが 0 バイト (空ファイル) の場合
    return fileSizeByte <= this.maxFileSizeByte;
  }
  
  /** `YYYY-MM-DD-HH-mm-SS.EXT` なファイル名を組み立てる */
  public createFileName(mimeType: string): string {
    const fileExtension = ['image/jpeg', 'image/jpg'].includes(mimeType) ? '.jpg'
      : mimeType === 'image/gif' ? '.gif'
      : mimeType === 'image/png' ? '.png'
      : '.unknown';
    const jstNow = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    const fileName = jstNow.getFullYear()
              + '-' + ('0' + (jstNow.getMonth() + 1)).slice(-2)
              + '-' + ('0' + jstNow.getDate()).slice(-2)
              + '-' + ('0' + jstNow.getHours()).slice(-2)
              + '-' + ('0' + jstNow.getMinutes()).slice(-2)
              + '-' + ('0' + jstNow.getSeconds()).slice(-2)
              + fileExtension;
    return fileName;
  }
  
  public async saveFile(file: Express.Multer.File, fileName: string): Promise<boolean> {
    // `wx` フラグにより書き込みモードで開き、万が一同名ファイルが存在する場合はエラーとする
    return await fs.writeFile(path.resolve(this.imagesDirectoryPath, fileName), file.buffer, { flag: 'wx' }).then(_result => true).catch(_error => false);
  }
  
  public async insertDb(fileName: string, tags: Array<string>): Promise<boolean> {
    try {
      const db = await JSONFilePreset<DbData>(this.imagesDbFilePath, []);
      const currentMaxId = db.data.length ? Math.max(...db.data.map(item => item.id)) : 0;
      const newId = currentMaxId + 1;
      const item = {
        id       : newId,
        file_name: fileName,
        tags     : tags
      };
      db.data.push(item);
      await db.write();
      return true;
    }
    catch(_error) {
      return false;
    }
  }
  
  public async existsFile(fileName: string): Promise<boolean> {
    return await fs.access(path.resolve(this.imagesDirectoryPath, fileName)).then(() => true).catch(_error => false);
  }
  
  public async removeFile(fileName: string): Promise<boolean> {
    return await fs.unlink(path.resolve(this.imagesDirectoryPath, fileName)).then(_result => true).catch(_error => false);
  }
}
