import { IsUUID } from 'class-validator';

export class GetVocabularyTopicWordsFilterDto {
    @IsUUID()
    topicId: string;
}
