import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VocabularyTopic } from './entities/vocabulary-topic.entity';
import { AuthModule } from '../../auth/auth.module';
import { VocabularyTopicsController } from './vocabulary-topics.controller';
import { VocabularyTopicsService } from './vocabulary-topics.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([VocabularyTopic])],
    controllers: [VocabularyTopicsController],
    providers: [VocabularyTopicsService],
})
export class VocabularyTopicsModule {}
