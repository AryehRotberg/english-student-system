import { Vocabulary } from '../entities/vocabulary.entity';

export class VocabularyResponseDto {
    readonly id: string;
    readonly word: string | null;
    readonly meaning: string | null;
    readonly example: string | null;
    readonly translation: string | null;
    readonly createdAt: Date;

    private constructor(props: VocabularyResponseDto) {
        Object.assign(this, props);
    }

    static fromEntity(vocabulary: Vocabulary): VocabularyResponseDto {
        return new VocabularyResponseDto({
            id: vocabulary.id,
            word: vocabulary.word,
            meaning: vocabulary.meaning,
            example: vocabulary.example,
            translation: vocabulary.translation,
            createdAt: vocabulary.createdAt,
        });
    }

    static fromEntities(vocabulary: Vocabulary[]): VocabularyResponseDto[] {
        return vocabulary.map(VocabularyResponseDto.fromEntity);
    }
}
