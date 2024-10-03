import * as fs from 'node:fs/promises';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** Image Service */
@Injectable()
export class ImageService {
  private readonly imagesDirectoryPath: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.imagesDirectoryPath = this.configService.get('imagesDirectoryPath');
  }
  
  /** ファイル名一覧を返す */
  public async listFileNames(): Promise<Array<string>> {
    const allFileNames = await fs.readdir(this.imagesDirectoryPath);  // NOTE : 指定のディレクトリ直下のファイルのみ
    return allFileNames.filter(fileName => fileName !== '.gitkeep');
  }
}
