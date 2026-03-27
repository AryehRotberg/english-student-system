import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis.client';
import { PostgresService } from '../../config/postgres.client';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { VocabularyResponseDto } from './dto/vocabulary-response.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import {
    createVocabularyQuery,
    getAllVocabularyQuery,
} from './vocabulary.queries';

@Injectable()
export class VocabularyService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findAll(): Promise<VocabularyResponseDto[]> {
        return this.redisService.getOrFetch<VocabularyResponseDto[]>(
            'vocabulary:all',
            async () => {
                const vocabulary = await this.postgresService.query<Vocabulary>(
                    getAllVocabularyQuery,
                );
                return VocabularyResponseDto.fromEntities(vocabulary);
            },
        );
    }

    async create(
        createVocabularyDto: CreateVocabularyDto,
    ): Promise<VocabularyResponseDto> {
        const { word, meaning, example, translation } = createVocabularyDto;

        await this.redisService.invalidate('vocabulary:all');

        const [result] = await this.postgresService.query<Vocabulary>(
            createVocabularyQuery,
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
