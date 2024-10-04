import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { JsonDbService } from '../shared/json-db.service';
import { JstService } from '../shared/jst.service';
import type { ImageDbItem } from '../../types/image';

/** Images Service */
@Injectable()
export class ImagesService {
  /** アップロードできるファイルサイズの最大容量は 5MB までとする */
  private readonly maxFileSizeByte: number = 5_000_000;
  /** 許容する MIME Type */
  private readonly allowMimeTypes: Array<string> = ['image/jpeg', 'image/gif', 'image/png'];
  
  private readonly logger: Logger = new Logger(ImagesService.name);
  private readonly credential: string;
  private readonly imagesDirectoryPath: string;
  
  constructor(
    private readonly configService: ConfigService,
    private readonly jsonDbService: JsonDbService,
    private readonly jstService: JstService
  ) {
    this.credential          = this.configService.get('credential');
    this.imagesDirectoryPath = this.configService.get('imagesDirectoryPath');
  }
  
  public validateCredential(inputCredential: string): void {
    if(inputCredential !== this.credential) throw new Error('Credential が正しくありません');
  }
  
  public async listFiles(): Promise<Array<ImageDbItem>> {
    const db = await this.jsonDbService.readDb();
    return db.data;
  }
  
  public async getFile(id: number): Promise<ImageDbItem | null> {
    const db = await this.jsonDbService.readDb();
    const image = db.data.find(item => item.id === id);
    return image ?? null;
  }
  
  public validateTags(tags: Array<string>): void {
    if(tags == null || tags.length === 0) throw new Error('タグ情報が一つもありません');
    if(tags.some(tag => tag == null || tag.trim() === '')) throw new Error('未入力のタグ情報があります');
  }
  
  public validateFileType(mimeType: string): void {
    if(!this.allowMimeTypes.includes(mimeType)) throw new Error('許容されていない MIME Type です');
  }
  
  public validateFileSize(fileSizeByte: number): void {
    if(fileSizeByte == null || fileSizeByte === 0) throw new Error('ファイルサイズが 0 バイトです');
    if(fileSizeByte > this.maxFileSizeByte) throw new Error('ファイルサイズが許容量を超えています');
  }
  
  /** `YYYY-MM-DD-HH-mm-SS.extension` なファイル名を組み立てる */
  public createFileName(mimeType: string): string {
    const fileExtension = mimeType === 'image/jpeg' ? 'jpg'
                        : mimeType === 'image/gif'  ? 'gif'
                        : mimeType === 'image/png'  ? 'png'
                        : 'unknown';
    const jstNow = this.jstService.getJstNow();
    const fileName = jstNow.getFullYear()
              + '-' + ('0' + (jstNow.getMonth() + 1)).slice(-2)
              + '-' + ('0' + jstNow.getDate()).slice(-2)
              + '-' + ('0' + jstNow.getHours()).slice(-2)
              + '-' + ('0' + jstNow.getMinutes()).slice(-2)
              + '-' + ('0' + jstNow.getSeconds()).slice(-2)
              + '.' + fileExtension;
    return fileName;
  }
  
  /** `wx` フラグにより書き込みモードで開き、万が一同名ファイルが存在する場合はエラーとする */
  public async saveFile(file: Express.Multer.File, fileName: string): Promise<void> {
    try {
      await fs.writeFile(path.resolve(this.imagesDirectoryPath, fileName), file.buffer, { flag: 'wx' });
    }
    catch(error) {
      this.logger.error('#saveFile() : ファイルの保存に失敗しました', error);
      throw new Error('ファイルの保存に失敗しました');
    }
  }
  
  public async insertDb(fileName: string, tags: Array<string>): Promise<void> {
    try {
      const db = await this.jsonDbService.readDb();
      const currentMaxId = db.data.length ? Math.max(...db.data.map(item => item.id)) : 0;
      const newId = currentMaxId + 1;
      const item: ImageDbItem = {
        id       : newId,
        file_name: fileName,
        tags     : tags
      };
      db.data.push(item);
      await db.write();
    }
    catch(error) {
      this.logger.error('#insertDb() : DB へのレコード登録に失敗しました', error);
      throw new Error('DB へのレコード登録に失敗しました');
    }
  }
  
  public async updateDb(id: number, tags: Array<string>): Promise<void> {
    try {
      const db = await this.jsonDbService.readDb();
      const targetIndex = db.data.findIndex(item => item.id === id);
      if(targetIndex < 0) throw new Error('指定 ID のレコードは存在しませんでした');
      db.data[targetIndex].tags = tags;  // タグ情報を差し替える
      await db.write();
    }
    catch(error) {
      this.logger.error('#updateDb() : DB のレコード更新に失敗しました', error);
      throw new Error('DB のレコード更新に失敗しました');
    }
  }
  
  public async deleteDb(id: number): Promise<string> {
    try {
      const db = await this.jsonDbService.readDb();
      const targetIndex = db.data.findIndex(item => item.id === id);
      if(targetIndex < 0) throw new Error('指定 ID のレコードは存在しませんでした');
      const fileName = db.data[targetIndex].file_name;
      if(fileName == null || fileName.trim() === '') throw new Error('ファイル名が DB レコードにありません');
      db.data.splice(targetIndex, 1);
      await db.write();
      return fileName;
    }
    catch(error) {
      this.logger.error('#deleteDb() : DB のレコード削除に失敗しました', error);
      throw new Error('DB のレコード削除に失敗しました');
    }
  }
  
  public async removeFile(fileName: string): Promise<boolean> {
    return await fs.unlink(path.resolve(this.imagesDirectoryPath, fileName)).then(_result => true).catch(_error => false);
  }
}
