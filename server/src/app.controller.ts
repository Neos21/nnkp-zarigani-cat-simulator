import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';

/** App Controller */
@Controller('api')
export class AppController {
  constructor(
    private readonly appService: AppService
  ) { }
  
  /** AppService が注入できているかの確認用エンドポイント */
  @Get('')
  public getHello(): string {
    return this.appService.getHello();
  }
}
