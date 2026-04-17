import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { VocabularyCreateDto } from './dto/vocabulary.create.dto';
import { VocabularyResponseDto } from './dto/vocabulary.response.dto';

@Injectable()
export class VocabularyService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<VocabularyResponseDto[]> {
        return await this.pgService.query<VocabularyResponseDto>(
            this.pgService.getSql(__dirname, 'vocabulary.find-all.sql'),
        );
    }

    async create(
        createVocabularyDto: VocabularyCreateDto,
    ): Promise<VocabularyResponseDto> {
        const { word, meaning, example, translation } = createVocabularyDto;

        const [result] = await this.pgService.query<VocabularyResponseDto>(
            this.pgService.getSql(__dirname, 'vocabulary.create.sql'),
            [
                word ?? null,
                meaning ?? null,
                example ?? null,
                translation ?? null,
            ],
        );
        return result;
    }
}
