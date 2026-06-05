import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizStudyGuidesController } from './quiz-study-guides.controller';
import { StudyGuide } from './entities/study-guide.entity';

@Module({
    imports: [TypeOrmModule.forFeature([StudyGuide])],
    controllers: [QuizStudyGuidesController],
    providers: [],
})
export class QuizStudyGuidesModule {}
