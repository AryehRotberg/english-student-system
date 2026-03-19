import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { VocabularyTopicWordsController } from './vocabulary-topic-words.controller';
import { VocabularyTopicWordsService } from './vocabulary-topic-words.service';

@Module({
    imports: [AuthModule],
    controllers: [VocabularyTopicWordsController],
    providers: [VocabularyTopicWordsService],
})
export class VocabularyTopicWordsModule {}
