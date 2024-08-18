import { Injectable } from '@nestjs/common';

/** App Service */
@Injectable()
export class AppService {
  /** AppController からの注入確認用メソッド */
  public getHello(): string {
    return 'なな子プロジェクト ザリガニねこシミュレーター';
  }
}
