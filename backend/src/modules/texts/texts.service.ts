import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { CreateTextDto } from './dto/create-text.dto';
import { TextResponseDto } from './dto/text-response.dto';
import { Text } from './entities/text.entity';

@Injectable()
export class TextsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<TextResponseDto[]> {
        const texts = await this.pgService.query<Text>(
            this.pgService.getSql(__dirname, 'get-all-texts.sql'),
        );
        return TextResponseDto.fromEntities(texts);
    }

    async create(createTextDto: CreateTextDto): Promise<TextResponseDto> {
        const { title, content, level } = createTextDto;

        const [result] = await this.pgService.query<Text>(
            this.pgService.getSql(__dirname, 'create-text.sql'),
            [title, content, level],
        );

        return TextResponseDto.fromEntity(result);
    }
}
