import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vocabulary } from './entities/vocabulary.entity';
import { AuthModule } from '../../auth/auth.module';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';

@Module({
    imports: [AuthModule, TypeOrmModule.forFeature([Vocabulary])],
    controllers: [VocabularyController],
    providers: [VocabularyService],
})
export class VocabularyModule {}
