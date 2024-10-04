import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Low } from '../../low-db/core-low';
import { JSONFilePreset } from '../../low-db/presets';
import { ImageDbData } from '../../types/image';

/** JSON DB Service */
@Injectable()
export class JsonDbService {
  private readonly imagesDbFilePath: string;
  
  constructor(
    private readonly configService: ConfigService
  ) {
    this.imagesDbFilePath = this.configService.get('imagesDbFilePath');
  }
  
  public async readDb(): Promise<Low<ImageDbData>> {
    return await JSONFilePreset<ImageDbData>(this.imagesDbFilePath, []);
  }
}
