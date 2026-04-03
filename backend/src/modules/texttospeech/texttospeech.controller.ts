import { Body, Controller, Post, Res } from '@nestjs/common';
import { CreateSpeechDto } from './dto/create-speech-dto';
import { TexttospeechService } from './texttospeech.service';

@Controller('texttospeech')
export class TexttospeechController {
    constructor(private readonly texttospeechService: TexttospeechService) {}

    @Post('convert')
    async convertTextToSpeech(
        @Body() createSpeechDto: CreateSpeechDto,
        @Res() res,
    ) {
        const audioBuffer = await this.texttospeechService.textToSpeech(createSpeechDto);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    }
}
