import { IsUUID } from 'class-validator';

export class CreateVocabularyTopicWordDto {
    @IsUUID()
    vocabularyId: string;

    @IsUUID()
    topicId: string;
}
