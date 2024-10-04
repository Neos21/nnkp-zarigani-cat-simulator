import { Injectable, Logger } from '@nestjs/common';

import { ChatMessageService } from '../shared/chat-message.service';
import { JsonDbService } from '../shared/json-db.service';
import { SlackLoggerService } from '../shared/slack-logger.service';
import { nexraAryahcrCc } from '../../providers/nexra-aryahcr-cc';
import { ImageDbItem } from '../../types/image';

/** Chat Service */
@Injectable()
export class ChatService {
  private readonly logger: Logger = new Logger(ChatService.name);
  
  /** DB データのキャッシュ (リクエストの度に JSON DB を読み込むのは避ける) */
  private dbCache: Array<ImageDbItem> | null = null;
  /** 最後に DB をキャッシュした UTC ミリ秒 */
  private lastCached: number | null = null;
  
  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly jsonDbService: JsonDbService,
    private readonly slackLoggerService: SlackLoggerService
  ) { }
  
  /** AI Chat 処理 */
  public async chat(inputText: string): Promise<{ outputText: string, imageFileName: string }> {
    const messages = this.chatMessageService.createMessageWithEmotionParameter(inputText);
    const result = await nexraAryahcrCc(messages, 'gpt3.5-turbo').catch(() => null);
    
    // AI の応答が上手くいかなかった場合 : ランダムに1枚の画像を指定する
    if(result == null) {
      const outputText = '申し訳ありませんが、ザリガニねこの様子が分かりませんでした。';
      this.slackLoggerService.notify('Web', inputText, outputText);
      const imageFileName = await this.getRandomOneImageFileName();
      return { outputText, imageFileName };
    }
    
    const rawOutputText = result.trim().replace((/\n{2,}/g), '\n');  // 空行を削除する
    this.slackLoggerService.notify('Web', inputText, rawOutputText);  // とりあえずログ出ししちゃう
    
    // 感情パラメーターを抽出する
    const { emotion, outputText } = this.extractEmotion(rawOutputText);
    
    // 感情パラメーターが抽出できなかった場合 : ランダムに1枚の画像を指定する
    if(emotion == null) {
      const imageFileName = await this.getRandomOneImageFileName();
      return { outputText, imageFileName };
    }
    
    // 感情パラメーターを基に画像を検索し1つ取得する
    const imageFileName = await this.searchImageFileNameByEmotion(emotion);
    return { outputText, imageFileName };
  }
  
  /** DB を読み込み、適宜キャッシュする */
  private async loadDbData(isForce: boolean = false): Promise<Array<ImageDbItem>> {
    /** DB を読み込みキャッシュする関数 */
    const reloadDb = async () => {
      const db = await this.jsonDbService.readDb();
      this.dbCache = db.data;
      this.lastCached = Date.now();
    };
    
    if(isForce) {
      this.logger.log('#loadDb() : DB 強制再読込');
      await reloadDb();
    }
    else if(this.dbCache == null) {
      this.logger.log('#loadDb() : 初回 DB 読込');
      await reloadDb();
    }
    else if(this.lastCached + (60 /* min */ * 60 /* sec */ * 1000 /* ms */) < Date.now()) {
      this.logger.log('#loadDb() : 最後の DB キャッシュから1時間以上経ったので再読込');
      await reloadDb();
    }
    
    // 必ずキャッシュしたデータを返す
    return this.dbCache;
  }
  
  /** 配列からランダムに1つ要素を取得する */
  private getRandomOneFromArray(array: Array<any>): any {
    return array[Math.floor(Math.random() * array.length)];
  }
  
  /** ランダムに1つ画像ファイル名を返す */
  private async getRandomOneImageFileName(): Promise<string> {
    const dbData = await this.loadDbData();
    const imageFileNames = dbData.map(item => item.file_name);
    return this.getRandomOneFromArray(imageFileNames);
  }
  
  /** 感情パラメーターを抽出し本文から切り取る */
  private extractEmotion(rawOutputText: string): { emotion: string | null, outputText: string } {
    const lines = rawOutputText.split('\n');
    const maybeEmotionKanji = lines[0];  // 多分漢字1文字が入っているはず
    if(['喜', '怒', '哀', '楽'].some(emotionKanji => maybeEmotionKanji.startsWith(emotionKanji))) {  // 1行目が喜怒哀楽のいずれかの漢字で始まっていれば感情パラメーターの抽出に成功したものとする
      this.logger.log('#extractEmotion() : 感情パラメーターの (漢字1文字) の抽出に成功', maybeEmotionKanji);
      const outputText = this.extractTextFromLineTwo(lines);  // 2行目以降を本文として抽出する
      return { emotion: maybeEmotionKanji, outputText };
    }
    else if(maybeEmotionKanji.length === 1) {  // 未知の1文字だった場合は感情パラメーターなしとして扱う
      this.logger.log('#extractEmotion() : 感情パラメーターが不明な1文字', maybeEmotionKanji);
      const outputText = this.extractTextFromLineTwo(lines);  // 2行目以降を本文として抽出する
      return { emotion: null, outputText };
    }
    else {  // 1行目に1文字以上入っている場合は諦めて1行目から全部繋げて返す
      this.logger.log('#extractEmotion() : 感情パラメーターが文章', maybeEmotionKanji);
      return { emotion: null, outputText: lines.join('') };
    }
  }
  
  /** 感情パラメーターの行を取り除いた本文を取得する */
  private extractTextFromLineTwo(lines: Array<string>): string {
    if(lines[1] != null) {  // 2行目が存在したら2行目以降を返す
      const newLines = [...lines];  // 配列を複製する
      newLines.shift();  // 1行目を削除する
      return newLines.join('');  // 改行は削除して結合する
    }
    else {
      return lines.join('');  // 2行目が存在しない場合はそのまま返す
    }
  }
  
  /** 感情パラメーター (喜怒哀楽の漢字1文字) を条件に画像を1枚取得する */
  private async searchImageFileNameByEmotion(emotion: string): Promise<string> {
    const dbData = await this.loadDbData();
    const imageFileNames = dbData
      .filter(item => item.tags.includes(emotion))  // 感情パラメーターの漢字1文字と合致したタグがあるモノを選択する
      .map(item => item.file_name);
    
    // タグに合致する画像が一つもなければ、全体からランダムに1つ画像ファイル名を返す
    if(imageFileNames.length === 0) return await this.getRandomOneImageFileName();
    
    const imageFileName = this.getRandomOneFromArray(imageFileNames);
    this.logger.log(`#searchImageFileNameByEmotion() : 感情パラメーターを基に画像を1つ選択 (検索結果 ${imageFileNames.length} 件`, imageFileName);
    return imageFileName;
  }
}
