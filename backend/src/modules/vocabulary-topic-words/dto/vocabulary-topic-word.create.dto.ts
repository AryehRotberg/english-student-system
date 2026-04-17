import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VocabularyTopicWordCreateDto {
    @IsUUID()
    @ApiProperty()
    vocabularyId: string;

    @IsUUID()
    @ApiProperty()
    topicId: string;
}
