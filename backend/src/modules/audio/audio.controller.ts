import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Res,
    UseGuards,
} from '@nestjs/common';
import { AuthGuard, TeacherGuard } from '../../auth/guards/auth.guard';
import { SupabaseService } from '../../config/supabase.client';
import { AudioService } from './audio.service';
import { AudioCreateSpeechDto } from './dto/audio.create-speech.dto';
import { AudioDownloadDto } from './dto/audio.download.dto';

@Controller('audio')
export class AudioController {
    constructor(
        private readonly audioService: AudioService,
        private readonly supabaseService: SupabaseService,
    ) {}

    @Post('tts')
    @UseGuards(TeacherGuard)
    async convertTextToSpeech(@Body() dto: AudioCreateSpeechDto, @Res() res) {
        const audioBuffer = await this.audioService.textToSpeech(dto);
        res.set({
            'Content-Type': 'audio/mpeg',
            'Content-Length': audioBuffer.length,
        });
        res.send(audioBuffer);
    }

    @Get('download')
    @UseGuards(AuthGuard)
    async downloadAudio(@Res() res, @Query() dto: AudioDownloadDto) {
        const { bucket, path } = dto;

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
