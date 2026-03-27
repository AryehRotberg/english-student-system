import { Vocabulary } from '../entities/vocabulary.entity';
import { ApiProperty } from '@nestjs/swagger';

export class VocabularyResponseDto {
    @ApiProperty()
    readonly id: string;
    @ApiProperty()
    readonly word: string | null;
    @ApiProperty()
    readonly meaning: string | null;
    @ApiProperty()
    readonly example: string | null;
    @ApiProperty()
    readonly translation: string | null;
    @ApiProperty()
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
