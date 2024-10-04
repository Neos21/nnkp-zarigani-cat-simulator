import * as fs from 'node:fs/promises';
import { Injectable } from '@nestjs/common';

import { JsonDbService } from '../shared/json-db.service';

/** Image Service */
@Injectable()
export class ImageService {
  constructor(
    private readonly jsonDbService: JsonDbService
  ) { }
  
  /** ファイル名一覧を返す */
  public async listFileNames(): Promise<Array<string>> {
    const db = await this.jsonDbService.readDb();
    return db.data.map(item => item.file_name);
  }
}
