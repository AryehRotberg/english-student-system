import { Injectable } from '@nestjs/common';
import { RedisService } from '../../config/redis.client';
import { PostgresService } from '../../config/postgres.client';
import { CreateTextDto } from './dto/create-text.dto';
import { TextResponseDto } from './dto/text-response.dto';
import { Text } from './entities/text.entity';
import { createTextQuery, getAllTextsQuery } from './texts.queries';

@Injectable()
export class TextsService {
    constructor(
        private readonly postgresService: PostgresService,
        private readonly redisService: RedisService,
    ) {}

    async findAll(): Promise<TextResponseDto[]> {
        return this.redisService.getOrFetch('texts:all', async () => {
            const texts =
                await this.postgresService.query<Text>(getAllTextsQuery);
            return TextResponseDto.fromEntities(texts);
        });
    }

    async create(createTextDto: CreateTextDto): Promise<TextResponseDto> {
        const { title, content, level } = createTextDto;

        await this.redisService.invalidate('texts:*');

        const [result] = await this.postgresService.query<Text>(
            createTextQuery,
            [title, content, level],
        );

        return TextResponseDto.fromEntity(result);
    }
}
