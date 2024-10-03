import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule , ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

// Imports
import { configuration } from './core/configs/configuration';
import { SlackModule } from './modules/slack/slack.module';
import { ImagesModule } from './modules/images/images.module';
import { ImageModule } from './modules/image/image.module';
import { ChatModule } from './modules/chat/chat.module';
// Controllers
import { AppController } from './app.controller';
// Providers
import { AppService } from './app.service';
// Configure
import { AccessLogMiddleware } from './core/middlewares/access-log.middleware';

/** App Module */
@Module({
  imports: [
    // 環境変数を注入する
    ConfigModule.forRoot({
      isGlobal: true,  // 各 Module での `imports` を不要にする
      load: [configuration]  // 環境変数を読み取り適宜デフォルト値を割り当てるオブジェクトをロードする
    }),
    // 画像ファイルを配信する : 重複するパスは先勝ちするので Vue よりも画像ファイルのパスを先に書いておく
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [{
        rootPath: configService.get<string>('imagesDirectoryPath'),
        serveRoot: '/public/images'
      }]
    }),
    // 静的ファイル (クライアント) を配信する
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => [{
        rootPath: configService.get<string>('staticDirectoryPath')
      }]
    }),
    SlackModule,
    ImagesModule,
    ImageModule,
    ChatModule
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ]
})
export class AppModule {
  /** 独自のアクセスログ出力ミドルウェアを適用する */
  public configure(middlewareConsumer: MiddlewareConsumer): void {
    middlewareConsumer.apply(AccessLogMiddleware).forRoutes('*');
  }
}
