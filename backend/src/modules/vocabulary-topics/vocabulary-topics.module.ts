import { Module } from '@nestjs/common';
import { AuthModule } from '../../auth/auth.module';
import { VocabularyTopicsController } from './vocabulary-topics.controller';
import { VocabularyTopicsService } from './vocabulary-topics.service';

@Module({
    imports: [AuthModule],
    controllers: [VocabularyTopicsController],
    providers: [VocabularyTopicsService],
})
export class VocabularyTopicsModule {}
