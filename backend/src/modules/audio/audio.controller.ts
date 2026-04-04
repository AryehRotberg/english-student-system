import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard, TeacherGuard } from '../../auth/auth.guard';
import { SupabaseService } from '../../config/supabase.client';
import { AudioService } from './audio.service';
import { CreateSpeechDto } from './dto/create-speech-dto';
import { DownloadAudioDto } from './dto/download-audio-dto';

@Controller('audio')
export class AudioController {
    constructor(
        private readonly audioService: AudioService,
        private readonly supabaseService: SupabaseService,
    ) {}

    @Post('tts')
    @UseGuards(TeacherGuard)
    async convertTextToSpeech(
        @Body() createSpeechDto: CreateSpeechDto,
        @Res() res,
    ) {
        const audioBuffer =
            await this.audioService.textToSpeech(createSpeechDto);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    }

    @Get('download')
    @UseGuards(AuthGuard)
    async downloadAudio(
        @Res() res,
        @Query() downloadAudioDto: DownloadAudioDto,
    ) {
        const { bucket, path } = downloadAudioDto;

        const audioBuffer = await this.supabaseService.loadFromBucket(
            bucket,
            path,
        );
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    }
}
