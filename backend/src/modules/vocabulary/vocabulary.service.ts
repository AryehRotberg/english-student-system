import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { VocabularyResponseDto } from './dto/vocabulary-response.dto';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabularyService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<VocabularyResponseDto[]> {
        const vocabulary = await this.pgService.query<Vocabulary>(
            this.pgService.getSql(__dirname, 'get-all-vocabulary.sql'),
        );
        return VocabularyResponseDto.fromEntities(vocabulary);
    }

    async create(
        createVocabularyDto: CreateVocabularyDto,
    ): Promise<VocabularyResponseDto> {
        const { word, meaning, example, translation } = createVocabularyDto;

        const [result] = await this.pgService.query<Vocabulary>(
            this.pgService.getSql(__dirname, 'create-vocabulary.sql'),
            [
                word ?? null,
                meaning ?? null,
                example ?? null,
                translation ?? null,
            ],
        );

        return VocabularyResponseDto.fromEntity(result);
    }
}
