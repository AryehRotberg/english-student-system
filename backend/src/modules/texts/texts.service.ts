import { Injectable } from '@nestjs/common';
import { PostgresService } from '../../config/postgres.client';
import { TextCreateDto } from './dto/text.create.dto';
import { TextResponseDto } from './dto/text.response.dto';

@Injectable()
export class TextsService {
    constructor(private readonly pgService: PostgresService) {}

    async findAll(): Promise<TextResponseDto[]> {
        return await this.pgService.query<any>(
            this.pgService.getSql(__dirname, 'text.find-all.sql'),
        );
    }

    async create(createTextDto: TextCreateDto): Promise<TextResponseDto> {
        const { title, content, level } = createTextDto;

        const [result] = await this.pgService.query<TextResponseDto>(
            this.pgService.getSql(__dirname, 'text.create.sql'),
            [title, content, level],
        );
        return result;
    }
}
