import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { VocabularyTopic } from '../vocabulary-topics/entities/vocabulary-topic.entity';
import { Text } from './entities/text.entity';
import { AuthModule } from '../../auth/auth.module';
import { TextsController } from './texts.controller';
import { TextsService } from './texts.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Text, Quiz, VocabularyTopic])],
    controllers: [TextsController],
    providers: [TextsService],
})
export class TextsModule {}
