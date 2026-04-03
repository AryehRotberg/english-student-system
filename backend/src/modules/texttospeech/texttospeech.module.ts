import { Module } from '@nestjs/common';
import { TexttospeechService } from './texttospeech.service';
import { TexttospeechController } from './texttospeech.controller';

@Module({
  controllers: [TexttospeechController],
  providers: [TexttospeechService],
})
export class TexttospeechModule {}
