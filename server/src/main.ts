import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';

import { cyan, yellow } from './core/utils/colour-logger';
import { listRoutes } from './core/utils/list-routes';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // JSON を解釈できるようにする・Slack 用の rawBody を追加する https://dev.to/soumyadey/verifying-requests-from-slack-the-correct-method-for-nodejs-417i
  app.use(express.json({
    verify: (req: any, _, buf) => {
      req.rawBody = buf;
    }
  }));
  app.use(express.urlencoded({
    extended: true,
    verify: (req: any, _, buf) => {
      req.rawBody = buf;
    }
  }));
  // CORS を有効にする
  app.enableCors({
    origin: (/localhost/u),  // `localhost` を全て許可するため正規表現を使う
    methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Access-Control-Allow-Headers, Access-Control-Allow-Credentials',
    credentials: true  // `Access-Control-Allow-Credentials` を許可する
  });
  // サーバを起動する
  const port = app.get<ConfigService>(ConfigService).get<number>('port')!;
  await app.listen(port);
  
  const logger = new Logger(bootstrap.name);
  logger.log(cyan(`Server started at port [`) + yellow(`${port}`) + cyan(']'));
  
  // ルーティング一覧を出力する
  logger.log(listRoutes(app.getHttpServer()._events.request._router));
}
void bootstrap();
