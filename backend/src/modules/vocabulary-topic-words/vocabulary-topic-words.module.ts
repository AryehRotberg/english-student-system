import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { VocabularyTopicWord } from './entities/vocabulary-topic-word.entity';
import { VocabularyTopicWordsController } from './vocabulary-topic-words.controller';
import { VocabularyTopicWordsService } from './vocabulary-topic-words.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([VocabularyTopicWord])],
    controllers: [VocabularyTopicWordsController],
    providers: [VocabularyTopicWordsService],
})
export class VocabularyTopicWordsModule {}
