import { Injectable } from '@nestjs/common';

/** JST Service */
@Injectable()
export class JstService {
  /**
   * 日本時間の現在時刻を返す
   * 
   * @return 日本時間の現在時刻
   */
  public getJstNow(): Date {
    return new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
  }
}
