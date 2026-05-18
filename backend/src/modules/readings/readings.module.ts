import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../auth/auth.module';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { VocabularyTopic } from '../vocabulary-topics/entities/vocabulary-topic.entity';
import { Reading } from './entities/reading.entity';
import { ReadingsController } from './readings.controller';
import { ReadingsService } from './readings.service';

@Module({
    imports: [
        AuthModule,
        TypeOrmModule.forFeature([Reading, Quiz, VocabularyTopic]),
    ],
    controllers: [ReadingsController],
    providers: [ReadingsService],
})
export class ReadingsModule {}
