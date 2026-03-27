import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVocabularyTopicWordDto {
    @IsUUID()
    @ApiProperty()
    vocabularyId: string;

    @IsUUID()
    @ApiProperty()
    topicId: string;
}
