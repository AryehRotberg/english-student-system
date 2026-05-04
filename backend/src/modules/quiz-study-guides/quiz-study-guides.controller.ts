import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudyGuide } from './entities/study-guide.entity';

@Controller('quiz-study-guides')
export class QuizStudyGuidesController {
    constructor(
        @InjectRepository(StudyGuide)
        private readonly studyGuideRepo: Repository<StudyGuide>,
    ) {}

    @Get(':quizId')
    async findByQuizId(@Param('quizId', ParseUUIDPipe) quizId: string) {
        return this.studyGuideRepo
            .createQueryBuilder('sg')
            .innerJoin('quiz_study_guides', 'qsg', 'qsg.topic_id = sg.id')
            .where('qsg.quiz_id = :quizId', { quizId })
            .orderBy('sg.topic', 'ASC')
            .getMany();
    }
}
