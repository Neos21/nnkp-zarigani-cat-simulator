import { Body, Controller, HttpStatus, Post, Res } from '@nestjs/common';
import { Response } from 'express';

import { ChatService } from './chat.service';

/** Chat Controller */
@Controller('api')
export class ChatController {
  constructor(
    private readonly chatService: ChatService
  ) { }
  
  @Post('chat')
  public async chat(@Body('input_text') inputText: string, @Res() response: Response): Promise<void> {
    const result = await this.chatService.chat(inputText);
    response.status(HttpStatus.OK).json({
      output_text    : result.outputText,
      image_file_name: result.imageFileName
    });
  }
}
